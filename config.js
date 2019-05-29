const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  previousHash: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

const INITIAL_BALANCE = 100;

module.exports = { GENESIS_DATA, INITIAL_BALANCE };
