const Booking = require('../models/Booking')
const Space = require('../models/Space')
const { sendSuccess } = require('../utils/responseHandler')

// @desc    Buat Booking Baru (Customer)
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
	try {
		const { space: spaceId, date, bookedHours } = req.body

		// 1. Validasi input array jam
		if (
			!bookedHours ||
			!Array.isArray(bookedHours) ||
			bookedHours.length === 0
		) {
			res.status(400)
			throw new Error('Pilihlah minimal 1 jam slot lapangan')
		}

		// 2. Ambil data lapangan untuk mendapatkan harga per jam (pricePerHour)
		const space = await Space.findById(spaceId)
		if (!space) {
			res.status(404)
			throw new Error('Lapangan tidak ditemukan')
		}

		// 3. LOGIKA PENCEGAHAN TABRAKAN JADWAL (Sangat Mudah Berkat Array!)
		// Cari apakah ada booking yang sukses/pending di tanggal yang sama, dan jamnya bertabrakan
		const isSlotTaken = await Booking.findOne({
			space: spaceId,
			date: new Date(date),
			paymentStatus: { $in: ['pending', 'success'] }, // Slot terkunci jika status pending atau sudah bayar
			bookedHours: { $in: bookedHours }, // Pengecekan apakah ada jam yang sama di dalam array
		})

		if (isSlotTaken) {
			res.status(400)
			throw new Error(
				'Maaf, salah satu slot jam yang Anda pilih sudah dipesan orang lain',
			)
		}

		// 4. Hitung Total Harga Otomatis
		// Total = (Jumlah jam yang dipilih) x (Harga per jam lapangan)
		const totalPrice = bookedHours.length * space.pricePerHour

		// 5. Generate Order ID Unik untuk Midtrans Sementara (Mocking)
		// Format: ARNHB-TIMESTAMP-RANDOM_NUMBER
		const midtransOrderId = `ARNHB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

		// 6. Simpan data booking ke Database
		const booking = await Booking.create({
			customer: req.user.id, // ID didapat dari authMiddleware 'protect' (Customer harus login)
			space: spaceId,
			date: new Date(date),
			bookedHours,
			totalPrice,
			midtransOrderId,
		})

		return sendSuccess(
			res,
			'Booking berhasil dibuat, silakan lanjutkan pembayaran',
			booking,
			201,
		)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Semua Riwayat Booking Milik Customer Yang Login
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
	try {
		const bookings = await Booking.find({ customer: req.user.id })
			.populate('space', 'title location images')
			.sort({ createdAt: -1 }) // Urutkan dari yang paling baru

		return sendSuccess(res, 'Riwayat booking berhasil diambil', bookings)
	} catch (error) {
		next(error)
	}
}
