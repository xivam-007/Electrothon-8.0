require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("./connection");
const connectDB = require("../config/db");
const axios = require("axios");
const MoveProvider = require("../models/moverModel"); // Import the schema!

async function startWorker() {
  try {
    // MongoDB connect
    await connectDB();
    console.log("🚀 Worker started");

    const worker = new Worker(
      "moveQueue",
      async (job) => {
        try {
          console.log("📦 Job Received in Worker:", job.data);
          
          // 1. Extract the EXACT variables sent by the controller's addMoveJob
          const { 
            moveId, 
            pickupLocation, 
            dropoffLocation, 
            weight, 
            price, 
            distance, 
            pickupDate, 
            pickupTime 
          } = job.data;

          console.log(`🤖 Waking up Shivam's Python AI for Move: ${moveId}...`);

          // 👇 NEW: Fetch the scraped movers for this specific move from MongoDB
          const moversForThisMove = await MoveProvider.find({ moveId: moveId });
          console.log("move provider fetching done: ", moversForThisMove)
          
          // Grab the first mover for the hackathon demo
          const topMover = moversForThisMove[1]; 

          console.log("topmover: ", topMover)

          if (!topMover) {
             console.log("❌ No movers found in DB for this move!");
             return; // Stop the function so it doesn't crash trying to read undefined
          }

          // 2. Build the payload to perfectly match Python's MoveRequest BaseModel
          console.log("building the payload")
          const payload = {
            move_id: String(moveId),
            pickup_location: pickupLocation || "Unknown",
            drop_location: dropoffLocation || "Unknown",
            weight: String(weight || "0"),
            target_price: Number(price || 15000), 
            distance_km: String(distance || "0"), 
            pickup_date: pickupDate || "soon",
            pickup_time: pickupTime || "morning",
            
            // 👇 Now topMover is successfully defined and fetched!
            moverId: String(topMover._id || "N/A"),
            rating: Number(topMover.rating || 3.0),
            total_reviews: Number(topMover.totalRating || 50)
          };

          console.log("payload is done:", payload)

          // 3. Hit the Python FastAPI server
          // ⚠️ MAKE SURE THIS IS THE PORT 8080 PYTHON NGROK URL!
          const aiServerUrl = 'http://localhost:8080/trigger_negotiation'; 

          const response = await axios.post(aiServerUrl, payload);
          
          console.log("✅ Python AI Triggered! Phone is ringing...");
          console.log("Python Response:", response.data);

        } catch (error) {
          console.error("❌ Worker error triggering AI:", error.message);
          // This will print the exact FastAPI error if it gets blocked again!
          if (error.response && error.response.data) {
            console.error("FastAPI Error Details:", JSON.stringify(error.response.data, null, 2));
          }
        }
      },
      { connection }
    );
  } catch (error) {
    console.error("❌ Worker startup error:", error);
  }
}


module.exports = startWorker