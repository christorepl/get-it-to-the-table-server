const router = require('express').Router()
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, GRANT_TYPE } = require('../config')
const axios = require("axios")
const qs = require('qs')
const authURL = 'https://api.boardgameatlas.com/oauth/token'

router.post("/auth", (req, res, next) => {
    console.log('request received')
    console.log('here is the body', req.body.code)
    console.log('that was req.body.code')
    let code = req.body.code
    let client_id = CLIENT_ID
    let client_secret = CLIENT_SECRET
    let redirect_uri = REDIRECT_URI
    let grant_type = GRANT_TYPE
    axios({
        method: 'POST',
        url: authURL,
        data: qs.stringify({
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type
        }),
        headers: {
            'content-type' : 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        console.log(response.data)
        res.json(response.data)
    }).catch(error => {
        console.log(error)
        res.json(error)
    })

})


// const params = new URLSearchParams()
// params.append('client_id', client_id)
// params.append('client_secret', client_secret)
// params.append('code', code)
// params.append('redirect_uri', redirect_uri)
// params.append('grant_type', grant_type)
// const config = {
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }
// axios.post(authURL, params, config)
//     .then(response => {
//         console.log(response)
//         res.json(response).status(201)
//     })
//     .catch(error => {
//         console.log(error)
//         res.json('axios node error').status(503)
//     })



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
