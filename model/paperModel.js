const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
  },
  type: {
    type: String,
  },
  publisher: {
    type: String,
  },
  abstract: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  pdf: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  adminApproved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("papers", paperSchema);
