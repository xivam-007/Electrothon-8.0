const express = require("express");

const {
  createPaymentIntent,
  checkPaymentStatus,
  confirmPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// Create payment intent
router.post("/create-intent", createPaymentIntent);

// Check payment status
router.post("/check-status", checkPaymentStatus);

// Confirm payment
router.post("/confirm", confirmPayment);

module.exports = router;