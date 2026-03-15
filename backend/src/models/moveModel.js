const mongoose = require("mongoose");

const moveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    weight: {
      type: String,
      required: true,
    },

    vehicleId: {
      type: String,
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
    },

    dropoffLocation: {
      type: String,
      required: true,
    },

    pickupDate: {
      type: String,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    deliveryDate: {
      type: String,
      default: "",
    },

    deliveryTime: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "INITIATED", "CONFIRMED", "PAYMENT", "INTRANSIT", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    bestMover: {
      type: String
    },

    price: {
      type: Number
    },

    riskScore: {
      type: Number
    },

    distance: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: "pending"
    },

    paymentIntentId: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Move", moveSchema);