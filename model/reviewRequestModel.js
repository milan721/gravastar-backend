// import mongoose
const mongoose = require("mongoose");

// create schema
const reviewerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  university: { type: String, required: true },
  info: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  expertise: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  activities: {
    type: String,
    required: true,
  },
  publication: {
    type: String,
    required: true,
  },
  membership: {
    type: String,
    required: true,
  },
  awards: {
    type: String,
    required: true,
  },
  references:{
    type: String,
    required: true,
  },
  pdf:{
    type: Array,
    required: true,
  },
});

const reviewers = mongoose.model("reviewers", reviewerSchema);
module.exports = reviewers;