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

  describe("mineblock()", () => {
    const lastBlock = Block.genesis();
    const data = "mined-block";
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it("returns a Block instance", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it("sets `previousHash` to be `hash` of the previous block", () => {
      expect(minedBlock.previousHash).toEqual(lastBlock.hash);
    });

    it("sets the `data`", () => {
      expect(minedBlock.data).toEqual(data);
    });

    it("sets the `timestamp`", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
  });
});
