// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Middleware untuk memverifikasi apakah user sudah login (punya token valid)
 */
exports.protect = async (req, res, next) => {
	let token

	// 1. Periksa apakah ada token di header 'Authorization' dan formatnya 'Bearer <token>'
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			// 2. Ambil tokennya saja (memisahkan kata 'Bearer' dengan 'Token-Asli')
			token = req.headers.authorization.split(' ')[1]

			// 3. Verifikasi token menggunakan JWT_SECRET
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || 'rahasiasuperkuat',
			)

			// 4. Ambil data user dari DB berdasarkan ID di token (tanpa membawa password)
			// Lalu tempelkan ke objek 'req.user' agar bisa diakses oleh controller selanjutnya
			req.user = await User.findById(decoded.id).select('-password')

			if (!req.user) {
				res.status(401)
				throw new Error('User pemilik token ini sudah tidak ada lagi')
			}

			// 5. Lolos! Lanjut ke fungsi/controller berikutnya
			return next()
		} catch (error) {
			res.status(401)
			return next(
				new Error(
					'Sesi masuk habis atau token tidak valid, silakan login ulang',
				),
			)
		}
	}

	// Jika tidak ada token sama sekali di header
	if (!token) {
		res.status(401)
		return next(new Error('Akses ditolak, Anda harus login terlebih dahulu'))
	}
}

/**
 * Middleware untuk membatasi akses berdasarkan Role khusus (misal: hanya untuk Owner)
 */
exports.authorize = (...roles) => {
	return (req, res, next) => {
		// req.user didapatkan dari middleware 'protect' di atas
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403) // Forbidden
			return next(
				new Error(
					`Role (${req.user?.role || 'Guest'}) tidak diizinkan mengakses fitur ini`,
				),
			)
		}
		next()
	}
}
