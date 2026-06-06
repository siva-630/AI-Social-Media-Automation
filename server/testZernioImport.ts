import zernio from './config/zernio.js';

async function test() {
    try {
        console.log("Testing Zernio Key via config/zernio.js...");
        const res = await zernio.profiles.createProfile({
            body: { name: "Test User 3" }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

test();
