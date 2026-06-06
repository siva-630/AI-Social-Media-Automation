import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany({}, { $unset: { profileId: 1 } });
    console.log("Cleared profileIds from users. Modified:", result.modifiedCount);
    mongoose.disconnect();
}
run();
