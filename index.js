const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { origins: "*:*" });

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
// Class imports
const Blockchain = require("./blockchain/index");
const Node = require("./nodes");
const PubSub = require("./app/pubsub");
const TransactionMiner = require("./app/transaction-miner");
const TransactionPool = require("./wallet/transaction/transactionpool");
const Wallet = require("./wallet");
const { facebookProvider, db, firebase, admin } = require("./db/firebase");
const { mongoose } = require("./db/mongodb");

const isDevelopment = process.env.ENV === "development";
const REDIS_URL = isDevelopment
  ? "redis://127.0.0.1:6379"
  : "redis://h:p05f9a274bd0e2414e52cb9516f8cbcead154d7d61502d32d9750180836a7cc05@ec2-34-225-229-4.compute-1.amazonaws.com:19289";
const blockchain = new Blockchain();
const node = new Node();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, nodes: node });
const wallet = new Wallet();
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub
});

const onlineNodes = [];
var nodes = [];
var connectedNode = {};

const DEFAULT_PORT = 3000;
let PEER_PORT;
const ROOT_NOOD_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

if (process.env.GENERATE_PEER_PORT == "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.get("/supcoin/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/supcoin/mineblock", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  saveChain();
  res.redirect("/supcoin/blocks");
});

app.post("/supcoin/transact", (req, res) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({ type: "success", transaction });
});

app.get("/supcoin/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/supcoin/availablenodes", (req, res) => {
  console.log("Log: nodes");

  res.json( onlineNodes );
});

app.get("/supcoin/mine-transaction", (req, res) => {
  transactionMiner.mineTransactions();

  res.redirect("/supcoin/blocks");
});

app.get("/supcoin/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain,
      address
    })
  });
});

app.get("/supcoin/transactions", (req, res) => {
  let transactions = [];
  db.collection("transactions")
    .get()
    .then(ref => {
      ref.docs.map(doc => {
        transactions.push(doc.data());
      });
      console.log("Log: ref", transactions);
      res.send(transactions);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post("/supcoin/login", (req, res) => {
  const { email, password } = req.body;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      console.info("ok");
      res.json(user);
    })
    .catch(err => {
      res.json(err);
      console.log("Log: err", err);
    });
});

app.get("/supcoin/facebookLogin", (req, res) => {
  firebase
    .auth()
    .signInWithRedirect(facebookProvider)
    .then(res => {
      var token = res.credential.accessToken;
      var user = res.user;
      console.info(user);
      res.json(user);
    })
    .catch(err => {
      res.json(err);
      console.log("Log: err", err);
    });
});

const syncNodes = () => {
  request(
    { url: `${ROOT_NOOD_ADDRESS}/supcoin/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Log: syncNodes -> rootChain", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );

  request(
    { url: `${ROOT_NOOD_ADDRESS}/supcoin/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

const saveChain = () => {
  let chain = { ...blockchain.chain };
  console.log("Log: saveChain -> chain", chain);
  db.collection(wallet.publicKey)
    .doc()
    .set({ chain: JSON.stringify(chain) })
    .then(() => {
      console.log("success");
    })
    .catch(err => {
      console.log(err);
    });
};

const setNode = () => {
  getNodes();
  connectedNode = admin
    .database()
    .ref("nodes")
    .push(PORT);
  console.log("Log: setNode -> connectedNode", connectedNode.key);
};

const getNodes = () => {
  admin
    .database()
    .ref("nodes")
    .on("value", snapshot => {
      snapshot.forEach(node => {
        onlineNodes.push(node.val());
      });
    });
};

const removeNode = () => {
  admin
    .database()
    .ref("nodes")
    .child(connectedNode.key)
    .remove();
};

io.set("origins", "*:*");

io.on("connection", socket => {});

io.on("disconnect", () => {
  console.log("disconnected");
});

http.listen(PORT, () => {
  console.info(`Listening on port ${PORT}`);
  setNode(PORT);
  if (PORT !== DEFAULT_PORT) {
    syncNodes();
  }
});

process.on("SIGINT", () => {
  removeNode();
  // console.log("Log: nodes", node);
  process.exit();
});
