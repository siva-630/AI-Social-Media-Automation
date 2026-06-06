import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";



import postRoutes from "./routes/postRoutes.js";
import generationRoutes from "./routes/generationRoutes.js";
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 3000;

app.get("/hai", (req: Request, res: Response) => {
    res.send("Hello World!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/generations", generationRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});