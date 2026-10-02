import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Todo = mongoose.model("Todo", todoSchema);