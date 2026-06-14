const express = require('express')
const router = express.Router()
const {
	createSpace,
	getAllSpaces,
	getSpaceById,
	updateSpace,
	deleteSpace,
} = require('../controllers/spaceController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Jalur: /api/spaces
router
	.route('/')
	.get(getAllSpaces) // Publik: Untuk halaman pencarian customer
	.post(protect, authorize('owner'), createSpace) // Privat: Meng-handle input ObjectId ATAU String teks baru

// Jalur: /api/spaces/:id
router
	.route('/:id')
	.get(getSpaceById) // Publik: Siapa pun bisa lihat detail lapangan
	.put(protect, authorize('owner'), updateSpace) // Privat: Hanya owner pemiliknya
	.delete(protect, authorize('owner'), deleteSpace) // Privat: Hanya owner pemiliknya

module.exports = router
