const mongoose = require("mongoose");

const nodeModel = mongoose.Schema({
  port: Number
});

module.exports = nodeModel;
