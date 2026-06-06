import express from "express";
import { generatePostContent, getGenerations } from "../controllers/generationController.js";

const router = express.Router();

router.post("/generate", generatePostContent);
router.get("/user", getGenerations);

export default router;
