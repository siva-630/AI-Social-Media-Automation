import express from "express";
import { registerUser, loginUser, resetPassword, googleAuth } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);

export default router;
