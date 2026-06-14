const express = require('express')
const router = express.Router()
const {
	getUserProfile,
	updateUserProfile,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

// Semua rute di file ini wajib login (protect)
router.use(protect)

router.route('/profile').get(getUserProfile).put(updateUserProfile)

module.exports = router
