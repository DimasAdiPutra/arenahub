const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		space: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Space',
			required: true,
		},
		date: {
			type: Date,
			required: [true, 'Tanggal booking wajib diisi'],
		},
		bookedHours: {
			type: [Number], // Array jam yang dipilih, contoh: [14, 15] berarti jam 14:00 - 16:00
			required: [true, 'Jam booking wajib diisi'],
		},
		totalPrice: {
			type: Number,
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ['pending', 'success', 'failed', 'expired'],
			default: 'pending',
		},
		midtransOrderId: {
			type: String,
			unique: true,
			required: true,
		},
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('Booking', BookingSchema)
