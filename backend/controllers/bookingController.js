const Booking = require('../models/Booking')
const Space = require('../models/Space')
const midtransClient = require('midtrans-client')
const { sendSuccess } = require('../utils/responseHandler')

// 1. Inisialisasi Midtrans Snap Client
const snap = new midtransClient.Snap({
	isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true' ? true : false,
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

// @desc    Buat Booking Baru & Generate Midtrans Snap Token
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
	try {
		const { space: spaceId, date, bookedHours } = req.body

		if (
			!bookedHours ||
			!Array.isArray(bookedHours) ||
			bookedHours.length === 0
		) {
			res.status(400)
			throw new Error('Pilihlah minimal 1 jam slot lapangan')
		}

		const space = await Space.findById(spaceId)
		if (!space) {
			res.status(404)
			throw new Error('Lapangan tidak ditemukan')
		}

		// 2. Cek apakah slot jam sudah terisi (Hanya mengunci status pending & success)
		const isSlotTaken = await Booking.findOne({
			space: spaceId,
			date: new Date(date),
			paymentStatus: { $in: ['pending', 'success'] },
			bookedHours: { $in: bookedHours },
		})

		if (isSlotTaken) {
			res.status(400)
			throw new Error(
				'Maaf, salah satu slot jam yang Anda pilih sudah dipesan orang lain',
			)
		}

		// 3. Hitung Total Harga
		const totalPrice = bookedHours.length * space.pricePerHour
		const midtransOrderId = `ARNHB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

		const now = new Date()
		const pad = (num) => String(num).padStart(2, '0')
		const formattedStartTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} +0700`
		// 4. Siapkan Parameter Parameter untuk Dikirim ke Midtrans
		const parameter = {
			transaction_details: {
				order_id: midtransOrderId,
				gross_amount: totalPrice,
			},
			item_details: [
				{
					id: spaceId,
					price: space.pricePerHour,
					quantity: bookedHours.length,
					name: `${space.title} (${bookedHours.length} Jam)`,
				},
			],
			customer_details: {
				first_name: req.user.name,
				email: req.user.email,
				phone: req.user.phoneNumber || '',
			},
			// 🔥 KUNCI STRATEGI 1: Batasi waktu pembayaran hanya 15 Menit!
			expiry: {
				start_time: formattedStartTime, // Waktu sekarang (WIB)
				duration: 15,
				unit: 'minute',
			},
		}

		// 5. Tembak ke Midtrans untuk mendapatkan Snap Token / Redirect URL
		const transaction = await snap.createTransaction(parameter)

		// 6. Simpan data booking ke database (Status default awal adalah 'pending')
		const booking = await Booking.create({
			customer: req.user.id,
			space: spaceId,
			date: new Date(date),
			bookedHours,
			totalPrice,
			midtransOrderId,
		})

		// 7. Kembalikan data booking beserta snapToken & snapUrl ke frontend
		return sendSuccess(
			res,
			'Booking berhasil dibuat, silakan selesaikan pembayaran dalam 15 menit',
			{
				booking,
				token: transaction.token, // Digunakan Frontend jika pakai Snap Pop-up SDK
				redirect_url: transaction.redirect_url, // Digunakan Frontend jika mau langsung redirect ke web Midtrans
			},
			201,
		)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Semua Riwayat Booking Milik Customer
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
	try {
		const bookings = await Booking.find({ customer: req.user.id })
			.populate('space', 'title location images')
			.sort({ createdAt: -1 })

		return sendSuccess(res, 'Riwayat booking berhasil diambil', bookings)
	} catch (error) {
		next(error)
	}
}

exports.checkAvailability = async (req, res) => {
	try {
		const { spaceId, date } = req.query // date berformat YYYY-MM-DD

		if (!spaceId || !date) {
			return res
				.status(400)
				.json({ message: 'Space ID dan Tanggal wajib diisi' })
		}

		// 1. Buat rentang waktu awal hari (00:00:00) dan akhir hari (23:59:59) dalam format Date UTC

		// Cari booking yang statusnya sudah sukses/lunas pada tanggal dan tempat tersebut
		const activeBookings = await Booking.find({
			space: spaceId,
			date,
			paymentStatus: { $in: ['pending', 'success'] }, // Sesuaikan enum status di DB-mu
		})

		// Ambil semua jam dari data booking yang ditemukan dan satukan ke dalam satu array
		// Misal di DB tersimpan sebagai array of strings atau objek
		let bookedHours = []

		activeBookings.forEach((booking) => {
			if (booking.bookedHours) {
				bookedHours = [...bookedHours, ...booking.bookedHours]
			}
		})

		// Hilangkan duplikasi angka jam jika ada, lalu urutkan
		const uniqueBookedHours = [...new Set(bookedHours)].sort((a, b) => a - b)

		return sendSuccess(
			res,
			'Booking yang tidak tersedia berhasil diambil',
			uniqueBookedHours,
		)
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Gagal memeriksa ketersediaan', error: error.message })
	}
}

// @desc    Menerima notifikasi otomatis (Webhook) dari Midtrans terkait status pembayaran
// @route   POST /api/bookings/webhook
exports.handleMidtransNotification = async (req, res, next) => {
	try {
		const statusResponse = req.body

		const orderId = statusResponse.order_id
		const transactionStatus = statusResponse.transaction_status
		const fraudStatus = statusResponse.fraud_status

		console.log(
			`[Midtrans Webhook] Order ID: ${orderId} | Status: ${transactionStatus}`,
		)

		// Cari data booking berdasarkan orderId Midtrans
		const booking = await Booking.findOne({ midtransOrderId: orderId })
		if (!booking) {
			res.status(404)
			throw new Error('Data booking tidak ditemukan di database ArenaHub')
		}

		// Logika Pemetaan Status Midtrans ke Database Kita
		if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
			if (fraudStatus === 'challenge') {
				booking.paymentStatus = 'pending'
			} else if (fraudStatus === 'accept') {
				booking.paymentStatus = 'success' // Pembayaran Sah & Berhasil! Lapangan terkunci permanen.
			}
		} else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
			booking.paymentStatus = 'failed' // Pembayaran gagal/ditolak. Slot terbuka kembali.
		} else if (transactionStatus === 'expire') {
			booking.paymentStatus = 'expired' // 15 menit lewat dan tidak dibayar! Slot otomatis terbuka kembali.
		}

		// Simpan perubahan status ke database
		await booking.save()

		// Berikan respons 200 OK ke Midtrans agar mereka berhenti mengirimkan notifikasi ulang
		return res.status(200).json({
			status: 'OK',
			message: 'Notifikasi Midtrans berhasil diproses',
		})
	} catch (error) {
		next(error)
	}
}
