const Booking = require('../models/Booking')
const Space = require('../models/Space')
const { sendSuccess } = require('../utils/responseHandler')

exports.getOwnerDashboardData = async (req, res, next) => {
	try {
		// 1. Ambil ID owner dari token JWT yang lolos middleware 'protect'
		const ownerId = req.user.id

		// 2. Cari semua lapangan (spaces) yang dimiliki oleh owner ini
		// (Pastikan schema Space punyamu memiliki field 'owner' yang mereferensikan User ID)
		const ownerSpaces = await Space.find({ owner: ownerId })
		const spaceIds = ownerSpaces.map((space) => space._id)

		console.log(spaceIds)

		// 3. Ambil hanya booking sukses yang lapangan-nya ada di dalam daftar milik owner ini saja
		const allSuccessBookings = await Booking.find({
			space: { $in: spaceIds },
			paymentStatus: 'success',
		})
			.populate('space', 'title pricePerHour')
			.sort({ date: -1 })

		// 4. Hitung Statistik eksklusif untuk owner ini
		const totalBookings = allSuccessBookings.length
		const totalHours = allSuccessBookings.reduce(
			(acc, curr) => acc + curr.bookedHours.length,
			0,
		)
		const revenue = allSuccessBookings.reduce(
			(acc, curr) => acc + curr.totalPrice,
			0,
		)
		const activeSpaces = ownerSpaces.length // Jumlah lapangan yang dia miliki

		// 5. Ambil 10 transaksi terbaru yang hanya melibatkan lapangan milik owner ini
		const recent = await Booking.find({ space: { $in: spaceIds } })
			.populate('space', 'title')
			.sort({ createdAt: -1 })
			.limit(10)

		// 6. Kirim respons bersih ke frontend
		return sendSuccess(res, 'Data dashboard owner berhasil dimuat', {
			statistics: {
				totalBookings,
				totalHours,
				revenue,
				activeSpaces,
			},
			recent,
			allSuccessBookings,
		})
	} catch (error) {
		next(error)
	}
}
