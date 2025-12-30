const Improves = require("../model/statusModel"); 
const Paper = require("../model/paperModel");
const ReviewStatus = require("../model/reviewStatusModel");
const Users = require("../model/userModel");

// Add a new improvement suggestion
exports.addSuggestionController = async (req, res) => {
  try {
    const { status, suggestions } = req.body;
     console.log({ status, suggestions });

    // create new document
    const newSuggestion = new Improves({
      status,
      suggestions
    });

    // save to MongoDB
    await newSuggestion.save();

    // respond with saved data
    res.status(200).json(newSuggestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Reviewer feed: get papers by expertise, exclude own
exports.getReviewFeedController = async (req, res) => {
  try {
    const { expertise } = req.query;
    const userEmail = req.payload; // set by jwtMiddleware

    if (!userEmail) return res.status(401).json({ error: "Unauthorized" });
    const me = await Users.findOne({ email: userEmail });
    if (!me) return res.status(404).json({ error: "User not found" });
    if (me.role !== "reviewer" && me.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const query = { adminApproved: false };
    if (expertise) query.genre = expertise;

    // fetch papers, exclude current user's own
    const papers = await Paper.find(query).lean();
    const feed = papers.filter(p => p.email !== userEmail);

    res.status(200).json(feed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load review feed" });
  }
};

// Submit reviewer decision for a paper
exports.submitReviewDecisionController = async (req, res) => {
  try {
    const reviewerEmail = req.payload; // set by jwtMiddleware
    const { paperId } = req.params;
    const { decision, text } = req.body; // decision: accept|reject|suggest

    if (!reviewerEmail) return res.status(401).json({ error: "Unauthorized" });
    const me = await Users.findOne({ email: reviewerEmail });
    if (!me) return res.status(404).json({ error: "User not found" });
    if (me.role !== "reviewer" && me.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!decision || !["accept", "reject", "suggest"].includes(decision)) {
      return res.status(400).json({ error: "Invalid decision" });
    }

    const paper = await Paper.findOne({ id: paperId });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    // Prevent self-review
    if (paper.email === reviewerEmail) {
      return res.status(403).json({ error: "Cannot review own paper" });
    }

    const doc = await ReviewStatus.findOneAndUpdate(
      { paperId, reviewerEmail },
      { paperId, reviewerEmail, decision, text: text || "" },
      { new: true, upsert: true }
    );

    res.status(200).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit decision" });
  }
};

// Admin approves paper to grid (mark accepted)
exports.adminApprovePaperController = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await Paper.findOne({ id: paperId });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    // mark ALL reviewer 'accept' statuses for this paper as adminApproved
    const result = await ReviewStatus.updateMany(
      { paperId, decision: "accept", adminApproved: { $ne: true } },
      { $set: { adminApproved: true } }
    );

    // Reflect approval on the paper document as well
    if (!paper.adminApproved) {
      paper.adminApproved = true;
      await paper.save();
    }

    res.status(200).json({ ok: true, modifiedCount: result?.modifiedCount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve paper" });
  }
};

// Admin: list papers accepted by reviewers, not yet approved to grid
exports.adminListAcceptedPapersController = async (req, res) => {
  try {
    const accepted = await ReviewStatus.find({ decision: "accept", adminApproved: { $ne: true } }).lean();
    const ids = accepted.map((s) => s.paperId);
    if (ids.length === 0) return res.status(200).json([]);
    const papers = await Paper.find({ id: { $in: ids } }).lean();
    res.status(200).json(papers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load accepted papers" });
  }
};

// Admin: list papers rejected by reviewers
exports.adminListRejectedPapersController = async (req, res) => {
  try {
    const rejected = await ReviewStatus.find({ decision: "reject" }).lean();
    const ids = rejected.map((s) => s.paperId);
    if (ids.length === 0) return res.status(200).json([]);
    const papers = await Paper.find({ id: { $in: ids } }).lean();
    res.status(200).json(papers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load rejected papers" });
  }
};

// Get current reviewer's submitted decisions
exports.getMyReviewStatusesController = async (req, res) => {
  try {
    const reviewerEmail = req.payload; // set by jwtMiddleware
    const statuses = await ReviewStatus.find({ reviewerEmail }).lean();
    // create a simple map: paperId -> decision
    const map = {};
    for (const s of statuses) map[s.paperId] = s.decision;
    res.status(200).json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load review statuses" });
  }
};

// Get latest statuses for all papers owned by a user
exports.getStatusesForUserPapersController = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: "Email required" });

    const papers = await Paper.find({ email }).lean();
    const ids = papers.map((p) => p.id);
    if (ids.length === 0) return res.status(200).json({});

    const statuses = await ReviewStatus.find({ paperId: { $in: ids } })
      .sort({ updatedAt: -1 })
      .lean();

    const latestMap = {};
    for (const s of statuses) {
      if (!latestMap[s.paperId]) {
        latestMap[s.paperId] = { decision: s.decision, text: s.text || "" };
      }
    }

    res.status(200).json(latestMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load user paper statuses" });
  }
};


