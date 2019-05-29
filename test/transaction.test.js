const Transaction = require("../wallet/transaction/index");
const Wallet = require("../wallet/index");
const { verifySignature } = require("../utils");
describe("Transaction", () => {
  let transaction, senderWallet, receiver, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    receiver = "receiver-publicKey";
    amount = 20;
    transaction = new Transaction({ senderWallet, receiver, amount });
  });

  it("has an `id`", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("has an outputMap", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("outputs amount of receiver", () => {
      expect(transaction.outputMap[receiver]).toEqual(amount);
    });

    it("outputs the remaining balance of the sender", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("input", () => {
    it("has an `input`", () => {
      expect(transaction).toHaveProperty("input");
    });

    it("has `timestamp` in the `input`", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });

    it("sets the `amount` to the `senderWallet` balance", () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it("sets the `address` to the `senderWallet` publicKey", () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it("signs the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        })
      ).toBe(true);
    });
  });

  describe("validateTransaction()", () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe("when the transaction is valid", () => {
      it("returns true", () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });

    describe("when the transaction is invalid", () => {
      describe("and the transaction outputmap value is invalid", () => {
        it("returns false and logs an error", () => {
          transaction.outputMap[senderWallet.publicKey] = 999999;
          
          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the transaction input signature is invalid", () => {
        it("returns false and logs an error", () => {
          transaction.input.signature = new Wallet().sign("data");
          
          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});