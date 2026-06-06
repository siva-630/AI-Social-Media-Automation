import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  mediaUrls: string[];
  status: "scheduled" | "published" | "failed";
  platforms: string[];
  scheduledDate: Date;
  publishedDate?: Date;
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    mediaUrls: [{ type: String }],
    status: {
      type: String,
      enum: ["scheduled", "published", "failed"],
      default: "scheduled",
    },
    platforms: [{ type: String }],
    scheduledDate: { type: Date, required: true },
    publishedDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
