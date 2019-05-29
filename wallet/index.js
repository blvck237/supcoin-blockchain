const { INITIAL_BALANCE } = require("../config");
const { ec } = require("../utils");
const { cryptoHash } = require("../utils");

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;

    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
}

module.exports = Wallet;