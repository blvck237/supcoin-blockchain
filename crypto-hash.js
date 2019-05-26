const crypto = require("crypto");

const cryptoHash = (...inputs) => { //we are combining our inputs into a single array
  const hash = crypto.createHash("sha256");

  hash.update(inputs.sort().join(" ")); // sort is to reorder parameters alphabetically spreaded in 'inputs' and join is to concatenate params. This is to allow our function return the same result no matter the order of the params
  return hash.digest("hex");
};

module.exports = cryptoHash;
