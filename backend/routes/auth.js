const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const db = require('../db');


// ==================================================
// REGISTER
// ==================================================

router.post('/register', async (req, res) => {

    try {

        const {
            fullName,
            mobile,
            email,
            designation,
            department,
            state,
            district,
            tehsil,
            password
        } = req.body;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (
            !fullName ||
            !mobile ||
            !email ||
            !designation ||
            !department ||
            !state ||
            !district ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields.'
            });

        }


        // ------------------------------------------
        // CHECK EXISTING USER
        // ------------------------------------------

        const [existingUsers] = await db.execute(
            `
            SELECT id
            FROM users
            WHERE email = ? OR mobile = ?
            `,
            [email, mobile]
        );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message: 'Email or mobile number already registered.'
            });

        }


        // ------------------------------------------
        // HASH PASSWORD
        // ------------------------------------------

        const passwordHash = await bcrypt.hash(
            password,
            12
        );


        // ------------------------------------------
        // INSERT USER
        // ------------------------------------------

        const [result] = await db.execute(

            `
            INSERT INTO users
            (
                full_name,
                mobile,
                email,
                designation,
                department,
                state,
                district,
                tehsil,
                password_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,

            [
                fullName,
                mobile,
                email,
                designation,
                department,
                state,
                district,
                tehsil || null,
                passwordHash
            ]

        );


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        res.status(201).json({

            success: true,

            message: 'Account created successfully.',

            userId: result.insertId

        });


    } catch (error) {

        console.error(
            'REGISTER ERROR:',
            error
        );

        res.status(500).json({

            success: false,

            message: 'Server error while creating account.'

        });

    }

});



// ==================================================
// LOGIN
// ==================================================

router.post('/login', async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: 'Email and password are required.'

            });

        }


        // ------------------------------------------
        // FIND USER
        // ------------------------------------------

        const [users] = await db.execute(

            `
            SELECT
                id,
                full_name,
                mobile,
                email,
                designation,
                department,
                state,
                district,
                tehsil,
                password_hash
            FROM users
            WHERE email = ?
            `,

            [email]

        );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message: 'Invalid email or password.'

            });

        }


        const user = users[0];


        // ------------------------------------------
        // CHECK PASSWORD
        // ------------------------------------------

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordCorrect) {

            return res.status(401).json({

                success: false,

                message: 'Invalid email or password.'

            });

        }


        // ------------------------------------------
        // REMOVE PASSWORD HASH
        // ------------------------------------------

        delete user.password_hash;


        // ------------------------------------------
        // SEND USER
        // ------------------------------------------

        res.json({

            success: true,

            message: 'Login successful.',

            user

        });


    } catch (error) {

        console.error(
            'LOGIN ERROR:',
            error
        );

        res.status(500).json({

            success: false,

            message: 'Server error during login.'

        });

    }

});


module.exports = router;