const multer = require('multer')
const storage = multer.memoryStorage()

exports.upload = multer({
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
