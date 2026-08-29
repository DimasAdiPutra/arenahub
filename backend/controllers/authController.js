const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendSuccess } = require('../utils/responseHandler') // Import helper

exports.registerUser = async (req, res, next) => {
	try {
		const { name, email, password, role, phoneNumber } = req.body

		// 1. Validasi Nomor Telepon (Hanya Boleh Angka, Min 10, Max 15 digit)
		const phoneRegex = /^[0-9]+$/
		if (!phoneRegex.test(phoneNumber)) {
			res.status(400)
			throw new Error('Nomor telepon hanya boleh berisi angka!')
		}

		// 2. Validasi Kekuatan Password (Min 8 karakter, Min 1 Huruf Besar, Min 1 Huruf Kecil)
		// Regex: (?=.*[a-z]) -> min 1 huruf kecil, (?=.*[A-Z]) -> min 1 huruf besar, {8,} -> min 8 karakter
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
		if (!passwordRegex.test(password)) {
			res.status(400)
			throw new Error(
				'Password harus minimal 8 karakter, mengandung minimal 1 huruf besar dan 1 huruf kecil!',
			)
		}

		const userExists = await User.findOne({ email })
		if (userExists) {
			res.status(400)
			throw new Error('Email sudah terdaftar')
		}

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const user = await User.create({
			name,
			email,
			phoneNumber,
			password: hashedPassword,
			role,
			phoneNumber,
		})

		// Menggunakan Standarisasi Sukses
		return sendSuccess(
			res,
			'Registrasi berhasil!',
			{
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			201,
		)
	} catch (error) {
		next(error) // Otomatis ditangkap oleh errorMiddleware.js
	}
}

exports.loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body

		const user = await User.findOne({ email })
		if (!user) {
			res.status(400)
			throw new Error('Email atau password salah')
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			res.status(400)
			throw new Error('Email atau password salah')
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET || 'rahasiasuperkuat',
			{ expiresIn: '1d' },
		)

		// Menggunakan Standarisasi Sukses
		return sendSuccess(res, 'Login berhasil!', {
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})
	} catch (error) {
		next(error) // Otomatis ditangkap oleh errorMiddleware.js
	}
}
