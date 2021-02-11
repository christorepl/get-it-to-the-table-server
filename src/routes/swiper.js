const express = require('express')
const router = express.Router()
const pool = require('../db')
const tsReplace = require('ts-replace-all')
const authorization = require('../middleware/authorization')

router.get('/:group_id', authorization, async (req, res) => {
    try {
        const user_id = req.user.id
        const group_id = req.params.group_id

        const groupGames = await pool.query(
            "SELECT game_bga_url, game_img_url, game_name, matched FROM group_games WHERE group_id = $1 AND swipers NOT LIKE ('%' || $2 || '%')", [group_id, user_id]
        )

        const groupMatchedGames = await pool.query(
            'SELECT game_bga_url, game_name FROM group_games WHERE group_id = $1 AND matched = $2', [group_id, true]
        )

        res.json({data: {games: groupGames.rows, matchedGames: groupMatchedGames.rows}})

    } catch (error) {
        console.error(error.message)
        res.status(500).json({msg: 'Server error.'})
    }
})

router.put('/:group_id', authorization, async (req, res) => {
    try {
        const { game_name, swipe_direction } = req.headers
        const user_id = req.user.id
        const group_id = req.params.group_id

        const memberList = await pool.query(
            'SELECT members FROM group_games WHERE game_name = $1 AND group_id = $2', [game_name, group_id]
        )
        
        let members

        if (memberList.rows.length > 0) {

            const membersObj = memberList.rows[0].members
            
            const membersString = membersObj.replaceAll('{', '').replaceAll('}', '').replaceAll('"', '')
    
            members = membersString.split(',')
        } else {
            res.json({msg: 'Group does not exist!'}).status(400)
        }
        

        const swiperList = await pool.query(
            'SELECT swipers FROM group_games WHERE game_name = $1 AND group_id = $2', [game_name, group_id]
        )

        const swipersString = swiperList.rows[0].swipers.replaceAll('{', '').replaceAll('}', '').replaceAll('\\', '').replaceAll('"', '').replaceAll("'", '')

        let swipersArray

        if (swipersString) {
            swipersArray = swipersString.split(',')
        }

        let swipers = []

        if(swipersArray) {
            for (let i = 0; i < swipersArray.length; i++) {
                swipers.push(swipersArray[i])
            }
        }

        swipers.push(user_id)

        const swipeList = await pool.query(
            'SELECT swipes FROM group_games WHERE game_name = $1 AND group_id = $2', [game_name, group_id]
        )

        const swipesString = swipeList.rows[0].swipes.replaceAll('{', '').replaceAll('}', '').replaceAll('\\', '').replaceAll('"', '').replaceAll("'", '')
        
        let swipesArray

        if (swipesString) {
            swipesArray = swipesString.split(',')
        }

        let swipes = []

        if(swipesArray) {
            for (let i = 0; i < swipesArray.length; i++) {
                swipes.push(swipesArray[i])
            }
        }

        swipes.push(swipe_direction)
        
        await pool.query(
            'UPDATE group_games SET swipers = $1, swipes = $2 WHERE game_name = $3 AND group_id = $4', [swipers, swipes, game_name, req.params.group_id]
        )

        //once members.length is equal to swipers.length, we have to decide to either delete the game from the table if anyone swiped left, or designate it a match and send a msg to the group

        if(swipers.length === members.length) {
            const anyoneSwipedLeft = swipes.filter(swipe => swipe === 'l')

            if(anyoneSwipedLeft.length) {
                await pool.query(
                    'DELETE FROM group_games WHERE group_id = $1 AND game_name = $2', [group_id, game_name]
                )
            } else {
                await pool.query(
                    'UPDATE group_games SET matched = $1 WHERE game_name = $2 AND group_id = $3', [true, game_name, group_id]
                )
                res.json({msg: `Everyone in your group swiped right on ${game_name}! You can now find it in your matched games list for this group.`}).status(200)
            }
        } else {
            res.json({info: 'Swipe recorded'}).status(200)
        }
    } catch (error) {
        console.error(error.message)
        res.json({msg: 'Server Error'}).status(500)
    }

})

module.exports = router