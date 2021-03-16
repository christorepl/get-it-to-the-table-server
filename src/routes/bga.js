const router = require("express").Router();
const { CLIENT_ID } = require("../config");
const axios = require("axios");
const pool = require("../db");
const authorization = require("../middleware/authorization");

let client_id = CLIENT_ID;

router.get("/user-lists/search", authorization, async (req, res) => {
  const list_id = req.query.list_id;
  const list_name = req.headers.list_name;
  const user_id = req.user.id;

  var options = {
    method: "GET",
    url: "https://www.boardgameatlas.com/api/search",
    params: {
      client_id,
      list_id,
    },
    headers: {
      "content-type": "application/json",
    },
  };

  const getBGAList = async () => {
    try {
      const listAlreadyExists = await pool.query(
        "SELECT * FROM user_lists WHERE user_id = $1 AND list_id = $2",
        [user_id, list_id]
      );

      if (listAlreadyExists.rows.length > 0) {
        return res
          .status(400)
          .json({ msg: "You have already imported that list!", type: "INFO" });
      }

      await axios.request(options);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        msg:
          "There was an error while fetching data from the Board Game Atlas API! Please try again soon.",
        type: "WARNING",
      });
    }

    await pool.query(
      "INSERT INTO user_lists (user_id, list_name, list_id) VALUES ($1, $2, $3) RETURNING list_id, list_name",
      [user_id, list_name, list_id]
    );

    const userLists = await pool.query(
      "SELECT list_name, list_id FROM user_lists WHERE user_id = $1",
      [user_id]
    );

    const listData = userLists.rows;

    let lists = [];
    for (const [key, val] of Object.entries(listData)) {
      var obj = {};
      if (key) {
        obj["label"] = val.list_name;
        obj["value"] = val.list_id;
        lists.push(obj);
      }
    }
    res
      .status(201)
      .json({ msg: "List added to your account!", lists, type: "SUCCESS" });
  };

  getBGAList();
});

module.exports = router;
