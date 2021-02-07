const express = require('express')
const router = express.Router()
const pool = require('../db')
const axios = require('axios')
const { CLIENT_ID } = require('../config')
const authorization = require('../middleware/authorization')

let client_id = CLIENT_ID


router.post('/add_list', authorization, async (req, res) => {
    try {
    let { group_id, list_id } = req.body
    // console.log(group_id, list_id)

    const groupListExists = await pool.query(
        'SELECT group_id FROM group_lists WHERE group_id = $1 AND list_id = $2', [group_id[0], list_id[0]]
    )

    // console.log(groupListExists.rows)

    if(groupListExists.rows.length > 0) {
        return res.json({msg: 'That group already has that list in it!'})
    }


    await pool.query(
        'INSERT INTO group_lists (group_id, list_id, owner_id) VALUES ($1, $2, $3)', [group_id[0], list_id[0], req.user.id]
    )
    
    
    const groupMembers = await pool.query(
        'SELECT members FROM user_groups WHERE group_id = $1', [group_id[0]]
    )

    // console.log('members are: ', groupMembers.rows)

    const members = groupMembers.rows[0].members

    var options = {
        method: 'GET',
        url: 'https://www.boardgameatlas.com/api/search',
        params: {
            client_id,
            list_id: list_id[0]
        },
        headers: {
            'content-type': 'application/json'
        }
    }

    let gameNames = []
    let gameImgs = []
    let gameURLs = []

    const getBGAList = async () => {
        try {
            const response = await axios.request(options)
            // console.log('poop', response.data.games)
            //group_games table needs: owner_id, group_id, list_id, members, game_name, game_img_url, game_bga_url
            response.data.games.map(game => gameNames.push(game.name))
            response.data.games.map(game => gameImgs.push(game.images.medium))
            response.data.games.map(game => gameURLs.push(game.url))

            for (let i = 0; i < gameNames.length; i++) {
            const insertedGames = await pool.query(
                'INSERT INTO group_games (owner_id, group_id, members, game_name, game_bga_url, game_img_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.user.id, group_id[0], members, gameNames[i], gameURLs[i], gameImgs[i]]
            )
            console.log(insertedGames.rows)
        
            }
        
        
            return res.status(201).json({msg: 'Games added to group. Now you can swipe on these games in the group you just selected!'})

        } catch (error) {
            console.error(error)
            res.status(500).json({msg:'Server Error.'})
        }
        
    }

    getBGAList()
    // res.json({msg: 'Turds!'})
        

    

    } catch (error) {
        console.error(error)
        res.status(500).json({msg: 'Server error'})
    }
})

router.post('/create', authorization, async (req, res) => {
    try {
    const  { newGroupName, contact_ids } = req.body
    contact_ids.sort()
    console.log(contact_ids)

    newGroupName.length > 30 && res.json('Please choose a shorter name for your group. Character limit is 30.')

    const groupNameExists = await pool.query('SELECT group_name FROM user_groups WHERE group_name = $1 AND owner_id = $2', [newGroupName[0], req.user.id])

    if (groupNameExists.rows.length > 0) {
        return res.status(203).json('You already own a group with that name. Please select a different name.')
    }
    
    contact_ids.unshift(req.user.id)
    // console.log(contact_ids)
    
    const groupExists = await pool.query("SELECT members FROM user_groups WHERE members LIKE ('%' || $1 || '%') AND owner_id = $2", [contact_ids, req.user.id])

    if (groupExists.rows.length > 0) {
        return res.status(203).json('You already own a group with those contacts. Please don\'t double up on groups, this free app can only host so much!')
    }

    await pool.query('INSERT INTO user_groups (owner_id, group_name, members) VALUES ($1, $2, $3)', [req.user.id, newGroupName[0], contact_ids])
    
    // const userGroupData = []

    // const userMadeGroups = await pool.query('SELECT group_name, members FROM user_groups WHERE user_id = $1', [req.user.id])

    // if (userMadeGroups.rows.length > 0) {
    //     userGroupData.push(userMadeGroups.rows)
    // }

    // const userMemberOfGroups = await pool.query('SELECT group_name, members FROM user_groups WHERE members = $1', [req.user.id])

    // if(userMemberOfGroups.rows.length > 0) {
    //     userGroupData.push(userMemberOfGroups.rows)
    // }

    return res.json({msg:'good job'}).status(201)

    } catch(error) {
        console.error(error.message)
        res.status(500).json('Server error')
    }
})

module.exports = router