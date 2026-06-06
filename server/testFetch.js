

async function run() {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/social/auth-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                platform: "instagram",
                userId: "6a22624640d7b022b3dfdd06" // Invalid user ID or valid?
            })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text);
    } catch(err) {
        console.error("Fetch err:", err);
    }
}
run();
