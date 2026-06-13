const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Nama wajib diisi'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email wajib diisi'],
			unique: true,
			lowercase: true,
			trim: true,
			// TAMBAHKAN VALIDASI REGEX EMAIL DI SINI
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Format email tidak valid, pastikan menggunakan @ dan domain yang benar (misal: nama@mail.com)',
			],
		},
		password: {
			type: String,
			required: [true, 'Password wajib diisi'],
			minlength: [6, 'Password minimal harus 6 karakter atau lebih'],
		},
		role: {
			type: String,
			enum: {
				values: ['customer', 'owner'],
				message: 'Role harus berupa customer atau owner',
			},
			default: 'customer',
		},
		phoneNumber: {
			type: String,
			trim: true,
			required: [true, 'Nomor telepon wajib diisi'],
		},
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('User', UserSchema)
