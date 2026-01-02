const jwt = require("jsonwebtoken");
const Users = require("../model/userModel");

const jwtAdminMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers["authorization"] || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json("Invalid Token");
    }
    const token = auth.split(" ")[1];
    const jwtResponse = jwt.verify(token, "secretkey");
    req.payload = jwtResponse.userMail;

    
    const user = await Users.findOne({ email: req.payload });
    if (user && user.role === "admin") {
      return next();
    }
    return res.status(401).json("Invalid user....");
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
};

module.exports = jwtAdminMiddleware;