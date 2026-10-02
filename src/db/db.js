import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb Connected Successfully!!");

    } catch (error) {
        console.error("Mongodb Connection Failed: ", error);
        process.exit(1);
    }
}

export default connectDB;