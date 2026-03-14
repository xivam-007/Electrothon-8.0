const getDistance = require("./distanceService");
const calculatePrice = require("./pricingService");

const movers = [

    { name: "FastTrack Logistics", rating: 4.2 },

    { name: "Agarwal Movers", rating: 4.5 },

    { name: "Sharma Packers", rating: 4.8 },

    { name: "SafeMove Transport", rating: 4.6 }

];

const negotiateMovers = async (
    pickup,
    drop,
    houseSize
) => {

    const distance = await getDistance(pickup, drop);
    const basePrice = calculatePrice(distance, houseSize);

    const quotes =
        movers.map((mover) => {

            const base =
                calculatePrice(distance, houseSize);

            const variation =
                Math.floor(Math.random() * 3000);

            const price =
                base.totalPrice + variation;

            return {

                name: mover.name,

                rating: mover.rating,

                truck: base.truck,

                price,

                riskScore:
                    Math.floor(Math.random() * 40)

            };

        });

    const bestMover =
        quotes.sort((a, b) => a.price - b.price)[0];

    return {
        distance,
        quotes,
        bestMover
    };

};

module.exports = negotiateMovers;