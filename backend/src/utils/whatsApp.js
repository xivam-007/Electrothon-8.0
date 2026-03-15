// whatsapp.js
require("dotenv").config();
const twilio = require("twilio");
// TODO: Replace with the actual path to your MongoDB Mongoose model
const Move = require("../models/moveModel"); 

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const conversationState = {};

// Status progression levels updated to include PAYMENT
const STATUS_LEVELS = {
  "CONFIRMED": 0,
  "PAYMENT": 1,
  "INTRANSIT": 2,
  "DELIVERED": 3
};

const sendMessage = async (phoneNumber, body) => {
  return await client.messages.create({
    from: `whatsapp:+14155238886`,
    to: `whatsapp:+91${phoneNumber}`,
    body,
  });
};

// ── Send Quick Reply Template (Confirm / Update buttons) ──────
const sendChoiceTemplate = async (phoneNumber) => {
  return await client.messages.create({
    from: `whatsapp:+14155238886`,
    to: `whatsapp:+91${phoneNumber}`,
    contentSid: "HX696bda6a026cda926329974f6abdef50",  // your template
    contentVariables: JSON.stringify({}),               // add variables if your template has any
  });
};

// ── Send rejection ────────────────────────────────────────────
const sendNo = async (phoneNumber) => {
  try {
    const message = await sendMessage(
      phoneNumber,
      "We regret to inform you that we are unable to proceed with the deal for the movement with you. Thank you for your patience and understanding."
    );
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Twilio Error:", error.message);
    return { success: false, error: error.message };
  }
};

// ── Send congratulations + Quick Reply template ───────────────
const sendBestMover = async (phoneNumber, move) => {
  console.log("sending the best mover things", phoneNumber);
  try {
    const phoneStr = String(phoneNumber);

    conversationState[`91${phoneStr}`] = {
      step: "awaiting_choice",
      moveId: move._id || move.id, 
      currentStatus: move.status,  
      dealDetails: {
        items:    move.weight,
        date:     move.pickupDate,
        pickupTime: move.pickupTime, 
        price:    move.price ? `₹${move.price}` : "N/A",
        from:     move.pickupLocation,
        to:       move.dropoffLocation,
        distance: move.distance || "N/A",
        vehicle:  move.vehicleId,
      },
    };

    await sendMessage(phoneStr, "🎉 Congratulations! We want to close the deal with you.");
    await new Promise((r) => setTimeout(r, 1000));

    const state = conversationState[`91${phoneStr}`];
    const deal  = state.dealDetails;

    await sendMessage(
      phoneStr,
      `📦 *Here are your deal details:*\n\n` +
      `🚛 Vehicle: ${deal.vehicle}\n` +
      `📦 Weight:  ${deal.items}\n` +
      `📍 From:    ${deal.from}\n` +
      `📍 To:      ${deal.to}\n` +
      `📏 Distance:${deal.distance}\n` +
      `🗓 Pickup:  ${deal.date}\n` +
      `⏳ Time:    ${deal.pickupTime}\n` +
      `💰 Price:   ${deal.price}`
    );

    await new Promise((r) => setTimeout(r, 1000));
    await sendChoiceTemplate(phoneStr);

    return { success: true };
  } catch (error) {
    console.error("Twilio Error:", error.message);
    return { success: false, error: error.message };
  }
};

// ── NEW: Triggered when user completes payment ────────────────
const notifyPaymentCompleted = async (phoneNumber, moveId) => {
  try {
    const phoneStr = String(phoneNumber);
    const stateKey = `91${phoneStr}`;

    // Ensure state exists (fallback in case server restarted between confirmation and payment)
    if (!conversationState[stateKey]) {
      conversationState[stateKey] = {
        moveId: moveId,
        dealDetails: {}
      };
    }

    // Set state to awaiting_status so we can listen for INTRANSIT or DELIVERED
    conversationState[stateKey].step = "awaiting_status";
    conversationState[stateKey].currentStatus = "PAYMENT";

    await sendMessage(
      phoneStr,
      "✅ *The payment from the user side is done.*\n\n" +
      "Please move to the pickup location.\n\n" +
      "📌 *Move Status Updates:*\nAs you proceed, please update the status of the move by replying with one of the following exactly as written:\n\n" +
      "• *INTRANSIT*\n• *DELIVERED*"
    );
    return { success: true };
  } catch (error) {
    console.error("Twilio Error in notifyPaymentCompleted:", error.message);
    return { success: false, error: error.message };
  }
};

