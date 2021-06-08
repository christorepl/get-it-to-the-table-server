const router = require("express").Router();
const axios = require("axios");
const xml2js = require("xml2js");
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.post("/add-collection", authorization, async (req, res) => {
  const { bgg_username, list_name } = req.headers;

  var options = {
    method: "GET",
    url: `https://www.boardgamegeek.com/xmlapi/collection/${bgg_username}`,
  };

  try {
    const collectionAlreadyExists = await pool.query(
      "SELECT bgg_username FROM user_lists WHERE user_id = $1 AND bgg_username = $2",
      [req.user.id, bgg_username]
    );

    if (collectionAlreadyExists.rows.length > 0) {
      return res.status(400).json({
        msg: `You have already imported ${bgg_username}'s collection!`,
        type: "INFO",
      });
    }

    const nameAlreadyExists = await pool.query(
      "SELECT list_name FROM user_lists WHERE user_id = $1 AND list_name = $2",
      [req.user.id, list_name]
    );

    if (nameAlreadyExists.rows.length > 0) {
      return res.status(400).json({
        msg: `You already have a collection with that name!`,
        type: "INFO",
      });
    }

    const results = await axios.request(options);
    let xml = results.data;

    let result;

    xml2js.parseString(xml, { mergeAttrs: true }, async (err, newObject) => {
      if (err) throw err;

      result = newObject;
    });

    if (result.errors) {
      return res
        .status(400)
        .json({ msg: result.errors.error[0].message, type: "WARNING" });
    }

    if (result.items.totalitems && result.items.totalitems[0] == 0) {
      return res.status(400).json({
        msg: "That user does not have any games in their collection",
        type: "INFO",
      });
    }
    await pool.query(
      "INSERT INTO user_lists (user_id, list_name, bgg_username) VALUES ($1, $2, $3)",
      [req.user.id, list_name, bgg_username]
    );

    const userCollections = await pool.query(
      "SELECT list_name, bgg_username FROM user_lists WHERE user_id = $1",
      [req.user.id]
    );

    const collectionData = userCollections.rows;
    let collections = [];

    for (const [key, val] of Object.entries(collectionData)) {
      var obj = {};
      if (key) {
        obj["label"] = val.list_name;
        obj["value"] = val.bgg_username;
        collections.push(obj);
      }
    }
    res.status(201).json({
      msg: "Collection added to your account!",
      collections,
      type: "SUCCESS",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "There was an error while fetching data from the Board Game Geek Server. Please try again soon.",
      type: "WARNING",
    });
  }
});

module.exports = router;
