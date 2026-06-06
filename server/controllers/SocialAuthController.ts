import type { Request, Response, NextFunction } from "express";
import zernio from "../config/zernio.js";
import User from "../models/User.js";

// @desc    Generate OAuth Authorization URL for a specific platform
// @route   POST /api/social/auth-url
// @access  Private
export const generateOAuthAuthorizationUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { platform, userId, redirectUrl } = req.body;

    if (!platform) {
      res.status(400);
      throw new Error("Please provide platform");
    }

    const user = userId ? await User.findById(userId).catch(() => null) : null;
    
    if (!user) {
      res.status(401);
      throw new Error("User not found or not authenticated");
    }

    let profileId = user.profileId;

    // If the user doesn't have a Zernio profile ID, create one
    if (!profileId) {
      try {
        const { data: newProfileData } = await zernio.profiles.createProfile({
          body: {
            name: user.name || user.email || "Default Profile",
          },
        });

        if (newProfileData && newProfileData.profile && newProfileData.profile._id) {
          profileId = newProfileData.profile._id;
          user.profileId = profileId;
          await user.save();
        } else {
          res.status(500);
          throw new Error("Failed to create Zernio profile");
        }
      } catch (err: any) {
        console.error("Zernio Create Profile Error:", err);
        throw err;
      }
    }

    try {
      // Generate the Connect URL for the specific platform
      const { data: connectData } = await zernio.connect.getConnectUrl({
        path: {
          platform: platform as any, 
        },
        query: {
          profileId: profileId,
          redirect_url: redirectUrl || process.env.FRONTEND_URL || "http://localhost:5173/accounts",
        },
      });

      if (connectData && connectData.authUrl) {
        res.status(200).json({
          authUrl: connectData.authUrl,
        });
      } else {
        res.status(500);
        throw new Error("Failed to generate authorization URL");
      }
    } catch (err: any) {
      console.error("Zernio Connect URL Error:", err);
      // Pass the error explicitly so we don't just return a generic 500 without details
      res.status(400);
      throw new Error(`Zernio API Error: ${err.message || "Unauthorized or Invalid API Key"}`);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all connected social accounts
// @route   GET /api/social/accounts
// @access  Private
export const getConnectedAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.query;

    const user = userId ? await User.findById(userId).catch(() => null) : null;

    if (!user || !user.profileId) {
      res.status(200).json({ accounts: [] });
      return;
    }

    try {
      const { data: accountsData } = await zernio.accounts.listAccounts({
        query: { profileId: user.profileId }
      });

      res.status(200).json({ accounts: accountsData?.accounts || [] });
    } catch (err: any) {
      console.error("Zernio List Accounts Error:", err);
      res.status(200).json({ accounts: [] }); // Return empty if API fails instead of crashing
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect a specific social account
// @route   DELETE /api/social/accounts/:accountId
// @access  Private
export const disconnectAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      res.status(400);
      throw new Error("Please provide accountId");
    }

    await zernio.accounts.deleteAccount({
      path: { accountId: accountId }
    });

    res.status(200).json({ message: "Account disconnected successfully" });
  } catch (error) {
    next(error);
  }
};

