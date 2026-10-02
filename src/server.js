import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";

// connect database
connectDB()
    .then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`App is running on the port: ${PORT}`);
        })
    });