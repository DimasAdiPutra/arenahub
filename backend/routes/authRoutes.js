const express = require('express')
const router = express.Router()
const { registerUser, loginUser } = require('../controllers/authController')

// Jalur: /api/auth/register
router.post('/register', registerUser)

// Jalur: /api/auth/login
router.post('/login', loginUser)

module.exports = router
