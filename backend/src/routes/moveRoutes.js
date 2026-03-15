// const express = require("express");

// const { createMoveRequest, getMoveById, getAllOrders } = require("../controllers/moveController");
// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();




// router.post("/request", protect, createMoveRequest);
// router.get("/orders", protect, getAllOrders);
// router.get("/orders/:id",protect, getMoveById);


// module.exports = router;

const express = require("express");

const { 
  createMoveRequest, 
  getMoveById, 
  getAllOrders,
  updateMoveFromAI,
  moverByID // 👈 Imported the new webhook function
} = require("../controllers/moveController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request", protect, createMoveRequest);
router.get("/orders", protect, getAllOrders);
router.get("/orders/:id", protect, getMoveById);
router.get("/mover/:id",  moverByID); // For movers to view move details

// 👈 NEW AI WEBHOOK ROUTE (Unprotected so Python can access it)
// router.post("/ai-webhook", updateMoveFromAI); 

module.exports = router;