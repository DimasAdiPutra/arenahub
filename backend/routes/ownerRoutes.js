const express = require('express')
const router = express.Router()
const { getOwnerDashboardData } = require('../controllers/ownerController')
const { protect, authorize } = require('../middleware/authMiddleware')

router
	.route('/dashboard')
	.get(protect, authorize('owner'), getOwnerDashboardData)

module.exports = router
