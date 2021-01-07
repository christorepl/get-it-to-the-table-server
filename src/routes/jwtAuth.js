require('dotenv').config();
const express = require("express");
const router = express.Router()
const bcrypt = require('bcrypt')
const pool = require('../db')
const validInfo = require('../middleware/validInfo')
const jwtGenerator = require('../utils/jwtGenerator')
const authorization = require('../middleware/authorization')

router.post('/register', validInfo, async (req, res) => {
    const { email, user_name, password } = req.body;
    console.log(email, user_name, password)
  
    try {
      const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [
        email
      ]);
      if (user.rows.length > 0) {
        return res.status(401).json('User already exist!');
      }

      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(password, salt);

      let newUser = await pool.query(
        'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
        [user_name, email, bcryptPassword]
      );

      const jwt_token = jwtGenerator(newUser.rows[0].user_id);
      const new_user_name = newUser.rows[0].user_name
      return res.status(201).json({ new_user_name, jwt_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
});
  
router.post('/login', validInfo, async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [
        email
      ]);
  
      if (user.rows.length === 0) {
        return res.status(401).json('Invalid Credential');
      }
  
      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].user_password
      );
  
      if (!validPassword) {
        return res.status(401).json('Invalid Credential');
      }
      const user_name = user.rows[0].user_name
      const jwt_token = jwtGenerator(user.rows[0].user_id);
      return res.status(201).json({ jwt_token, user_name });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
});
  
router.get('/verify', authorization, async (req, res) => {
    try {
      const user = await pool.query("SELECT user_name FROM users WHERE user_id = $1", [req.user.id])
      const user_name = user.rows[0].user_name
      res.json({user_name, status: true}).status(200);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
});
  
module.exports = router;