// const Stripe = require("stripe");
// const Move = require("../models/moveModel");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const createPaymentIntent = async (req, res) => {
//   try {
//     const { moveId } = req.body;

//     const move = await Move.findById(moveId);
//     if (!move) {
//       return res.status(404).json({ success: false, message: "Move not found" });
//     }

//     const amount = Math.round(move.price * 100);

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: "inr",
//       metadata: { moveId: moveId.toString() },
//       automatic_payment_methods: { enabled: true },
//     });

//     res.json({ success: true, clientSecret: paymentIntent.client_secret });
//   } catch (err) {
//     console.error("Payment Intent Error:", err);
//     res.status(500).json({ success: false, message: "Failed to create payment intent" });
//   }
// };

// const checkPaymentStatus = async (req, res) => {
//   try {
//     const { paymentIntentId } = req.body;

//     if (!paymentIntentId) {
//       return res.status(400).json({ success: false, message: "paymentIntentId is required" });
//     }

//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     res.json({
//       success: true,
//       status: paymentIntent.status,
//       isPaid: paymentIntent.status === "succeeded",
//       amount: paymentIntent.amount / 100,
//       currency: paymentIntent.currency,
//       moveId: paymentIntent.metadata?.moveId || null,
//     });
//   } catch (err) {
//     console.error("Check Payment Status Error:", err);
//     res.status(500).json({ success: false, message: "Failed to check payment status", error: err.message });
//   }
// };

// const confirmPayment = async (req, res) => {
//   try {
//     const { paymentIntentId } = req.body;

//     if (!paymentIntentId) {
//       return res.status(400).json({ success: false, message: "paymentIntentId is required" });
//     }

//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     if (!paymentIntent) {
//       return res.status(404).json({ success: false, message: "Payment not found" });
//     }

//     const moveId = paymentIntent.metadata?.moveId;
//     if (!moveId) {
//       return res.status(400).json({ success: false, message: "Move ID not found in payment metadata" });
//     }

//     if (paymentIntent.status === "succeeded") {
//       // ✅ FIX: Always update regardless of current paymentStatus — no guard condition
//       const updatedMove = await Move.findByIdAndUpdate(
//         moveId,
//         {
//           paymentStatus: "paid",
//           paymentIntentId: paymentIntentId,
//           status: "PAYMENT",
//         },
//         { new: true }
//       );

//       if (!updatedMove) {
//         return res.status(404).json({ success: false, message: "Move not found" });
//       }

//       notifyPaymentCompleted(7217843077, moveId); 

//       console.log(`✅ Payment confirmed for Move ID: ${moveId}`);
//       console.log("Updated Move:", updatedMove);
//     }

//     res.json({ success: true, status: paymentIntent.status, moveId: moveId });
//   } catch (err) {
//     console.error("Confirm Payment Error:", err);
//     res.status(500).json({ success: false, message: "Failed to confirm payment", error: err.message });
//   }
// };

// module.exports = {
//   createPaymentIntent,
//   checkPaymentStatus,
//   confirmPayment,
// };

const Stripe = require("stripe");
const Move = require("../models/moveModel");
const {notifyPaymentCompleted} = require("../utils/whatsApp")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { moveId } = req.body;

    const move = await Move.findById(moveId);
    if (!move) {
      return res.status(404).json({ success: false, message: "Move not found" });
    }

    const amount = Math.round(move.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      metadata: { moveId: moveId.toString() },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Payment Intent Error:", err);
    res.status(500).json({ success: false, message: "Failed to create payment intent" });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "paymentIntentId is required" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      isPaid: paymentIntent.status === "succeeded",
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      moveId: paymentIntent.metadata?.moveId || null,
    });
  } catch (err) {
    console.error("Check Payment Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to check payment status", error: err.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "paymentIntentId is required" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const moveId = paymentIntent.metadata?.moveId;
    if (!moveId) {
      return res.status(400).json({ success: false, message: "Move ID not found in payment metadata" });
    }

    if (paymentIntent.status === "succeeded") {
      // ✅ FIX: Always update regardless of current paymentStatus — no guard condition
      const updatedMove = await Move.findByIdAndUpdate(
        moveId,
        {
          paymentStatus: "paid",
          paymentIntentId: paymentIntentId,
          status: "PAYMENT",
        },
        { new: true }
      );

      await notifyPaymentCompleted(7366883380, moveId);

      if (!updatedMove) {
        return res.status(404).json({ success: false, message: "Move not found" });
      }

      console.log(`✅ Payment confirmed for Move ID: ${moveId}`);
      console.log("Updated Move:", updatedMove);
    }

    res.json({ success: true, status: paymentIntent.status, moveId: moveId });
  } catch (err) {
    console.error("Confirm Payment Error:", err);
    res.status(500).json({ success: false, message: "Failed to confirm payment", error: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  checkPaymentStatus,
  confirmPayment,
};