const users = require("../model/userModel");
var jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


// register
exports.registerController = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log({ username, email, password, role });

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json("Existing User");
    }

    const newUser = new users({ username, email, password, role });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// login
exports.loginController = async (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }

  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      return res.status(404).json("User doesn't exists");
    }

    if (existingUser.password !== password) {
      return res.status(401).json("Incorrect Password");
    }

    //  last login 
    existingUser.lastLogin = new Date();
    await existingUser.save();
    const token = jwt.sign({ userMail: existingUser.email }, "secretkey");
    res.status(200).json({ existingUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// google login
exports.googleLoginController = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  if (!email || !username) {
    return res.status(400).json({ error: "Google login requires email and username" });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }

  try {
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      const token = jwt.sign({ userMail: existingUser.email }, "secretkey");
      return res.status(200).json({ existingUser, token });
    }

    const newUser = new users({ username, email, password });
    await newUser.save();
    // mark last login time
    newUser.lastLogin = new Date();
    await newUser.save();
    const token = jwt.sign({ userMail: newUser.email }, "secretkey");
    res.status(200).json({ existingUser: newUser, token });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all user controller
exports.getAllUsersController = async (req, res) => {
  const email = req.payload;
  try {
    const allUsers = await users.find({ email: { $ne: email } });
    res.status(200).json(allUsers);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update admin profile controller
exports.editAdminProfileController = async (req, res) => {
  console.log("Inside edit admin profile controller");
  const { username, password, profile } = req.body;
  const prof = req.file ? req.file.filename : profile;
  const email = req.payload;
  console.log(email);

  try {
    const adminDetails = await users.findOneAndUpdate(
      { email },
      { username, email, password, profile: prof },
      { new: true }
    );
    // await adminDetail.save()
    res.status(200).json(adminDetails);
  } catch (err) {
    console.error("Edit admin profile error:", err);
    res.status(500).json({ error: "Internal server error" });
    console.log(err);
  }
};

// update admin profile controller
exports.editUserProfileController = async (req, res) => {
  console.log("Inside edit user profile controller");
  const { username, password, profile, bio } = req.body;
  const prof = req.file ? req.file.filename : profile;
  const email = req.payload;
  console.log(email);

  try {
    const userDetails = await users.findOneAndUpdate(
      { email },
      { username, email, password, bio, profile: prof },
      { new: true }
    );
    // await adminDetail.save()
    res.status(200).json(userDetails);
  } catch (err) {
    console.error("Edit user profile error:", err);
    res.status(500).json({ error: "Internal server error" });
    console.log(err);
  }
};

// admn delete a user by id
exports.deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await users.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ deleted: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// adnim upgrade a user's role
exports.upgradeUserRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !["user", "reviewer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const updated = await users.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Upgrade role error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// get current user profile
exports.getMeController = async (req, res) => {
  try {
    const email = req.payload;
    if (!email) return res.status(401).json({ error: "Unauthorized" });
    const me = await users.findOne({ email });
    if (!me) return res.status(404).json({ error: "User not found" });
    res.status(200).json(me);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};