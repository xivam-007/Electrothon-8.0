const Move = require("../models/moveModel");
const MoveProvider = require("../models/moverModel");

const {sendNo, sendBestMover} = require("../utils/whatsApp")

const updateMovebyId = async(req, res) => {
    const {moverId, moveId, finalPrice, deliveryDate, deliveryTime, riskScore} = req.body;
    const updatedMove = await Move.findByIdAndUpdate(
        moveId,
        {$set: {price: finalPrice, deliveryDate, deliveryTime, riskScore, status: "INITIATED", bestMover: moverId}},
        {new: true}
    );

    console.log("Here's the updated one: ",updatedMove)

    await sendBestMover(7366883380, updatedMove);

    return res.json({
        success: true
    })
};

module.exports = updateMovebyId;
