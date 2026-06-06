import { Zernio } from '@zernio/node';

const zernio = new Zernio({
  apiKey: "sk_a8187f23c9be7fc36d425c3447284dba8470d048ef56f1a7ede0462178c9fc0d"
});

async function test() {
    try {
        console.log("Testing Zernio Connect URL...");
        
        // Let's create a profile first just to have a profileId
        const { data: newProfileData } = await zernio.profiles.createProfile({
            body: { name: "Test User 2" }
        });
        const profileId = newProfileData.profile._id;
        console.log("Profile created:", profileId);

        const res = await zernio.connect.getConnectUrl({
            path: { platform: "instagram" },
            query: { profileId: profileId, redirect_url: "http://localhost:5173/accounts" }
        });
        console.log("Success Connect:", res.data);
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}

test();
