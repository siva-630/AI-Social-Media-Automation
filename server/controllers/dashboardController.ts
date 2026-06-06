import type { Request, Response, NextFunction } from "express";
import Post from "../models/Post.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import zernio from "../config/zernio.js";

// @desc    Get dashboard statistics and activities
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400);
      throw new Error("User ID is required");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // 1. Fetch connected accounts count from Zernio
    let connectedAccountsCount = 0;
    if (user.profileId) {
      try {
        const { data: accountsData } = await zernio.accounts.listAccounts({
          query: { profileId: user.profileId },
        });
        connectedAccountsCount = accountsData?.accounts?.length || 0;
      } catch (err) {
        console.error("Error fetching zernio accounts for dashboard:", err);
      }
    }

    // 2. Fetch posts statistics
    const now = new Date();
    
    const scheduledPostsCount = await Post.countDocuments({ 
      user: userId, 
      status: "scheduled",
      scheduledDate: { $gt: now }
    });
    
    const publishedPostsCount = await Post.countDocuments({ 
      user: userId, 
      $or: [
        { status: "published" },
        { status: "scheduled", scheduledDate: { $lte: now } }
      ]
    });

    // 3. Fetch recent activities
    const recentActivities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Return the aggregated data
    res.status(200).json({
      stats: {
        scheduled: scheduledPostsCount,
        published: publishedPostsCount,
        connectedAccounts: connectedAccountsCount,
      },
      activities: recentActivities,
    });
  } catch (error) {
    next(error);
  }
};
