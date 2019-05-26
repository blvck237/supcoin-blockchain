const Block = require("./block");
const cryptoHash = require("./crypto-hash");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });

    this.chain.push(newBlock);
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const actualPreviousHash = chain[i - 1].hash;
      const { timestamp, previousHash, hash, data } = block;
      if (previousHash !== actualPreviousHash) return false;
      if (cryptoHash(timestamp, previousHash, data) != hash) return false;
    }
    return true;
  }
}

module.exports = Blockchain;
