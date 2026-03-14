const VEHICLES = [
  { id: "mini-3w", name: "Mini 3W", capacity: 50 },
  { id: "3-wheeler", name: "3 Wheeler", capacity: 500 },
  { id: "tata-ace", name: "Tata Ace", capacity: 750 },
  { id: "pickup-8ft", name: "Pickup 8ft", capacity: 1200 },
  { id: "pickup-1-7ton", name: "Pickup 1.7 Ton", capacity: 1700 },
  { id: "14ft-open", name: "14ft (Open)", capacity: 3500 },
  { id: "14ft-closed", name: "14ft (Closed)", capacity: 3500 },
  { id: "tata-17ft", name: "Tata 17ft", capacity: 4000 },
];

const getTruckDetails = (weight) => {

  const vehicleRates = {
    "Mini 3W": { ratePerKm: 10, baseFare: 200 },
    "3 Wheeler": { ratePerKm: 12, baseFare: 300 },
    "Tata Ace": { ratePerKm: 18, baseFare: 1200 },
    "Pickup 8ft": { ratePerKm: 20, baseFare: 1500 },
    "Pickup 1.7 Ton": { ratePerKm: 22, baseFare: 1700 },
    "14ft (Open)": { ratePerKm: 24, baseFare: 2000 },
    "14ft (Closed)": { ratePerKm: 25, baseFare: 2200 },
    "Tata 17ft": { ratePerKm: 30, baseFare: 3000 },
  };

  const vehicle = VEHICLES.find(v => weight <= v.capacity) || VEHICLES[VEHICLES.length - 1];

  return {
    truck: vehicle.name,
    capacity: vehicle.capacity,
    ratePerKm: vehicleRates[vehicle.name].ratePerKm,
    baseFare: vehicleRates[vehicle.name].baseFare
  };
};

module.exports = getTruckDetails;