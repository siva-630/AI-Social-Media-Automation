import mongoose, { Document, Schema } from "mongoose";

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  platform: 
    | "Twitter"
    | "LinkedIn"
    | "Facebook"
    | "Instagram"
    | "Facebook page"
    | "LinkedIn page"
    | "Instagram business";
  platformAccountId?: string;
  zernioAccountId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  status: "connected" | "disconnected";
  avatarUrl?: string;
}

const accountSchema = new Schema<IAccount>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "Twitter",
        "LinkedIn",
        "Facebook",
        "Instagram",
        "Facebook page",
        "LinkedIn page",
        "Instagram business",
      ],
    },
    platformAccountId: {
      type: String,
    },
    zernioAccountId: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "connected",
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model<IAccount>("Account", accountSchema);

export default Account;
