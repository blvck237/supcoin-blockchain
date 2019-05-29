const uuid = require("uuid/v1");
const { verifySignature } = require("../../utils/index");

class Transaction {
  constructor({ senderWallet, receiver, amount }) {
    this.id = uuid();
    this.outputMap = this.createOutputMap({ senderWallet, receiver, amount });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, receiver, amount }) {
    const outputMap = {};

    outputMap[receiver] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  static validateTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount
    );

    if (amount !== outputTotal) {
      console.error("error: Invalid transaction from " + address);
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error("error: Invalid signature from " + address);
      return false;
    }
    return true;
  }
}

module.exports = Transaction;