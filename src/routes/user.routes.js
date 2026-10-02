import express, {Router} from "express";
import { loginUser, logoutUser, refreshToken, registerUser, userProfile, verificationUser } from "../controllers/user.controllers.js";
import {userLoginValidator, userRegistrationValidator, verificationTokenValidator} from "../validators/index.js";
import {validate} from "../middlewares/validator.middleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.route("/register").post(userRegistrationValidator(), validate,registerUser);

authRouter.route("/verify/:token").get(verificationTokenValidator(), validate, verificationUser);

authRouter.route("/login").post(userLoginValidator(), validate, loginUser);

authRouter.route("/refresh-token").get(refreshToken);

authRouter.route("/logout").get(logoutUser);

authRouter.route("/profile").get(verifyToken ,userProfile);

export default authRouter;