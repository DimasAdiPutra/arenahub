const express = require('express')
const router = express.Router()
const {
	getCategories,
	createCategory,
} = require('../controllers/categoryController')
const { protect } = require('../middleware/authMiddleware')

// Jalur: /api/categories
router
	.route('/')
	.get(getCategories) // Publik: Frontend mengambil data untuk isi dropdown
	.post(protect, createCategory) // Opsional: Jika admin ingin input manual

module.exports = router
