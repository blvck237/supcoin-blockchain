const { GENESIS_DATA } = require("./config");

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
    return new this({
      timestamp: Date.now(),
      previousHash: lastBlock.hash,
      hash: 'hash-one',
      data: data
    });
  }
}

module.exports = Block;
