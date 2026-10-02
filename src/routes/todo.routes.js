import {Router} from "express";
import { createTodo, getAllTodos, getTodo } from "../controllers/todo.controllers.js";
import {verifyToken} from "../middlewares/authMiddleware.js";
import { todoCreationValidation } from "../validators/index.js";
import {validate} from "../middlewares/validator.middleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const todoRouter = Router();

todoRouter.route("/create").post(verifyToken, authorizeRoles("user"), todoCreationValidation(), validate, createTodo);
todoRouter.route("/alltodos").get(verifyToken, authorizeRoles("user"), getAllTodos);
todoRouter.route("/:todoId").get(verifyToken, authorizeRoles("user"), getTodo);


export default todoRouter;