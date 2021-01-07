const router = require('express').Router()
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, GRANT_TYPE, STATE } = require('../config')
const axios = require("axios").default;

router.post("/auth", async (req, res, next) => {
    console.log(req)
    var options = {
        method: 'POST',
        url: 'https://api.boardgameatlas.com/oauth/token',
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body:
        `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&grant_type=${GRANT_TYPE}&code=${code}`
    }

    axios.request(options).then(function (response) {
        res.json(response)
    }).catch(function (error) {
        console.error(error)
    })
})

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
