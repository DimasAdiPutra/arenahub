const express = require('express')
const router = express.Router()
const { registerUser, loginUser } = require('../controllers/authController')

// IMPORT auth middleware
const { protect, authorize } = require('../middleware/authMiddleware')

// Jalur: /api/auth/register
router.post('/register', registerUser)

// Jalur: /api/auth/login
router.post('/login', loginUser)

// Rute Privat Contoh 1: Harus Login dulu baru bisa lihat data profil sendiri
router.get('/me', protect, (req, res) => {
	res.json({
		success: true,
		message: 'Data profil berhasil diambil',
		data: req.user, // req.user disuntikkan otomatis oleh middleware protect tadi
	})
})

// Rute Privat Contoh 2: Hanya bisa diakses jika sudah login DAN akunnya adalah 'owner'
router.get('/owner-only', protect, authorize('owner'), (req, res) => {
	res.json({
		success: true,
		message: 'Selamat datang di area rahasia Owner Lapangan!',
	})
})

module.exports = router
