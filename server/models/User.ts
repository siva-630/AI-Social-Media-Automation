import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    profileId?: string;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profileId: {
            type: String,
        },
    },
    {
        timestamps: true, // This adds createdAt and updatedAt
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
