
const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  suggestions: {
    type: String,
    required: true,
  },
 
});

const improves = mongoose.model("improves", statusSchema);
module.exports = improves;