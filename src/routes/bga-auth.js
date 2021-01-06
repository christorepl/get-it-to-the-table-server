const router = require('express').Router()
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, GRANT_TYPE, STATE } = require('../config')

router.post('/', (req, res, next) => {
    fetch('https://api.boardgameatlas.com/oauth/token', {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: 
            `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&grant_type=${GRANT_TYPE}&code=${code}`
    }).then(response => {
        if (response.ok) {
            response.json().then(json => {
                res.json(json).status(200)
            })
        }
    }).catch(function(error) {
        console.log(error)
    })
})
