const Transaction = require("./transaction");
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

  createTransaction({ receiver, amount }) {
    if (amount > this.balance) {
      throw new Error("Amount exceeds balance");
    }
    return new Transaction({senderWallet: this, receiver, amount});
  }
}

module.exports = Wallet;
