const express = require('express')
const router = express.Router()
const {
	getOwnerDashboardData,
	getOwnerSpaces,
} = require('../controllers/spaceController')
const { protect, authorize } = require('../middleware/authMiddleware')

// 🟢 Dashboard & Ringkasan Khusus Owner
router.get('/dashboard', protect, authorize('owner'), getOwnerDashboardData)

// 🟢 List Arena Khusus Owner (untuk halaman Kelola Arena)
router.get('/my-spaces', protect, authorize('owner'), getOwnerSpaces)

module.exports = router
