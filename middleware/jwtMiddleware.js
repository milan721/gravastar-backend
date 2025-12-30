const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {
  const auth = req.headers["authorization"]; 
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json("Invalid Token");
  }
  const token = auth.split(" ")[1];
  try {
    const jwtResponse = jwt.verify(token, "secretkey");
    req.payload = jwtResponse.userMail;
    return next();
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
};

module.exports = jwtMiddleware;