const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { origins: "*:*" });
const _ = require("lodash");

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
  : "redis://h:pacd69ecdf84df9fe8ecfcb756525d9145707d6705494b17673082ba9d7f97308@ec2-52-1-169-125.compute-1.amazonaws.com:10109";
const blockchain = new Blockchain();
const node = new Node();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, redisURL: REDIS_URL });
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

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

const imgURLs = [
  "https://dumielauxepices.net/sites/default/files/profile-clipart-profile-icon-728502-3571937.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy08cK8wogTcvUJYvty4hAPwvKxTIJEqneUkNc3r4CBLkroZyn",
  "https://png.pngtree.com/svg/20170921/5d57af529f.svg",
  "https://image.flaticon.com/icons/png/512/194/194915.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ02t10e803wAb6yvCxp94Sv9XxVMtqOFDganij2UVcDK4uqUNB"
];

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
  const { senderWallet, amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: senderWallet.publicKey
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: senderWallet, recipient, amount });
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

  res.json(onlineNodes);
});

app.get("/supcoin/mine-transaction", (req, res) => {
  transactionMiner.mineTransactions();

  res.redirect("/supcoin/blocks");
});

app.get("/supcoin/create-wallet", (req, res) => {
  let wallet = new Wallet();
  res.json(wallet);
});

// post
app.get("/supcoin/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  const { add } = req.body;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain,
      address
    })
  });
});

app.get("supcoin/get-balance", (req, res) => {
  const address = req.body;
  res.json({
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

// app.get("/supcoin/transactions", (req, res) => {
//   let transactions = [];
//   db.collection("transactions")
//     .get()
//     .then(ref => {
//       ref.docs.map(doc => {
//         transactions.push(doc.data());
//       });
//       console.log("Log: ref", transactions);
//       res.send(transactions);
//     })
//     .catch(err => {
//       console.error(err);
//     });
// });

app.post("/supcoin/login", (req, res) => {
  const { email, password } = req.body;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      res.json(user.user);
    })
    .catch(err => {
      res.json(err);
    });
});

app.post("/supcoin/signup", (req, res) => {
  const { email, password } = req.body;
  let wallet = new Wallet();
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(user => {
      db.collection("wallets")
        .doc(wallet.publicKey.toString())
        .set({
          email: email,
          address: wallet.publicKey,
          imgURl: _.sample(imgURLs)
        })
        .then(() => {
          admin
            .database()
            .ref("wallets")
            .child(wallet.publicKey.toString())
            .set({
              balance: wallet.balance
            });
        })
        .catch(err => {
          res.json(err);
        });
      res.json(user.user);
    })
    .catch(err => {
      res.json(err);
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

const getWalletInfo = () => {
  request(
    { url: `${ROOT_NOOD_ADDRESS}/supcoin/wallet-info` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const wallet = response.data;
        const rootChain = JSON.parse(body);
        console.log("Log: getWalletInfo -> rootChain", rootChain);
        // return rootChain;
      }
    }
  );
};

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
  console.log("Log: setNode -> connectedNode", { wallet });
  console.info(`Listening on port ${PORT}`);
  !isDevelopment ? setNode(PORT) : () => console.log("is development mode");
  if (PORT !== DEFAULT_PORT) {
    syncNodes();
  }
});

process.on("SIGINT", () => {
  !isDevelopment ? removeNode() : () => console.log("is development mode");
  process.exit();
});

// Add set node and remove after
