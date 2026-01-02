const reviewers = require("../model/reviewRequestModel");
const users = require("../model/userModel");

// create reviewer
exports.reviewController = async (req, res) => {
  const {
    name,
    location,
    university,
    info,
    email,
    summary,
    expertise,
    education,
    experience,
    activities,
    publication,
    membership,
    awards,
    references
  } = req.body;

  // collect uploaded file 
  const pdf = Array.isArray(req.files) ? req.files.map(f => f.filename) : [];

  console.log({ name, location, university, info,
    email,
    summary,
    expertise,
    education,
    experience,
    activities,
    publication,
    membership,
    awards,
    references,
    pdf });

  try {
    const existingReviewer = await reviewers.findOne({
      email
    });

    if (existingReviewer) {
      res.status(400).json("Existing reviewer");
    } else {
      const newReviewer = new reviewers({
        name,
        location,
        university,
        info,
        email,
        summary,
        expertise,
        education,
        experience,
        activities,
        publication,
        membership,
        awards,
        references,
        pdf
      });

      await newReviewer.save();
      res.status(200).json(newReviewer);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN delete reviewer 
exports.deleteReviewerController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewers.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Reviewer not found" });
    res.status(200).json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reviewer" });
  }
};

//  all reviewer requests 
exports.listReviewerRequestsController = async (req, res) => {
  try {
    const email = req.payload;
    if (!email) return res.status(401).json({ error: "Unauthorized" });
    const me = await users.findOne({ email });
    if (!me) return res.status(404).json({ error: "User not found" });
    if (me.role !== "reviewer" && me.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const list = await reviewers.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reviewer requests" });
  }
};

// reviwer approve a reviewer request 
exports.approveReviewerRequestController = async (req, res) => {
  try {
    const email = req.payload;
    if (!email) return res.status(401).json({ error: "Unauthorized" });
    const me = await users.findOne({ email });
    if (!me) return res.status(404).json({ error: "User not found" });
    if (me.role !== "reviewer" && me.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const reqDoc = await reviewers.findById(id);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    const user = await users.findOne({ email: reqDoc.email });
    if (!user) return res.status(404).json({ error: "User not found for request" });
    
    user.role = "reviewer";
    user.reviewerInfo = {
      name: reqDoc.name,
      location: reqDoc.location,
      university: reqDoc.university,
      info: reqDoc.info,
      summary: reqDoc.summary,
      expertise: reqDoc.expertise,
      education: reqDoc.education,
      experience: reqDoc.experience,
      activities: reqDoc.activities,
      publication: reqDoc.publication,
      membership: reqDoc.membership,
      awards: reqDoc.awards,
      references: reqDoc.references,
      pdf: reqDoc.pdf,
    };
    await user.save();
    await reviewers.findByIdAndDelete(id);
    res.status(200).json({ approved: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve reviewer request" });
  }
};
