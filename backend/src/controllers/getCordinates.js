const axios = require("axios");

const getCoordinates = async (address) => {
  console.log("inside get coordinates")
  try {
    const encodedAddress = encodeURIComponent(address);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAP_API}`
    );

    const location = response.data.results[0].geometry.location;

    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
  console.log("exiting the get cordinates fucntion")
};

module.exports = getCoordinates;