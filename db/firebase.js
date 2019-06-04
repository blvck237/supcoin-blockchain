const admin = require("firebase-admin");
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
const serviceAccount = require("./service-account.json");

const facebookProvider = new firebase.auth.FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: "popup"
});

const firebaseConfig = {
  apiKey: "AIzaSyDgTPHR6_gQVqVMXkRK_mnd5EaKmwH1C6M",
  authDomain: "supcoin-de02b.firebaseapp.com",
  databaseURL: "https://supcoin-de02b.firebaseio.com",
  projectId: "supcoin-de02b",
  storageBucket: "supcoin-de02b.appspot.com",
  messagingSenderId: "794572198717",
  appId: "1:794572198717:web:d6b7b223ac3f1fc0"
};

const adminConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://supcoin-de02b.firebaseio.com"
};

admin.initializeApp(adminConfig);
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

module.exports = { db, admin, firebase, facebookProvider };
