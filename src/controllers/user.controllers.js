import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { sendMail, emailVerificationMailGenContent } from "../utils/mail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Session } from "../models/session.models.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
    // 1.get data from body
    const { name, email, password } = req.body;
    // 2.validation Already handled by validator middleware

    // 3.check user already exist or not
    const existingUser = await User.findOne({ email });

    // 4. send error message if user already exist
    if (existingUser) {
        throw new ApiError(400, "User already exist");
    }

    // 5.if user not exist then register the user
    const user = await User.create({
        name,
        email,
        password,
    });

    // 6.generate verification token
    const verificationToken = user.generateTemporaryToken();

    // 7.save verification and expiry token in database
    user.verificationToken = verificationToken.hashedToken;
    user.verificationTokenExpiry = verificationToken.tokenExpiry;
    await user.save();

    // 7.send verification token to the user using email
    await sendMail({
        subject: "verification mail",
        email: email,
        mailGenContent: emailVerificationMailGenContent(
            name,
            `${process.env.BASE_URL}/api/v1/users/verify/${verificationToken.unHashedToken}`,
        ),
    });

    // 8.send res for successfull register
    res.status(201).json(new ApiResponse(201, "User register successfully"));
});

const verificationUser = asyncHandler( async (req, res) => {
    // 1. get token from user
    const {token} = req.params;
    console.log("token", token);

    // 2. validate token through validator

    // 3. hashed token
    const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");

    // 4. find user based on token
    const user = await User.findOne({verificationToken: tokenHashed});

    // 5. send error message if user not found
    if(!user) {
        throw new ApiError(400, "Invalid or expired verification token")
    }

    // 6. check expiration time
    if(!(user.verificationTokenExpiry > Date.now())) {
        throw new ApiError(400, "Verification time is expired");
    }
    
    // 7. initialize inside isVerified = true
    user.isVerified = true;

    // 8. Remove verifiaction token
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    // 9. save user
    await user.save();

    // 10. send res to the user
    res.status(200).json(new ApiResponse(200, "User verified successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    // 1. get data from user
    const { email, password } = req.body;

    // 2.validation Already handled by validator middleware

    // 3. find user based on email
    const user = await User.findOne({ email });

    // 4. If user doesn't exist, throw unauthorized error
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 5. Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 6. If password is incorrect, throw unauthorized error
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 7. check user verified or not
    if(!user.isVerified) {
        throw new ApiError(401, "Unauthorized user");
    }

    // 8. create a refresh token
    const refreshToken = user.generateRefreshToken();
    
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    
    //   9. create a session
    const session = await Session.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })
    
    // 10. create a access token
    const accessToken = user.generateAccessToken(session);

    // 11. set cookie in browser
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 12. send response
    res
        .status(200)
        .json(new ApiResponse(200, "User login successfully", accessToken));
});

const refreshToken = asyncHandler(async (req, res) => {
    // 1.Get refresh token from req.cookies
    // 2.Validate that refresh token exists and has the expected format
    // 3.Hash the received refresh token
    // 4.Find the session using the hashed token and verify that the session/user is valid
    // 5.Generate a new access token
    // 6.Generate a new refresh token
    // 7.Hash the new refresh token
    // 8.Set the new refresh token in the cookie
    // 9.Update the session in DB with the new hashed refresh token
    // 10.Send the new access token to the user in the response
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Refresh token not found"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);

    if(!decoded) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({
        refreshTokenHash,
        revoked: false,
    });

    if(!session) {
        return res.status(401).json(new ApiResponse(400, "Invalid refresh token"))
    }

    const accessToken = jwt.sign(
        {
            _id: decoded._id,
        },
        process.env.JWT_ACCESS_SECRET_KEY,
        {
            expiresIn: "15m",
        },
    );

    const newRefreshToken = jwt.sign(
        {
            _id: decoded._id,
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn: "7d",
        },
    );

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
        .status(200)
        .json(
            new ApiResponse(200, "Access token refreshed successfully", accessToken),
        );
});

const logoutUser = asyncHandler( async(req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) {
        return res.status(400).json(new ApiResponse(400, "Refresh token not found"));
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({
        refreshTokenHash,
        revoked: false
    });

    if(!session) {
        return res.status(400).json(new ApiResponse(400, "Invalid refresh token"))
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json(new ApiResponse(200, "Logged out successfully"))
})

const userProfile = asyncHandler( async(req, res) => {
    // 1. Take a user id from user
    const userId = req.user._id;

    // 2. find user based on token
    const user = await User.findById({_id: userId});

    if(!user) {
        return res.status(500).json(new ApiResponse(500, "we don't find user"));
    }
    
    res.status(200).json(new ApiResponse(200, "User getting a profile successfully", user));
})

export { registerUser, loginUser, refreshToken, logoutUser, verificationUser, userProfile };
