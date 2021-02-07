const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: process.env.DATABASE
})

// const pool = new Pool({
//     user: 'chris',
//     host: 'localhost',
//     port: 5432,
//     database: 'gittt'
// })

//TEST POOL

// const pool = new Pool({
//     user: 'chris',
//     host: 'localhost',
//     port: 5432,
//     database: 'food-desert-test'
// })

module.exports = pool;