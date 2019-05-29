const Blockchain = require("../blockchain/index");
const Block = require("../blockchain/block");
describe("Blockchain", () => {
  let blockchain, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
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

  describe("replaceChain()", () => {
    let errorMock, logMock;

    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();

      global.console.error = errorMock;
      global.console.log = logMock;
    });

    describe("when the new chain is not longer", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "new-chain" };
        blockchain.replaceChain(newChain.chain);
      });

      it("it does not replace the chain ", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it("logs an error", () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe("when the new chain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "Dogs" });
        newChain.addBlock({ data: "Cats" });
        newChain.addBlock({ data: "Pigs" });
      });

      describe("and the chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[2].hash = "fake-hash";
          blockchain.replaceChain(newChain.chain);
        });

        it("does not replace the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it("logs an error", () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the chain is valid", () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });

        it("replaces the chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it("logs about the chain replacement", () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
  });
});
