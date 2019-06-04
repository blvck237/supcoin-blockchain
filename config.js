const { cryptoHash } = require("./utils");

const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const INITIAL_BALANCE = 1000;
const GENESIS_DATA = {
  timestamp: new Date().getTime(),
  previousHash: "----",
  hash: cryptoHash("hash one"),
  difficulty: INITIAL_DIFFICULTY,
  nonce: 1,
  data: []
};
const REWARD_INPUT = { address: "*authorized-reward*" };
const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA,
  INITIAL_BALANCE,
  MINE_RATE,
  REWARD_INPUT,
  MINING_REWARD
};
