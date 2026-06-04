import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";



const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 3000;

app.get("/hai", (req: Request, res: Response) => {
    res.send("Hello World!");
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});