// ── Handle incoming replies ───────────────────────────────────
const handleReply = async (fromRaw, incomingMessage) => {
  try {
    console.log(`[handleReply] Raw Message received: "${incomingMessage}"`);
    
    const fullNumber = fromRaw.replace("whatsapp:+91", "");  
    const stateKey   = fromRaw.replace("whatsapp:+", "");    

    const state = conversationState[stateKey];
    
    const reply = incomingMessage ? incomingMessage.trim().toLowerCase() : "";       

    console.log(`[handleReply] Parsed reply: "${reply}", Current State Step: ${state ? state.step : "None"}`);

    if (!state) {
      await sendMessage(fullNumber, "Sorry, we don't have an active deal session for your number.");
      return;
    }

    // 1. Handling the initial Confirmation or Update selection
    if (state.step === "awaiting_choice") {
      
      if (reply.includes("update")) {
        state.step = "awaiting_update";
        await sendMessage(
          fullNumber,
          "✏️ You can only update the pickup time. Please send your new time in this format:\n\n" +
          "time: <new_time>"
        );

      } else if (reply.includes("confirm")) {
        // Change state to awaiting_payment (custom intermediate state so they can't force INTRANSIT yet)
        state.step = "awaiting_payment";
        
        try {
          await Move.findByIdAndUpdate(state.moveId, { 
            pickupTime: state.dealDetails.pickupTime,
            status: "CONFIRMED"
          });
        } catch (dbError) {
          console.error("Database update failed on confirm:", dbError.message);
        }

        await sendMessage(
          fullNumber,
          "🎊 *Great! We have closed the deal with you!*\n\n" +
          "⏳ Please wait while the user completes the payment. We will notify you here as soon as the payment is successful so you can proceed to the pickup location."
        );

      } else {
        await sendChoiceTemplate(fullNumber);
      }

    // 2. Handling the Time Update
    } else if (state.step === "awaiting_update") {
      const updated = parseUpdateMessage(reply, state.dealDetails);

      state.dealDetails = updated;
      state.step = "awaiting_choice";

      const deal = state.dealDetails;

      await sendMessage(
        fullNumber,
        `✅ *Here are your updated details:*\n\n` +
        `🗓 Date: ${deal.date}\n` +
        `📍 From: ${deal.from}\n` +
        `📍 To: ${deal.to}\n` +
        `⏳ Time: ${deal.pickupTime}\n` +
        `📦 Items: ${deal.items}\n` +
        `💰 Price: ${deal.price}`
      );

      await new Promise((r) => setTimeout(r, 800));
      await sendChoiceTemplate(fullNumber);

    // 3. Handling Live Status Updates (Intransit, Delivered)
    } else if (state.step === "awaiting_status") {
      const requestedStatus = reply.toUpperCase(); 

      // Only allow INTRANSIT or DELIVERED updates from the mover manually
      if (STATUS_LEVELS[requestedStatus] !== undefined && requestedStatus !== "CONFIRMED" && requestedStatus !== "PAYMENT") {
        const currentLevel = STATUS_LEVELS[state.currentStatus] || 0; 
        const requestedLevel = STATUS_LEVELS[requestedStatus];

        if (requestedLevel <= currentLevel) {
          await sendMessage(
            fullNumber, 
            `❌ Can't update the move status because current move's status is : ${state.currentStatus}`
          );
        } else {
          state.currentStatus = requestedStatus;

          try {
            await Move.findByIdAndUpdate(state.moveId, { status: requestedStatus });
          } catch (dbError) {
            console.error("Database status update failed:", dbError.message);
          }

          await sendMessage(fullNumber, `✅ Move status successfully updated to: *${requestedStatus}*`);

          if (requestedStatus === "DELIVERED") {
            await sendMessage(fullNumber, "🎉 Thank you for the successful delivery! This active deal is now closed.");
            delete conversationState[stateKey];
          }
        }
      } else {
        await sendMessage(
          fullNumber, 
          "⚠️ Invalid status. Please send one of the exact following statuses depending on your progress:\n• *INTRANSIT*\n• *DELIVERED*"
        );
      }
    } else if (state.step === "awaiting_payment") {
       await sendMessage(
          fullNumber, 
          "⏳ The user has not completed the payment yet. Please wait for our confirmation message before proceeding."
        );
    }
  } catch (error) {
    console.error("🔥 Error inside handleReply:", error);
  }
};

const parseUpdateMessage = (text, existing) => {
  const updated = { ...existing };
  text.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) {
      const value = rest.join(":").trim();
      const k = key.trim().toLowerCase();
      if (k === "time") {
        updated.pickupTime = value;
      }
    }
  });
  return updated;
};

// Export the new function
module.exports = { sendNo, sendBestMover, handleReply, notifyPaymentCompleted };