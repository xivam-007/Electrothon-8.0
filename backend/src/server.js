require("dotenv").config();
const express = require("express");
const app = require("./app");
app.use(express.urlencoded({ extended: true })); // <-- CRITICAL FOR TWILIO WEBHOOKS
const connectDB = require("./config/db");
const { handleReply } = require("../src/utils/whatsApp");
const updateMovebyId = require("../src/controllers/dataFromAi")

const { addMoveJob } = require("./services/queueService");

const PORT = process.env.PORT || 5000;

connectDB();

addMoveJob({
 pickup: "Delhi",
 drop: "Pune"
});

app.post("/webhook", async (req, res) => {
  try {
    const { From, Body } = req.body;

    console.log(`📩 Webhook received - From: ${From} | Message: ${Body}`);

    // Call your handler
    await handleReply(From, Body);

    // Always send 200 so Twilio knows the message was received
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook route error:", error);
    // Still send 200 to Twilio so it doesn't repeatedly retry failing requests
    res.sendStatus(200); 
  }
});

app.post("/update-from-ai", updateMovebyId);

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});