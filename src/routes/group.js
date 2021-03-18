const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const tsReplace = require("ts-replace-all");
const { CLIENT_ID } = require("../config");
const authorization = require("../middleware/authorization");

let client_id = CLIENT_ID;

router.post("/add_list", authorization, async (req, res) => {
  try {
    let { group_id, list_id } = req.body;

    const groupListExists = await pool.query(
      "SELECT group_id FROM group_lists WHERE group_id = $1 AND list_id = $2",
      [group_id[0], list_id[0]]
    );

    if (groupListExists.rows.length > 0) {
      return res
        .status(400)
        .json({ msg: "That group already has that list in it!", type: "INFO" });
    }

    await pool.query(
      "INSERT INTO group_lists (group_id, list_id, owner_id) VALUES ($1, $2, $3)",
      [group_id[0], list_id[0], req.user.id]
    );

    const groupMembers = await pool.query(
      "SELECT members FROM user_groups WHERE group_id = $1",
      [group_id[0]]
    );

    const members = groupMembers.rows[0].members;

    var options = {
      method: "GET",
      url: "https://www.boardgameatlas.com/api/search",
      params: {
        client_id,
        list_id: list_id[0],
      },
      headers: {
        "content-type": "application/json",
      },
    };

    let gameNames = [];
    let gameImgs = [];
    let gameURLs = [];

    const getBGAList = async () => {
      try {
        const response = await axios.request(options);

        //the BGA api randomly uses a non standard minus sign/ dash ( – ) compare to the standard one ( – - ). it causes fetch errors client side when swiping.
        response.data.games.map((game) =>
          gameNames.push(game.name.replaceAll("–", "-"))
        );
        response.data.games.map((game) => gameImgs.push(game.images.medium));
        response.data.games.map((game) => gameURLs.push(game.url));

        for (let i = 0; i < gameNames.length; i++) {
          await pool.query(
            "INSERT INTO group_games (owner_id, group_id, members, game_name, game_bga_url, game_img_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
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

        res.status(201).json({
          msg: "Games added to group. Start swiping!",
          type: "SUCCESS",
        });

        //this query deletes duplicate game entries. BGA lists allow games to be duplicated
        await pool.query(
          "DELETE FROM group_games USING group_games duplicates WHERE group_games.id < duplicates.id AND group_games.game_name = duplicates.game_name AND group_games.group_id = $1",
          [group_id[0]]
        );

        return;
      } catch (error) {
        console.error(error.message);
        res.status(500).json({
          msg: "There was an error processing your request.",
          type: "DANGER",
        });
      }
    };

    getBGAList();
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
