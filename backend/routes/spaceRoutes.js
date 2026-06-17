const express = require('express')
const router = express.Router()
const multer = require('multer')
const {
	createSpace,
	getAllSpaces,
	getSpaceById,
	updateSpace,
	deleteSpace,
} = require('../controllers/spaceController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Inisialisasi Multer dengan Memory Storage (Disimpan di RAM sementara)
const storage = multer.memoryStorage()
const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // Batasi maksimal ukuran per file: 5MB
	fileFilter: (req, file, cb) => {
		// Validasi ekstensi file gambar
		if (file.mimetype.startsWith('image/')) {
			cb(null, true)
		} else {
			cb(new Error('Hanya diperbolehkan mengunggah file gambar!'), false)
		}
	},
})

// Jalur: /api/spaces
router
	.route('/')
	.get(getAllSpaces) // Publik: Untuk halaman pencarian customer
	.post(
		protect,
		authorize('owner'),
		upload.array('images', 5), // 'images' adalah nama field key saat mengirim dari REST Client / Form data,
		createSpace,
	) // Privat: Meng-handle input ObjectId ATAU String teks baru

// Jalur: /api/spaces/:id
router
	.route('/:id')
	.get(getSpaceById) // Publik: Siapa pun bisa lihat detail lapangan
	.put(protect, authorize('owner'), updateSpace) // Privat: Hanya owner pemiliknya
	.delete(protect, authorize('owner'), deleteSpace) // Privat: Hanya owner pemiliknya

module.exports = router
