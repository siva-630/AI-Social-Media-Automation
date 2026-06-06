import mongoose, { Document, Schema } from "mongoose";

export interface IGeneration extends Document {
    user: mongoose.Types.ObjectId;
    prompt: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    tone?: string;
    createdAt: Date;
    updatedAt: Date;
}

const generationSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        prompt: { type: String, required: true },
        content: { type: String, required: true },
        mediaUrl: { type: String, default: "" },
        mediaType: { type: String, default: "image" },
        tone: { type: String, default: "Professional" },
    },
    { timestamps: true }
);

export default mongoose.model<IGeneration>("Generation", generationSchema);
