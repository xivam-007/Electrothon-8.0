const Move = require("../models/moveModel");
const MoveProvider = require("../models/moverModel");

const updateMovebyId = async(req, res) => {
    const {moverId, moveId, finalPrice, deliveryDate, deliveryTime, riskScore} = req.body;
    const updatedMove = await Move.findByIdAndUpdate(
        moveId,
        {$set: {price: finalPrice, deliveryDate, deliveryTime, riskScore, status: "INITIATED"}},
        {new: true}
    );

    console.log("Here's the updated one: ",updatedMove)

    return res.json({
        success: true
    })
};

module.exports = updateMovebyId;
