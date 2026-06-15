const cron = require('node-cron')
const Booking = require('../models/Booking') // ◄ Pastikan letak path model Booking-mu sudah benar

const initCleanupJob = () => {
	// Jalankan tugas pembersihan otomatis SEPIHAK setiap 5 menit sekali
	cron.schedule('*/5 * * * *', async () => {
		console.log('--- 🧹 Menjalankan Pembersihan Booking Menggantung ---')

		try {
			// Cari waktu batas (15 menit yang lalu dari sekarang)
			const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

			// Cari booking yang statusnya masih 'pending' DAN dibuatnya sudah lebih dari 15 menit yang lalu
			const result = await Booking.updateMany(
				{
					paymentStatus: 'pending',
					createdAt: { $lt: fifteenMinutesAgo }, // $lt = kurang dari / lebih lampau
				},
				{
					$set: { paymentStatus: 'failed' }, // Ubah sepihak menjadi expired
				},
			)

			if (result.modifiedCount > 0) {
				console.log(
					`[Cleanup] Berhasil membatalkan ${result.modifiedCount} booking yang digantung customer.`,
				)
			} else {
				console.log('[Cleanup] Tidak ada booking menggantung yang kedaluwarsa.')
			}
		} catch (error) {
			console.error('[Cleanup Error]:', error)
		}
	})
}

module.exports = initCleanupJob
