const jwt = require("jsonwebtoken");
require("dotenv").config();

//this middleware will only next() if a valid token is inside the local storage

module.exports = function (req, res, next) {
  const jwt_token = req.header("jwt_token");

  if (!jwt_token) {
    return res.status(403).json("Authorization Denied");
  }

  try {
    const verify = jwt.verify(jwt_token, process.env.jwtSecret);

    req.user = verify.user;
    next();
  } catch (error) {
    res.status(401).json("Invalid login");
  }
};
