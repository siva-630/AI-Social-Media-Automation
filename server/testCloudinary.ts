import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

async function testCloudinary(cloudName: string) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        console.log(`Testing with cloud_name: ${cloudName}`);
        const result = await cloudinary.api.ping();
        console.log("Success! Cloudinary ping response:", result);
    } catch (error) {
        console.error("Failed!", error);
    }
}

async function run() {
    await testCloudinary('schedular');
    await testCloudinary('dkedmx6mo');
}

run();
