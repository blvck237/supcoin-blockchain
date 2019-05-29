const cryptoHash = require("../utils/crypto-hash");

describe("hash()", () => {
  it("generates a sha256 key", () => {
    expect(cryptoHash("foo")).toEqual(
      "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
    );
  });

  it("produces the same hash with the same parameters no matter the order", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(cryptoHash("three", "two", "one"));
  });
});
