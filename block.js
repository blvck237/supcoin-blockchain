const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
  constructor({ timestamp, previousHash, hash, data }) {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const timestamp = Date.now();
    const previousHash = lastBlock.hash;

    return new this({
      timestamp,
      previousHash,
      hash: cryptoHash(timestamp, previousHash, data),
      data
    });
  }
}

module.exports = Block;
