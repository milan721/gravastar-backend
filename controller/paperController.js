const Paper = require("../model/paperModel");

exports.publishPaperController = async (req, res) => {
  try {
    const {
      id,
      title,
      author,
      genre,
      abstract,
      content,
      email,
      year,
      type,
      publisher,
    } = req.body;

    // duplicate check using id
    const existingPaper = await Paper.findOne({ id });
    if (existingPaper) {
      return res.status(409).json("Paper already exists");
    }

    const pdf = req.file.filename;

    const newPaper = new Paper({
      id,
      title,
      author,
      genre,
      year,
      type,
      publisher,
      abstract,
      content,
      email,
      pdf,
    });

    await newPaper.save();

    res.status(200).json("Paper published successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Paper publish failed");
  }
};

// ---------- DELETE PAPER BY ID ----------
exports.deletePaperController = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterEmail = req.payload; // set by jwtMiddleware
    if (!requesterEmail) return res.status(401).json("Unauthorized");

    const users = require("../model/userModel");
    const requester = await users.findOne({ email: requesterEmail });

    const paper = await Paper.findOne({ id });
    if (!paper) return res.status(404).json("Paper not found");

    const isAdmin = requester && requester.role === 'admin';
    const isOwner = paper.email === requesterEmail;
    if (!isAdmin && !isOwner) return res.status(403).json("Forbidden");

    await Paper.deleteOne({ id });
    res.status(200).json("Paper deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Delete failed");
  }
};

// ---------- GET USER PAPERS ----------
exports.getUserPapers = async (req, res) => {
  try {
    const { email } = req.params;
    const userPapers = await Paper.find({ email });
    res.status(200).json(userPapers);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ---------- GET ALL PAPERS ----------
exports.getAllPapersController = async (req, res) => {
  try {
    const allPapers = await Paper.find();
    res.status(200).json(allPapers);
  } catch (err) {
    res.status(500).json(err);
  }
};
