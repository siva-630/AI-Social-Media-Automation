import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({});
    
    try {
        const response = await fetch("http://127.0.0.1:3000/api/social/auth-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                platform: "instagram",
                userId: user._id.toString()
            })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text);
    } catch(err) {
        console.error("Fetch err:", err);
    }
    mongoose.disconnect();
}
run();
