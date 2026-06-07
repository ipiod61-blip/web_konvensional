const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.query('SELECT * FROM employees WHERE username = ? AND deleted_at IS NULL', [username]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User Not Found.' });
        }

        const user = users[0];
        const passwordIsValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).json({
                token: null,
                message: 'Invalid Password!'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: 86400 } // 24 hours
        );

        res.status(200).json({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            accessToken: token
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
