const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://admin:admin@4pjt-1jkyf.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected");
});

module.exports = { mongoose };
