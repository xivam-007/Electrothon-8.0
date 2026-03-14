const getTruckDetails = require("./truckService");
const getRelocationCosts = require("./relocationCostService");

const calculatePrice = (distance, weight) => {

    console.log("Calculating price for distance:", distance, "km and weight:", weight, "kg");

 const truck = getTruckDetails(weight);
 const relocationCost = getRelocationCosts(weight);

 const insurance = 1500;

 const distanceCost =
 distance * truck.ratePerKm;

 const subtotal =
 truck.baseFare +
 distanceCost +
 relocationCost.packing +
 relocationCost.labour +
 insurance;

 const platformMargin =
 subtotal * 0.10;

 const finalPrice =
 subtotal + platformMargin;

 return {
  truck: truck.truck,
  baseFare: truck.baseFare,
  distanceCost: Math.round(distanceCost),
  packing: relocationCost.packing,
  labour: relocationCost.labour,
  insurance,
  platformMargin: Math.round(platformMargin),
  totalPrice: Math.round(finalPrice)
 };

};

module.exports = calculatePrice;