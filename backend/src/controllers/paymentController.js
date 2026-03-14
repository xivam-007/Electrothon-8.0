const Stripe = require("stripe");
const Move = require("../models/moveModel");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { moveId } = req.body;

    // Find move in DB
    const move = await Move.findById(moveId);

    if (!move) {
      return res.status(404).json({
        success: false,
        message: "Move not found",
      });
    }

    // Assume move.price exists (in rupees)
    const amount = move.price * 100; // Stripe uses paise (smallest unit)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      metadata: {
        moveId: moveId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error("Payment Intent Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
    });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Validate input
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "paymentIntentId is required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Determine payment status
    const isPaid = paymentIntent.status === "succeeded";

    res.json({
      success: true,
      status: paymentIntent.status,
      isPaid: isPaid,
      amount: paymentIntent.amount / 100, // convert paise to INR
      currency: paymentIntent.currency,
      moveId: paymentIntent.metadata?.moveId || null,
    });

  } catch (err) {
    console.error("Check Payment Status Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: err.message,
    });
  }
};


const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Validate input
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "paymentIntentId is required",
      });
    }

    // Retrieve payment from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const moveId = paymentIntent.metadata?.moveId;

    if (!moveId) {
      return res.status(400).json({
        success: false,
        message: "Move ID not found in payment metadata",
      });
    }

    // If payment succeeded → update DB
    if (paymentIntent.status === "succeeded") {
      const move = await Move.findById(moveId);

      if (!move) {
        return res.status(404).json({
          success: false,
          message: "Move not found",
        });
      }

      // Prevent duplicate updates
      if (move.paymentStatus !== "paid") {
        move.paymentStatus = "paid";
        move.paymentIntentId = paymentIntentId;
        move.status = "confirmed";

        await move.save();
      }
    }

    res.json({
      success: true,
      status: paymentIntent.status,
      moveId: moveId,
    });

  } catch (err) {
    console.error("Confirm Payment Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: err.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
  checkPaymentStatus,
  confirmPayment,
};