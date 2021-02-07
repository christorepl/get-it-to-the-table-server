const express = require('express')
const router = express.Router()
// const { Pool } = require('pg')
const authorization = require('../middleware/authorization')
const pool = require('../db')

router.get('/', authorization, async (req, res) => {
    try {
        const allContacts = await pool.query(
            'SELECT contact_name, contact_id FROM contacts WHERE user_id = $1', [req.user.id]
        )
        res.json(allContacts)
    } catch (error) {
        console.error(error.message)
    }
})

router.post('/', authorization, async (req, res) => {
    try {
        const { contact_name, contact_id } = req.body
        if (contact_id === req.user.id) {
            res.status(412).json({msg: 'You cannot add yourself to your contacts!'})
            return
        }

        const contactAlreadyExists = await pool.query(
            'SELECT * FROM contacts WHERE user_id = $1 AND contact_id = $2', [req.user.id, contact_id]
        )

        if(contactAlreadyExists.rows.length > 0) {
            res.status(412).json({msg:'You already have that person in your contacts!'})
            return
        }

        const createContact = await pool.query(
            'INSERT INTO contacts (user_id, contact_id, contact_name) VALUES ($1, $2, $3) RETURNING contact_id, contact_name', [req.user.id, contact_id, contact_name]
        )
        
        res.json({msg: 'Contact added!', newContact: createContact.rows[0]})

    } catch(error) {
        res.json({msg:'Bad new contact data! Please check the contact ID.'})
        console.error(error.message, 'in the contacts route')
    }
})

module.exports = router