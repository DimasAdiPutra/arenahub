const express = require('express')
const router = express.Router()
const {
	createBooking,
	getMyBookings,
	handleMidtransNotification,
	checkAvailability,
} = require('../controllers/bookingController')
const { protect, authorize } = require('../middleware/authMiddleware')

// 1. Rute Webhook (Publik: Ditembak langsung oleh server Midtrans)
router.post('/webhook', handleMidtransNotification)

router.route('/check-availability').get(checkAvailability)

// 2. Rute Membutuhkan Login (Protect)
router.use(protect)

router.route('/').post(authorize('customer'), createBooking)

router.route('/my-bookings').get(authorize('customer'), getMyBookings)

module.exports = router
