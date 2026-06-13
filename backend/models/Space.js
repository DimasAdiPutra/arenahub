const mongoose = require('mongoose')

const SpaceSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: [true, 'Nama tempat/lapangan wajib diisi'],
			trim: true,
		},
		description: {
			type: String,
			required: [true, 'Deskripsi wajib diisi'],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			required: [true, 'Kategori wajib diisi'],
		},
		pricePerHour: {
			type: Number,
			required: [true, 'Harga per jam wajib diisi'],
		},
		location: {
			type: String,
			required: [true, 'Lokasi/Alamat wajib diisi'],
		},
		images: [String], // Menyimpan array URL gambar lapangan
		facilities: [String], // Contoh: ['Sewa Sepatu', 'Kantin', 'Kamar Mandi']
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('Space', SpaceSchema)
