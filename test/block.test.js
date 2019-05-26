const Block = require("../block");
const { GENESIS_DATA } = require("../config");

describe("Block", () => {
  const timestamp = "a-date";
  const previousHash = "foo-hash";
  const hash = "bar-hash";
  const data = ["Blockchain", "data"];
  const block = new Block({ timestamp, previousHash, hash, data });

  it("has a hash, previousHash, timestamp & data", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.previousHash).toEqual(previousHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
  });

  describe("genesis()", () => {
    const genesisBlock = Block.genesis();

    it("returns a Block instance", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("returns genesis data", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });
});
