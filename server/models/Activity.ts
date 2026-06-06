import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: "post_scheduled" | "post_published" | "account_connected" | "account_disconnected";
  description: string;
  relatedId?: mongoose.Types.ObjectId;
}

const activitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema);
