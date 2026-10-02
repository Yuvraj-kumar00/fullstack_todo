import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: null,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpiry: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["admin", "user",],
        default: "user",
    },
}, {timestamps: true});

userSchema.pre("save", async function() {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    };
});

userSchema.methods.generateAccessToken = function(session) {
    return jwt.sign(
            {
                _id: this._id,
                role: this.role,
                sessionId: session._id,
            },
            process.env.JWT_ACCESS_SECRET_KEY,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
            {
                _id: this._id,
                user: this,
            },
            process.env.JWT_REFRESH_SECRET_KEY,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        );
}

userSchema.methods.generateTemporaryToken = function() {
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

    const tokenExpiry = Date.now() + (20 * 60 * 1000) ; //20min

    return {
        unHashedToken,
        hashedToken,
        tokenExpiry,
    }
}

export const User = mongoose.model("User", userSchema);