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
		},
		password: {
			type: String,
			required: [true, 'Password wajib diisi'],
			minlength: [6, 'Password minimal 6 karakter'],
		},
		role: {
			type: String,
			enum: ['customer', 'owner'],
			default: 'customer',
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true, // Otomatis membuat kolom createdAt dan updatedAt
	},
)

module.exports = mongoose.model('User', UserSchema)
