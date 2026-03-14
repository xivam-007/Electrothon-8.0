const twilio = require("twilio");

const client = twilio(
 process.env.TWILIO_ACCOUNT_SID,
 process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (phone, message) => {

 try {

  await client.messages.create({

   from: "whatsapp:+14155238886",
   to: `whatsapp:${phone}`,
   body: message

  });

  console.log("WhatsApp message sent");

 } catch (error) {

  console.error("WhatsApp send failed", error);

 }

};

module.exports = sendWhatsAppMessage;