const Block = require("../block");

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
});
