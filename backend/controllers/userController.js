const User = require('../models/User')
const { sendSuccess } = require('../utils/responseHandler')

// @desc    Ambil data profil user yang sedang login
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
	try {
		// req.user didapatkan dari authMiddleware (protect)
		const user = await User.findById(req.user.id).select('-password')
		return sendSuccess(res, 'Profil user berhasil diambil', user)
	} catch (error) {
		next(error)
	}
}

// @desc    Update data profil user (Nama & Nomor Telepon)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id)

		if (!user) {
			res.status(404)
			throw new Error('User tidak ditemukan')
		}

		// Update field yang diizinkan saja (jangan izinkan ubah email/role di sini demi keamanan)
		user.name = req.body.name || user.name
		user.phoneNumber = req.body.phoneNumber || user.phoneNumber

		const updatedUser = await user.save()

		// Kembalikan data user terbaru tanpa password
		const responseData = updatedUser.toObject()
		delete responseData.password

		return sendSuccess(res, 'Profil berhasil diperbarui', responseData)
	} catch (error) {
		next(error)
	}
}
