const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: process.env.DATABASE
})

//TEST POOL

// const pool = new Pool({
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     host: process.env.HOST,
//     port: process.env.DBPORT,
//     database: 'gittt-test'
// })

module.exports = pool;