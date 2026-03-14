const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   required: true
  },

  phone: {
   type: String,
   required: true,
   unique: true
  },

  imageUrl: {
   type: String,
   default: ""
  },

  role: {
   type: String,
   enum: ["USER", "ADMIN"],
   default: "USER"
  },

  isVerified: {
   type: Boolean,
   default: false
  }

 },
 { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);