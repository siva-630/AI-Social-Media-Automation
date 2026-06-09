import type { Request, Response, NextFunction } from "express";
import Post from "../models/Post.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import zernio from "../config/zernio.js";
import { v2 as cloudinary } from "cloudinary";
// @desc    Get all posts for a user
// @route   GET /api/posts
// @access  Private
export const getPosts = async (
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

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a scheduled post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    // Log the activity
    await Activity.create({
      user: post.user,
      type: "post_deleted",
      description: `Deleted a scheduled post`,
      relatedId: post._id,
    });

    res.status(200).json({ message: "Post removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a new post
// @route   POST /api/posts/schedule
// @access  Private
export const schedulePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, content, platforms, scheduledDate, localScheduleString, mediaUrls, mediaBase64, timezone, publishNow } = req.body;

    if (!userId || !content || !platforms || (!publishNow && !scheduledDate)) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Process base64 media if provided
    let finalMediaUrls = mediaUrls || [];
    if (mediaBase64) {
      cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
      });
      try {
        const uploadResult = await cloudinary.uploader.upload(mediaBase64, { folder: "social_scheduler" });
        finalMediaUrls = [uploadResult.secure_url];
      } catch (err: any) {
        console.error("Cloudinary upload failed in scheduler", err);
        res.status(400);
        throw new Error(`Cloudinary upload failed: ${err.message || 'Check your Cloudinary credentials'}`);
      }
    }

    // Create the post in the database
    const newPost = await Post.create({
      user: userId,
      content,
      platforms: platforms.map((p: any) => typeof p === 'string' ? p : p.platform),
      scheduledDate: new Date(scheduledDate),
      mediaUrls: finalMediaUrls,
      status: publishNow ? "published" : "scheduled",
    });

    // Send to Zernio API to officially schedule it
    if (user.profileId && platforms.length > 0 && typeof platforms[0] === 'object') {
      try {
        await zernio.posts.createPost({
          body: {
            content,
            platforms: platforms.map((p: any) => ({
              platform: p.platform,
              accountId: p.accountId
            })),
            scheduledFor: publishNow ? undefined : (localScheduleString || scheduledDate),
            timezone: publishNow ? undefined : timezone,
            publishNow: publishNow ? true : undefined,
            mediaItems: (finalMediaUrls && finalMediaUrls.length > 0) 
                ? finalMediaUrls.map((url: string) => ({ type: "image", url })) 
                : undefined,
          }
        });
      } catch (err: any) {
        console.error("Zernio Scheduling Error:", err);
        // Clean up the DB record since it failed
        await Post.findByIdAndDelete(newPost._id);
        res.status(400);
        throw new Error(`Zernio API Error: ${err.message || 'Failed to publish to Instagram'}`);
      }
    }

    // Log the activity
    await Activity.create({
      user: userId,
      type: "post_scheduled",
      description: `Scheduled a post for ${newPost.platforms.join(", ")}`,
      relatedId: newPost._id,
    });

    res.status(201).json({
      message: "Post scheduled successfully",
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Content
// @route   POST /api/posts/generate
// @access  Private
export const generateAIContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error("Prompt is required");
    }

    // Mocking AI Generation (Since we don't have an OpenAI key set up here)
    const generatedText = `Here is an amazing ${tone || 'professional'} post about: ${prompt} 🚀 #SocialMedia #Growth`;
    let mediaUrl = null;

    if (generateImage) {
      // Mocking an image URL
      mediaUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
    }

    res.status(200).json({
      content: generatedText,
      mediaUrl,
    });
  } catch (error) {
    next(error);
  }
};
