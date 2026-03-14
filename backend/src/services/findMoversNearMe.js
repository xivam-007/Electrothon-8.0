const axios = require("axios")
const MoveProvider = require("../models/moverModel")

const fetchAndStoreNearbyMovers = async (moveId, pickupLocation) => {
  try {
    console.log("gotInside fetch and store nearby movers")
    const { lat, lng } = pickupLocation; // make sure pickupLocation has lat/lng
    // Step 1: Nearby Search
    const searchRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 10000, // 10km radius
          keyword: "packers and movers",
          key: process.env.GOOGLE_MAP_API,
        },
      }
    );

    const places = searchRes.data.results;

    const movers = await Promise.all(
      places.map(async (place) => {
        // Step 2: Get Place Details (phone, website, etc.)
        const detailRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/details/json",
          {
            params: {
              place_id: place.place_id,
              fields: "name,formatted_phone_number,website,rating,user_ratings_total,formatted_address",
              key: process.env.GOOGLE_MAP_API,
            },
          }
        );

        const d = detailRes.data.result;

        return {
          moveId,
          name: d.name,
          address: d.formatted_address,
          phone: d.formatted_phone_number || null,
          rating: d.rating || null,
          totalRating: d.user_ratings_total || null,
          website: d.website || null,
        };
      })
    );

    await MoveProvider.insertMany(movers);
    console.log(movers);
    console.log(`✅ Stored ${movers.length} movers for moveId: ${moveId}`);
  } catch (err) {
    console.error("❌ fetchAndStoreNearbyMovers error:", err.message);
  }
};

module.exports = fetchAndStoreNearbyMovers