// import mongoose
const mongoose = require("mongoose");

// create schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  bio: {
    type: String,
    default: "user",
  },
  profile: {
    type: String,
  },
  lastLogin: {
    type: Date,
  },
  reviewerInfo: {
    type: Object,
  },
});

const users = mongoose.model("users", userSchema);
module.exports = users;