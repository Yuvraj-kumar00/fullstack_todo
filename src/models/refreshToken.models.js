import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        used: {
            type: Boolean,
            default: false,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        replacedByTokenHash: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);