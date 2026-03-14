const Move = require("../models/moveModel");
const User = require("../models/userModel");
const { addMoveJob } = require("../services/queueService");
const twilio = require("twilio");

const handleWhatsAppMessage = async (req, res) => {

 try {

  const message = req.body.Body;

  // Twilio format: whatsapp:+919876543210
  const phone = req.body.From.replace("whatsapp:", "");

  console.log("Incoming message:", message);

  // ---------- message parsing ----------
  const pickupMatch = message.match(/from\s+(\w+)/i);
  const dropMatch = message.match(/to\s+(\w+)/i);
  const sizeMatch = message.match(/(\d+BHK)/i);

  const pickup = pickupMatch ? pickupMatch[1] : null;
  const drop = dropMatch ? dropMatch[1] : null;
  const houseSize = sizeMatch ? sizeMatch[1] : "1BHK";

  if (!pickup || !drop) {

   const twiml = new twilio.twiml.MessagingResponse();
   twiml.message("Please send message like: Shift 2BHK from Delhi to Pune");

   res.type("text/xml");
   return res.send(twiml.toString());

  }

  // ---------- find user ----------
  let user = await User.findOne({ phone });

  // ---------- create user if not exist ----------
  if (!user) {

   user = await User.create({
    name: "WhatsApp User",
    phone,
    isVerified: true
   });

  }

  // ---------- create move request ----------
  const move = await Move.create({

   pickup,
   drop,
   houseSize,
   status: "NEGOTIATING",
   moveDate: new Date(),
   user: user._id

  });

  console.log("Move created:", move._id);

  // ---------- push job to redis ----------
  await addMoveJob({

   moveId: move._id,
   pickup,
   drop,
   houseSize

  });

  // ---------- WhatsApp reply ----------
  const twiml = new twilio.twiml.MessagingResponse();

  twiml.message(`Move request created for ${houseSize} from ${pickup} to ${drop}. We are finding movers now.`);

  res.type("text/xml");
  res.send(twiml.toString());

 } catch (error) {

  console.error(error);

  const twiml = new twilio.twiml.MessagingResponse();

  twiml.message("Something went wrong. Please try again.");

  res.type("text/xml");
  res.send(twiml.toString());

 }

};

module.exports = { handleWhatsAppMessage };




