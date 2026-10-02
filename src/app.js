import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// import router
import authRouter from "./routes/user.routes.js";
import todoRouter from "./routes/todo.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";

app.use("/api/v1/users", authRouter);
app.use("/api/v1/todos", todoRouter);
app.use(globalErrorHandler);

export default app;
