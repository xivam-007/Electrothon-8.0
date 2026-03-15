const Move = require("../models/moveModel");
const { addMoveJob } = require("../services/queueService");
const calculatePrice = require("../services/pricingService");
const getDistance = require("../services/distanceService");
const getCoordinates = require("../controllers/getCordinates");
const fetchAndStoreNearbyMovers = require("../services/findMoversNearMe");
const startWorker = require("../queues/worker");
const MoveProvider = require("../models/moverModel"); // Import the schema! (For the new moverByID function)

const createMoveRequest = async (req, res) => {
  try {
    console.log("Received move request:", req.body);
    const {vehicleId, weight, pickupLocation, dropoffLocation, pickupDate, pickupTime} = req.body;

    // 1. Calculate Math
    const distance = await getDistance(pickupLocation, dropoffLocation);
    const priceCalulated = calculatePrice(distance, weight);

    console.log("Calculated price:", priceCalulated);

    // 2. Create Initial Move
    const move = await Move.create({
      user: req.user._id,
      status: "PENDING",
      vehicleId: vehicleId,
      weight: weight,
      pickupLocation: pickupLocation,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      dropoffLocation: dropoffLocation,
      price: priceCalulated.totalPrice,
      distance: String(distance),
    });

    console.log("Created move request:", move);

    // 3. Get Coordinates
    console.log("Getting coordinates of pickup location:", pickupLocation);
    const pickupCordinates = await getCoordinates(pickupLocation);
    console.log("Got cordinates:", pickupCordinates);

    // 4. THE FIX: Wait for Google to finish fetching and saving the movers FIRST
    if (move.status === "PENDING") {
      console.log("Going for fetch and store nearby movers...");
      // We added 'await' here so the code pauses until all movers are in the DB
      await fetchAndStoreNearbyMovers(move._id, pickupCordinates); 
      console.log("✅ Movers stored in DB successfully.");
    }

    // 5. NOW we wake up the queue, because the data is ready!
    await addMoveJob({
      moveId: move._id,
      vehicleId: vehicleId,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      weight: weight,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      price: priceCalulated.totalPrice,
      distance: String(distance),
    });
    console.log("🟡 Added job to queue");

    // Start worker
    await startWorker();

    res.json({
      success: true,
      message: "Move request created. Negotiation started.",
      data: move,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMoveById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 👇 ADD THIS TO SEE WHAT EXPRESS IS ACTUALLY RECEIVING
    console.log("🔍 Requested ID from URL is:", id);
    console.log("🔍 Type of ID is:", typeof id);

    const move = await Move.findOne({ _id: id.trim(), user: req.user._id });

    if (!move) {
      console.log("❌ Mongoose returned null for this ID.");
      return res.status(404).json({
        success: false,
        message: "Move not found",
      });
    }

    res.json({ success: true, data: move });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const moves = await Move.find({ user: req.user._id });

    res.json({
      success: true,
      data: moves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMoveFromAI = async (req, res) => {
  try {
    console.log("🔥 AI Finished! Received data from Python:", req.body);
    
    // We now extract the pickupDate and pickupTime negotiated by the AI over the phone
    const { moveId, finalPrice, pickupDate, pickupTime, riskScore, isSafe } = req.body;

    if (!moveId) {
      return res.status(400).json({ success: false, message: "Missing moveId" });
    }

    // Create an update object dynamically (so we don't overwrite dates with empty strings if the AI didn't catch them)
    let updateData = {
      price: finalPrice,
      riskScore: riskScore,
      // Fixed the Mongoose enum validation issue here!
      status: isSafe ? "INITIATED" : "CANCELLED" 
    };

    if (pickupDate) updateData.pickupDate = pickupDate;
    if (pickupTime) updateData.pickupTime = pickupTime;

    // Update the DB with the AI's final numbers
    const updatedMove = await Move.findByIdAndUpdate(
      moveId, 
      updateData,
      { new: true } 
    );

    console.log(`✅ Move ${moveId} successfully updated in DB!`);
    
    res.status(200).json({ 
      success: true, 
      message: "Database updated successfully by AI",
      data: updatedMove 
    });

  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ NAYI FUNCTION — Payment confirm hone ke baad status update
const updateMoveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { moveId } = req.params;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const move = await Move.findByIdAndUpdate(
      moveId,
      { status },
      { new: true }
    );

    if (!move) {
      return res.status(404).json({ success: false, message: "Move not found" });
    }

    console.log(`✅ Move ${moveId} status updated to: ${status}`);

    res.status(200).json({ success: true, move });
  } catch (error) {
    console.error("❌ Status Update Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const moverByID = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find the move
    const move = await Move.findById(id);
    if (!move) {
      return res.status(404).json({ success: false, message: "Move not found" });
    }

    // Check if a mover is actually assigned to this move
    if (!move.bestMover) {
      return res.status(404).json({ success: false, message: "No mover assigned to this move yet" });
    }

    // 2. Find the mover (Pass the ID directly, NOT as an object)
    const mover = await MoveProvider.findById(move.bestMover);
    
    if (!mover) {
      return res.status(404).json({ success: false, message: "Mover not found" });
    }

    // 3. Return the data
    res.json({ success: true, data: mover });
    
  } catch (error) {
    console.error("Error in moverByID:", error); // Helpful for debugging your terminal
    res.status(500).json({ success: false, message: error.message });
  }
}
module.exports = {
  moverByID,
  createMoveRequest,
  getMoveById,
  getAllOrders,
  updateMoveStatus,
  updateMoveFromAI
};