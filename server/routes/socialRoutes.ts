import express from "express";
import { generateOAuthAuthorizationUrl, getConnectedAccounts, disconnectAccount } from "../controllers/SocialAuthController.js";

const router = express.Router();
import zernio from "../config/zernio.js";

router.get("/debug", (req, res) => {
    res.json({ apiKey: (zernio as any).apiKey });
});

router.post("/auth-url", generateOAuthAuthorizationUrl);
router.get("/accounts", getConnectedAccounts);
router.delete("/accounts/:accountId", disconnectAccount);

export default router;
