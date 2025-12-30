const mongoose = require("mongoose");

const reviewStatusSchema = new mongoose.Schema(
  {
    paperId: { type: String, required: true },
    reviewerEmail: { type: String },
    decision: { type: String, enum: ["accept", "reject", "suggest"], default: "suggest" },
    text: { type: String },
    adminApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("review_status", reviewStatusSchema);
