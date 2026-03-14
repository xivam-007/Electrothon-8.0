const axios = require("axios");

const getDistance = async (pickup, drop) => {

 const apiKey = process.env.GOOGLE_MAP_API;

 const origin = encodeURIComponent(`${pickup.toLowerCase()}, india`);
const destination = encodeURIComponent(`${drop.toLowerCase()}, india`);

 const url =
 `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=metric&key=${apiKey}`;

 const response = await axios.get(url);

 console.log("Distance API response:", response.data);

 const element = response.data.rows[0].elements[0];

 if (!element || element.status !== "OK") {

  console.log("Element status:", element.status);

  throw new Error("Distance API error");

 }

 const distanceKm = element.distance.value / 1000;

 console.log("Distance:", distanceKm);

 return distanceKm;

};

module.exports = getDistance;