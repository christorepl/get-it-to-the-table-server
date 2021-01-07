const jwt = require("jsonwebtoken");
require("dotenv").config();

//this middleware will on continue on if the token is inside the local storage

module.exports = function(req, res, next) {
  // Get token from header
  const jwt_token = req.header("jwt_token");

  // Check if not token
  if (!jwt_token) {
    return res.status(403).json({ msg: "Authorization Denied" });
  }

  // Verify token
  try {
    //it is going to give use the user id (user:{id: user.id})
    const verify = jwt.verify(jwt_token, process.env.jwtSecret);

    req.user = verify.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid login" });
  }
};
