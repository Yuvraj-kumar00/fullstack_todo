import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Todo } from "../models/todo.models.js";

const createTodo = asyncHandler(async (req, res) => {
    // take data from user
    const { description, isCompleted } = req.body;
    console.log(description, isCompleted);

    // validate data using validator

    // create todo
    const todo = await Todo.create({
        createdBy: req.user._id,
        description,
        isCompleted,
    });

    // send response
    res.status(201).json(new ApiResponse(201, "Todo created successfully", todo));
});

const getAllTodos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const allTodos = await Todo.find({ createdBy: userId });

    res.status(200).json(new ApiResponse(200, "Get all todos successfully", allTodos));
});

const getTodo = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { todoId } = req.params;

    const todo = await Todo.findOne({ createdBy: userId, _id: todoId });

    if (!todo) {
        throw new ApiError(404, "Todo not found");
    }

    res.status(200).json(new ApiResponse(200, "Get a todo successfully", todo));
});

const updateTodo = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { todoId } = req.params;
    const { description, isCompleted } = req.body;

    const todo = await Todo.findOne({ createdBy: userId, _id: todoId });

    if (!todo) {
        throw new ApiError(404, "Todo not found");
    }

    if (description !== undefined) {
        const trimmedDescription = description.trim();

        if (!trimmedDescription) {
            throw new ApiError(400, "Description is required");
        }

        todo.description = trimmedDescription;
    }

    if (isCompleted !== undefined) {
        todo.isCompleted = isCompleted;
    }

    await todo.save();

    res.status(200).json(new ApiResponse(200, "Todo updated successfully", todo));
});

const deleteTodo = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { todoId } = req.params;

    const todo = await Todo.findOneAndDelete({ createdBy: userId, _id: todoId });

    if (!todo) {
        throw new ApiError(404, "Todo not found");
    }

    res.status(200).json(new ApiResponse(200, "Todo deleted successfully", todo));
});

export { createTodo, getAllTodos, getTodo, updateTodo, deleteTodo }
