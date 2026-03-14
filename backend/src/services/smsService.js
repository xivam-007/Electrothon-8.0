const twilio = require("twilio");

const client = twilio(
 process.env.TWILIO_ACCOUNT_SID,
 process.env.TWILIO_AUTH_TOKEN
);



const sendSMS = async (phone, otp) => {

 try {

  await client.messages.create({
   body: `Your MakhanMove OTP is ${otp}`,
   from: process.env.TWILIO_PHONE_NUMBER,
   to: phone
  });

  console.log("OTP sent to phone");

 } catch (error) {

  console.error("SMS failed", error);

 }

};

module.exports = sendSMS;