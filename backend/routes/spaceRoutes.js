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
const { upload } = require('../middleware/uploadMiddleware')

// Inisialisasi Multer dengan Memory Storage (Disimpan di RAM sementara)

// 🟢 PUBLIC (Bisa diakses siapa saja)
router.get('/', getAllSpaces)
router.get('/:id', getSpaceById)

// 🟢 PROTECTED (Hanya Owner yang bisa akses)
router.post(
	'/',
	protect,
	authorize('owner'),
	upload.array('images', 5),
	createSpace,
)
router.put(
	'/:id',
	protect,
	authorize('owner'),
	upload.array('images', 5),
	updateSpace,
)
router.delete('/:id', protect, authorize('owner'), deleteSpace)

module.exports = router
