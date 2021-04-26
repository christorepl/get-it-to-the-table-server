require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const { NODE_ENV, CLIENT_ORIGIN } = require("./config");
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.get("/", (req, res) => {
  res.status(200).json("Hello, world! Welcome to the Get it to the Table API!");
});

app.use("/bgg", require("./routes/bgg"));
app.use("/auth", require("./routes/jwtAuth"));
app.use("/contacts", require("./routes/contacts"));
app.use("/group", require("./routes/group"));
app.use("/swiper", require("./routes/swiper"));

app.use((error, req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "Server Error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { msg: "Server error", type: "DANGER" };
  } else {
    console.error(error.message);
    response = { msg: error.message, type: "DANGER" };
  }
  res.status(500).json(response);
});

module.exports = app;
