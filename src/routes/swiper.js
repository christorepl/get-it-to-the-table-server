const express = require('express')
const router = express.Router()
const pool = require('../db')
const authorization = require('../middleware/authorization')

router.get('/:group_id', authorization, async (req, res) => {
    try {

        // const test = await pool.query(
        //     "SELECT * FROM group_games WHERE group_id = $1 AND members LIKE ('%' || $2 || '%')", [req.params.group_id, req.user.id]
        // )

        const user_id = req.user.id

        const groupGames = await pool.query(
            "SELECT game_bga_url, game_img_url, game_name, matched FROM group_games WHERE group_id = $1 AND swipers NOT LIKE ('%' || $2 || '%')", [req.params.group_id, user_id]
        )

        console.log(groupGames.rows)

        res.json({data: {games: groupGames.rows}})

        // console.log(groupGames.rows)

    } catch (error) {
        console.error('try catch error')
        res.status(500).json({msg: 'Server error.'})
    }
})

router.post('/:group_id', authorization, async (req, res) => {
    const {game_name, swipe_direction} = req.headers
    const user_id = req.user.id
    // console.log(game_name, swipe_direction)
    
    const swiperList = await pool.query(
        'SELECT swipers FROM group_games WHERE game_name = $1', [game_name]
    )

    // console.log(swiperList.rows[0].swipers)

    const swipersObj = swiperList.rows[0].swipers

    // const fipsString = fips.replaceAll('"', '').replaceAll('{', '').replaceAll('}', '').replaceAll('[', '').replaceAll(']', '')
    // const fipsIds = fipsString.split(',')
    // let fipsArray = []
    // for (let i = 0; i < fipsIds.length; i++){
    //     fipsArray.push({"value": fipsIds[i]})
    // }
    
    const swipersString = swipersObj.replace('{', '').replace('}', '')

    let swipers = []

    if(swipersString) {
        console.log('heya')
        swipers.push(swipersString.split(','))
    }

    console.log(swipers)

    swipers.push(req.user.id)
    
    const test = await pool.query(
        "UPDATE group_games SET swipers = $1 WHERE game_name = $2 AND group_id = $3 RETURNING *", [swipers, game_name, req.params.group_id]
    )

    res.json('love ya')

    // console.log(test.rows)

})

module.exports = router