import { Zernio } from '@zernio/node';

const zernio = new Zernio({
  apiKey: "sk_a8187f23c9be7fc36d425c3447284dba8470d048ef56f1a7ede0462178c9fc0d"
});

async function test() {
    try {
        console.log("Testing Zernio Key...");
        const res = await zernio.profiles.createProfile({
            body: { name: "Test User" }
        });
        console.log("Success:", res.data);
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}

test();
