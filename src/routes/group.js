const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const xml2js = require("xml2js");
const authorization = require("../middleware/authorization");

router.post("/add_collection", authorization, async (req, res) => {
  try {
    let { group_id, bgg_username } = req.body;

    const groupCollectionExists = await pool.query(
      "SELECT group_id FROM group_collections WHERE group_id = $1 AND bgg_username = $2",
      [group_id[0], bgg_username[0]]
    );

    if (groupCollectionExists.rows.length > 0) {
      return res.status(400).json({
        msg: "That group already has that collection in it!",
        type: "INFO",
      });
    }

    await pool.query(
      "INSERT INTO group_collections (group_id, bgg_username, owner_id) VALUES ($1, $2, $3)",
      [group_id[0], bgg_username[0], req.user.id]
    );

    const groupMembers = await pool.query(
      "SELECT members FROM user_groups WHERE group_id = $1",
      [group_id[0]]
    );

    const members = groupMembers.rows[0].members;

    var options = {
      method: "GET",
      url: `https://www.boardgamegeek.com/xmlapi/collection/${bgg_username}`,
    };

    let gameNames = [];
    let gameImgs = [];
    let gameURLs = [];

    try {
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

      let games = result.items["item"];

      //the BGG api randomly uses a non standard minus sign/ dash ( – ) compare to the standard one ( – - ). it causes fetch errors client side when swiping.
      games.map((game) => gameNames.push(game.name[0]["_"].replace(/–/g, `-`)));
      games.map((game) => gameImgs.push(game.image[0]));
      games.map((game) =>
        gameURLs.push(`https://boardgamegeek.com/boardgame/${game.objectid}`)
      );

      for (let i = 0; i < gameNames.length; i++) {
        await pool.query(
          "INSERT INTO group_games (owner_id, group_id, members, game_name, game_bgg_url, game_img_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [
            req.user.id,
            group_id[0],
            members,
            gameNames[i],
            gameURLs[i],
            gameImgs[i],
          ]
        );
      }

      return res.status(201).json({
        msg: "Games added to group. Start swiping!",
        type: "SUCCESS",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        msg: "There was an error processing your request.",
        type: "DANGER",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "There was an error processing your request",
      type: "DANGER",
    });
  }
});

router.post("/create", authorization, async (req, res) => {
  try {
    const { newGroupName, contact_ids } = req.body;

    newGroupName.length > 30 &&
      res.json({
        msg:
          "Please choose a shorter name for your group. Character limit is 30.",
        type: "DANGER",
      });

    //sorting the id's helps keep a consistent foreign_key for 'members' columns
    contact_ids.sort();

    const groupNameExists = await pool.query(
      "SELECT group_name FROM user_groups WHERE group_name = $1 AND owner_id = $2",
      [newGroupName[0], req.user.id]
    );

    if (groupNameExists.rows.length > 0) {
      return res.status(203).json({
        msg: "You already own a group with that name.",
        type: "INFO",
      });
    }

    contact_ids.unshift(req.user.id);

    const groupExists = await pool.query(
      "SELECT members FROM user_groups WHERE members LIKE ('%' || $1 || '%') AND owner_id = $2",
      [contact_ids, req.user.id]
    );

    if (groupExists.rows.length > 0) {
      return res.status(203).json({
        msg: "You already own a group with those contacts.",
        type: "WARNING",
      });
    }

    await pool.query(
      "INSERT INTO user_groups (owner_id, group_name, members) VALUES ($1, $2, $3)",
      [req.user.id, newGroupName[0], contact_ids]
    );

    return res
      .json({
        msg: "Group created",
        type: "SUCCESS",
      })
      .status(201);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "There was an error processing your request",
      type: "DANGER",
    });
  }
});

module.exports = router;
