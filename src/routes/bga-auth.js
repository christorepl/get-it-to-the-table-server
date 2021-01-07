const router = require('express').Router()
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, GRANT_TYPE, STATE } = require('../config')
const fetch = require('node-fetch')
const axios = require("axios").default;

router.post("/auth", (req, res, next) => {
    console.log('request received')
    console.log('here is the body', req.body.code)
    console.log('that was req.body.code')
    let code = req.body.code
    let client_id= "LN1xFTrB6e"
    let client_secret = "17c218619e19b928562296f2edbdc711"
    let redirect_uri= "https://get-it-to-the-table.vercel.app/bga-auth/"
    let grant_type ="authorization_code"
    let body = `client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&grant_type=${grant_type}&code=${code}`
    console.log('body string: ', body)

    fetch('https://api.boardgameatlas.com/oauth/token', {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body
    }).then(response => {
        if (response.ok) {
            response.json().then(json => {
                console.log('success')
                res.json(json).status(200)
            })
        }
    }).catch(function(error) {
        console.log('server error ', error, 'pooped out at error')
    })



})



// var options = {
//     method: 'POST',
//     url: 'https://get-it-to-the-table.vercel.app/bga-auth/',
//     headers: {
//         "content-type": "application/x-www-form-urlencoded"
//     },
//     body
// }
// console.log('options ', options)

// axios.request(options).then(function (response) {
//     console.log(response)
//     res.json(response)
// }).catch(function(error) {
//     console.error('server error', error, 'poop')
// })



module.exports = router

// router.post('/', (req, res, next) => {
//     fetch('https://api.boardgameatlas.com/oauth/token', {
//         method: "POST",
//         headers: {
//             "content-type": "application/x-www-form-urlencoded"
//         },
//         body: 
//             `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&grant_type=${GRANT_TYPE}&code=${code}`
//     }).then(response => {
//         if (response.ok) {
//             response.json().then(json => {
//                 res.json(json).status(200)
//             })
//         }
//     }).catch(function(error) {
//         console.log(error)
//     })
// })
