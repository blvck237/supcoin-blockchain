const Blockchain = require("../blockchain");
const Block = require("../block");
describe("Blockchain", () => {
  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it("constains a `chain` array instance", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("starts with the genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("adds a new block to chain", () => {
    const newData = "foo bar";
    blockchain.addBlock({ data: newData });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe("isValidChain()", () => {
    describe("when chain does not start with genesis block", () => {
      it("returns false", () => {
        blockchain.chain[0] = { data: "fake-genesis" };

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe("when chain starts with genesis block and has multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "Dogs" });
        blockchain.addBlock({ data: "Cats" });
        blockchain.addBlock({ data: "Pigs" });
      });
      describe("and the previousHash has changed", () => {
        it("returns false", () => {
          blockchain.chain[2].previousHash = "pigs-hash";

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });

        describe("and chain contains block with an invalid field", () => {
          it("returns false", () => {
            blockchain.chain[2].data = "bad-pigs";

            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
          });
        });

        describe("and chain does not contains an invalid block", () => {
          it("returns true", () => {
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
          });
        });
      });
    });
  });
});
