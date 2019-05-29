const Wallet = require("../wallet/index");
const Transaction = require("../wallet/transaction");
const { verifySignature } = require("../utils");

describe("Wallet", () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it("has a balance", () => {
    expect(wallet).toHaveProperty("balance");
  });

  it("has a public key", () => {
    expect(wallet).toHaveProperty("publicKey");
  });

  describe("signing data", () => {
    const data = "foo-bar";
    it("verifies valid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });
    it("does not verifies an invalid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
    });
  });

  describe("createTransaction", () => {
    describe("and the amount exceeds the balance", () => {
      it("throws an error", () => {
        expect(() =>
          wallet.createTransaction({ amount: 9999999, receiver: "Jojo" })
        ).toThrow("Amount exceeds balance");
      });
    });

    describe("and the amount is valid", () => {
      let transaction, amount, receiver;

      beforeEach(() => {
        amount = 50;
        receiver = "Jojo";
        transaction = wallet.createTransaction({ amount, receiver });
      });

      it("creates an instance of `Transaction`", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it("matches transaction input in wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it("outputs the amount of the receiver", () => {
        expect(transaction.outputMap[receiver]).toEqual(amount);
      });
    });
  });
});
