const { GENESIS_DATA } = require("../config");
const { cryptoHash } = require("../utils");

class Block {
  constructor({ timestamp, previousHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    let hash, timestamp;
    const previousHash = lastBlock.hash;
    const { difficulty } = lastBlock;
    let nonce = 0;
    do {
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, previousHash, difficulty, nonce, data);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this({
      timestamp,
      previousHash,
      difficulty,
      nonce,
      hash,
      data
    });
  }
}

module.exports = Block;
