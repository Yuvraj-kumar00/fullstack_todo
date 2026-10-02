import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

// connect database
connectDB()
    .then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`App is running on the port: ${PORT}`);
        })
    });