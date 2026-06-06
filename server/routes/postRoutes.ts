import express from "express";
import { getPosts, schedulePost, generateAIContent, deletePost } from "../controllers/PostController.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/schedule", schedulePost);
router.post("/generate", generateAIContent);
router.delete("/:id", deletePost);

export default router;
