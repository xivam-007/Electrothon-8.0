const mongoose = require("mongoose")

const moveProviderSchema = new mongoose.Schema({
  moveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Move",
    required: true,
  },
  name: String,
  rating: Number,
  totalRating: Number,
  phone: String,
  address: String,
  website: String,
});

module.exports = mongoose.model("MoveProvider", moveProviderSchema);
