import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fetch from "node-fetch";

const client = new Client({
    authStrategy: new LocalAuth() // saves session locally
});

// Generate QR code for first login
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
    console.log("Scan QR code with WhatsApp mobile app");
});

// Ready
client.on("ready", () => {
    console.log("WhatsApp bot is ready!");
});

// Handle incoming messages
client.on("message", async msg => {
    console.log(`Message from ${msg.from}: ${msg.body}`);

    try {
        // Send message to your existing Express API
        const response = await fetch("http://localhost:5000/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: msg.from, // using WhatsApp number as session
                userId: msg.from,
                text: msg.body
            })
        });

        const data = await response.json();
        msg.reply(data.response); // reply on WhatsApp
    } catch (err) {
        console.error("Error sending message to backend:", err);
        msg.reply("Sorry, something went wrong.");
    }
});

// Initialize client
client.initialize();
