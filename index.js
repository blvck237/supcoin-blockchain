const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const PubSub = require("./utils/pubsub");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => {
  pubsub.broadcastChain();
}, 1000);

app.use(bodyParser.json());

app.get("/supcoin/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/supcoin/mineblock", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/supcoin/blocks");
});

const DEFAULT_PORT = 3000;
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT == "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.info(`Listening on port ${PORT}`);
});
