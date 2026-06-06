import type { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";
import { InferenceClient } from "@huggingface/inference";
import Generation from "../models/Generation.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generatePostContent = async (req: Request, res: Response) => {
    try {
        const { prompt, tone = "Professional", generateImage = true, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key is not configured" });
        }

        // Generate text using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const fullPrompt = `Write a very concise and simple social media post about: "${prompt}". 
        Use a ${tone} tone. Keep it short, direct, and summarizing. Do not include any explanations or extra conversational text. 
        Add relevant hashtags at the very bottom.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const textContent = response.text();

        // Generate an image URL using Hugging Face FLUX model
        let mediaUrl = "";
        if (generateImage) {
            try {
                const hfClient = new InferenceClient(process.env.HF_TOKEN);
                const imagePrompt = `A high quality image for social media post about: ${prompt}, tone: ${tone}`;
                
                const imageBlob = await hfClient.textToImage({
                    model: "black-forest-labs/FLUX.1-schnell",
                    inputs: imagePrompt,
                });

                const arrayBuffer = await imageBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Data = buffer.toString("base64");
                const dataUri = `data:image/jpeg;base64,${base64Data}`;
                
                // Upload to Cloudinary for permanent storage
                cloudinary.config({ 
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
                    api_key: process.env.CLOUDINARY_API_KEY, 
                    api_secret: process.env.CLOUDINARY_API_SECRET 
                });

                const uploadResult = await cloudinary.uploader.upload(dataUri, { folder: "social_generations" });
                mediaUrl = uploadResult.secure_url;
            } catch (err: any) {
                console.error("Image generation or upload failed", err);
                return res.status(400).json({ message: `Image generation error: ${err.message || 'Hugging Face / Cloudinary error'}` });
            }
        }

        // Save to Database
        const newGeneration = new Generation({
            user: userId,
            prompt,
            content: textContent,
            mediaUrl: mediaUrl,
            mediaType: mediaUrl ? "image" : "",
            tone
        });

        await newGeneration.save();

        res.status(201).json({
            message: "Content generated successfully",
            generation: newGeneration
        });
    } catch (error: any) {
        console.error("Error generating content:", error);
        res.status(500).json({ message: "Server error during generation", error: error.message });
    }
};

export const getGenerations = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const generations = await Generation.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({ generations });
    } catch (error: any) {
        console.error("Error fetching generations:", error);
        res.status(500).json({ message: "Server error while fetching generations", error: error.message });
    }
};
