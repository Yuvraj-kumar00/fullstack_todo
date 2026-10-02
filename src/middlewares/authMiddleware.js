import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/api-response.js";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
})

const verifyToken = asyncHandler(function(req, res, next) {
    // 1. get token from user using headers
    const authHeader = req.headers.Authorization || req.headers.authorization;

    // 2. validate 
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(400).json(new ApiResponse(400, "Unauthorized user"))
    }

    // 3. extract token
    const token = authHeader.split(" ")[1];

    // 4. send message if token is empty
    if (!token) {
        return res.status(400).json(new ApiResponse(400, "No token , authorization denied"));
    }

    // 5. verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);

    // 6. send message if decoded is empty
    if (!decoded) {
        return res.status(400).json(new ApiResponse(400, "Invalid access token"));
    }

    // 7. set a key value inside req object
    req.user = decoded;
    console.log(decoded);
    

    next()
})

export { verifyToken }