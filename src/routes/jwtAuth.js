require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

router.post("/register", validInfo, async (req, res) => {
  const { email, user_name, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res
        .status(401)
        .json({ msg: "User already exist!", type: "WARNING" });
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [user_name, email, bcryptPassword]
    );

    const jwt_token = jwtGenerator(newUser.rows[0].user_id);
    const new_user_name = newUser.rows[0].user_name;
    const user_id = newUser.rows[0].user_id;
    return res.status(201).json({
      msg: "Account creation successful!",
      type: "SUCCESS",
      new_user_name,
      jwt_token,
      user_id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      msg: "There was an error processing your request",
      type: "DANGER",
    });
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res
        .status(401)
        .json({ msg: "Invalid Credential", type: "WARNING" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ msg: "Invalid Credential", type: "WARNING" });
    }

    const { user_name, user_id } = user.rows[0];
    const jwt_token = jwtGenerator(user.rows[0].user_id);

    return res.status(201).json({
      type: "SUCCESS",
      msg: "Logged in successfully!",
      jwt_token,
      user_name,
      user_id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "There was an error processing your request.",
      type: "DANGER",
    });
  }
});

router.get("/verify", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT user_name, user_id FROM users WHERE user_id = $1",
      [req.user.id]
    );

    if (user.rows.length > 0) {
      const { user_name, user_id } = user.rows[0];

      const userGroups = await pool.query(
        "SELECT group_name, group_id FROM user_groups WHERE members LIKE ('%' || $1 || '%')",
        [user_id]
      );

      let groups = [];

      const groupData = userGroups.rows;

      for (const [key, val] of Object.entries(groupData)) {
        var obj = {};
        if (key) {
          obj["label"] = val.group_name;
          obj["value"] = val.group_id;
          groups.push(obj);
        }
      }

      const userContacts = await pool.query(
        "SELECT contact_name, contact_id FROM contacts WHERE user_id = $1",
        [user_id]
      );

      const contactData = userContacts.rows;

      let contacts = [];
      for (const [key, val] of Object.entries(contactData)) {
        var obj = {};
        if (key) {
          obj["label"] = val.contact_name;
          obj["value"] = val.contact_id;
          contacts.push(obj);
        }
      }

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
        .json({
          msg: "User authenticated!",
          type: "SUCCESS",
          user_name,
          user_id,
          status: true,
          groups,
          contacts,
          lists,
        })
        .status(200);
    } else {
      res.status(401).json({ msg: "Not an authorized user", type: "WARNING" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error", type: "DANGER" });
  }
});

router.delete("/delete-account", authorization, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM users WHERE user_id = $1 AND user_email = $2",
      [req.user.id, req.body.email]
    );

    res
      .status(200)
      .json({ msg: "Your account has been deleted.", type: "SUCCESS" });
  } catch (error) {
    res.status(500).json({
      msg: "Server error. Try checking your email address for typos.",
      type: "DANGER",
    });
  }
});

module.exports = router;
