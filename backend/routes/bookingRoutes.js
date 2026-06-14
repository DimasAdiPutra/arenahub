const express = require('express')
const router = express.Router()
const {
	createBooking,
	getMyBookings,
} = require('../controllers/bookingController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Semua rute booking wajib login dahulu
router.use(protect)

router.route('/').post(authorize('customer'), createBooking) // Hanya user dengan role 'customer' yang bisa nge-book

router.route('/my-bookings').get(authorize('customer'), getMyBookings)

module.exports = router
