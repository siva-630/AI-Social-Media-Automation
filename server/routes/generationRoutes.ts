import express from "express";
import { generatePostContent, getGenerations, deleteGeneration } from "../controllers/generationController.js";

const router = express.Router();

router.post("/generate", generatePostContent);
router.get("/user", getGenerations);
router.delete("/:id", deleteGeneration);

export default router;
