const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Nama kategori wajib diisi'],
			unique: true, // Mencegah nama kategori ganda (misal: 'Futsal' dua kali)
			trim: true,
		},
		slug: {
			type: String,
			lowercase: true,
			unique: true,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Category', CategorySchema)
