const getRelocationCosts = (weight) => {

  if (weight <= 500) {
    return {
      packing: 2000,
      labour: 1500
    };
  }

  if (weight <= 1200) {
    return {
      packing: 3500,
      labour: 2500
    };
  }

  if (weight <= 2500) {
    return {
      packing: 5000,
      labour: 4000
    };
  }

  return {
    packing: 7000,
    labour: 5500
  };
};

module.exports = getRelocationCosts;