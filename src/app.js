require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const app = express()
const { NODE_ENV } = require('./config')
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';
app.use(morgan(morganOption))
app.use(helmet())
app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_ORIGIN
}))

app.get('/', (req, res) => {
    res.send('Hello, world! Welcome to the Get it to the Table API!')
})

app.use('/bga-auth', require('./routes/bga-auth'))

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", CLIENT_ORIGIN);
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     next();
// });


app.use((error, req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', 'https://get-it-to-the-table.vercel.app/');
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'Server Error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})


module.exports = app