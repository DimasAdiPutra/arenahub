const Category = require('../models/Category')
const { sendSuccess } = require('../utils/responseHandler')

// @desc    Buat Kategori Baru (Admin/Sistem)
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
	try {
		const { name } = req.body

		const category = await Category.create({ name })

		return sendSuccess(res, 'Kategori berhasil ditambahkan', category, 201)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Semua Kategori (Untuk Dropdown/Filter Frontend)
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find().sort({ name: 1 }) // Urutkan abjad A-Z
		return sendSuccess(res, 'Daftar kategori berhasil diambil', categories)
	} catch (error) {
		next(error)
	}
}
