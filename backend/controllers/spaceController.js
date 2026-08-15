const Space = require('../models/Space')
const Category = require('../models/Category')
const Booking = require('../models/Booking') // ◄ Diperlukan untuk statistik dashboard owner
const { sendSuccess } = require('../utils/responseHandler')
const mongoose = require('mongoose')
const { imagekit, toFile } = require('../config/imagekit')

// ==========================================
// 👑 FUNGSI KHUSUS DASHBOARD OWNER
// ==========================================

// @desc    Ambil Statistik & Data Dashboard Owner
// @route   GET /api/owner/dashboard
exports.getOwnerDashboardData = async (req, res, next) => {
	try {
		const ownerId = req.user.id

		// 1. Cari semua lapangan yang dimiliki oleh owner yang sedang login
		const ownerSpaces = await Space.find({ owner: ownerId })
		const spaceIds = ownerSpaces.map((space) => space._id)

		// 2. Ambil hanya booking sukses yang melibatkan lapangan milik owner ini
		const allSuccessBookings = await Booking.find({
			space: { $in: spaceIds },
			paymentStatus: 'success',
		})
			.populate('space', 'title pricePerHour')
			.sort({ date: -1 })

		// 3. Hitung Statistik
		const totalBookings = allSuccessBookings.length
		const totalHours = allSuccessBookings.reduce(
			(acc, curr) => acc + curr.bookedHours.length,
			0,
		)
		const revenue = allSuccessBookings.reduce(
			(acc, curr) => acc + curr.totalPrice,
			0,
		)
		const activeSpaces = ownerSpaces.length

		// 4. Ambil 10 transaksi terbaru untuk list bagian kiri
		const recent = await Booking.find({ space: { $in: spaceIds } })
			.populate('space', 'title')
			.sort({ createdAt: -1 })
			.limit(10)

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

// @desc    Ambil Khusus Daftar Arena Milik Owner yang Login
// @route   GET /api/owner/spaces
exports.getOwnerSpaces = async (req, res, next) => {
	try {
		const spaces = await Space.find({ owner: req.user.id })
			.populate('category', 'name slug')
			.sort({ createdAt: -1 })

		return sendSuccess(res, 'Daftar arena owner berhasil dimuat', spaces)
	} catch (error) {
		next(error)
	}
}

// ==========================================
// 🌐 FUNGSI UMUM & CRUD ARENA (Milikmu)
// ==========================================

// @desc    Tambah Arena Baru (Owner Only)
// @route   POST /api/spaces
exports.createSpace = async (req, res, next) => {
	let imageUrls = []

	try {
		let { title, description, category, pricePerHour, location, facilities } =
			req.body

		// 1. Proses Upload Gambar ke ImageKit
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const uniqueFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`

				const uploadResponse = await imagekit.files.upload({
					file: await toFile(file.buffer, uniqueFileName),
					fileName: uniqueFileName,
					folder: '/arenahub',
				})

				imageUrls.push({
					url: uploadResponse.url,
					fileId: uploadResponse.fileId,
				})
			}
		}

		// 2. Logika Otomatisasi Kategori Dinamis
		const isObjectId = mongoose.Types.ObjectId.isValid(category)

		if (!isObjectId && category) {
			const cleanedCategoryName = category.trim()
			let existingCategory = await Category.findOne({
				name: { $regex: new RegExp(`^${cleanedCategoryName}$`, 'i') },
			})

			if (!existingCategory) {
				existingCategory = await Category.create({ name: cleanedCategoryName })
			}

			category = existingCategory._id
		}

		// 3. Parsing Fasilitas
		if (typeof facilities === 'string') {
			try {
				facilities = JSON.parse(facilities)
			} catch (e) {
				facilities = facilities.split(',').map((item) => item.trim())
			}
		}

		// 4. Simpan ke Database
		const space = await Space.create({
			owner: req.user.id,
			title,
			description,
			category,
			pricePerHour: Number(pricePerHour),
			location,
			facilities: facilities || [],
			images: imageUrls,
		})

		return sendSuccess(res, 'Arena berhasil didaftarkan', space, 201)
	} catch (error) {
		// Rollback ImageKit jika DB gagal
		if (imageUrls.length > 0) {
			for (const img of imageUrls) {
				try {
					await imagekit.files.delete(img.fileId)
				} catch (ikErr) {
					console.error(`[Rollback Gagal] ${img.fileId}:`, ikErr.message)
				}
			}
		}
		next(error)
	}
}

// @desc    Ambil Semua Arena (Public)
// @route   GET /api/spaces
exports.getAllSpaces = async (req, res, next) => {
	try {
		const spaces = await Space.find()
			.populate('category', 'name slug')
			.populate('owner', 'name email phoneNumber')

		return sendSuccess(res, 'Daftar arena berhasil diambil', spaces)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Detail Satu Arena Berdasarkan ID
// @route   GET /api/spaces/:id
exports.getSpaceById = async (req, res, next) => {
	try {
		const space = await Space.findById(req.params.id)
			.populate('category', 'name slug')
			.populate('owner', 'name email phoneNumber')

		if (!space) {
			res.status(404)
			throw new Error('Arena tidak ditemukan')
		}

		return sendSuccess(res, 'Detail arena berhasil diambil', space)
	} catch (error) {
		next(error)
	}
}

// @desc    Update Data Arena (Owner Only)
// @route   PUT /api/spaces/:id
exports.updateSpace = async (req, res, next) => {
	let newUploadedImages = []

	try {
		let space = await Space.findById(req.params.id)

		if (!space) {
			res.status(404)
			throw new Error('Arena tidak ditemukan')
		}

		if (space.owner.toString() !== req.user.id) {
			res.status(403)
			throw new Error(
				'Anda tidak memiliki hak akses untuk mengubah data arena ini',
			)
		}

		// 1. Parsing existingImages (Daftar gambar lama yang dipertahankan dari Frontend)
		let parsedExistingImages = []
		if (req.body.existingImages) {
			try {
				parsedExistingImages =
					typeof req.body.existingImages === 'string'
						? JSON.parse(req.body.existingImages)
						: req.body.existingImages
			} catch (e) {
				parsedExistingImages = []
			}
		}

		// 2. DETEKSI & HAPUS GAMBAR YANG DIBUANG DARI IMAGEKIT
		// Cari gambar di database yang TIDAK ADA lagi di array parsedExistingImages
		const imagesToDelete = space.images.filter(
			(dbImg) =>
				!parsedExistingImages.some(
					(keptImg) => keptImg.fileId === dbImg.fileId,
				),
		)

		for (const img of imagesToDelete) {
			try {
				await imagekit.files.delete(img.fileId)
			} catch (ikErr) {
				console.error(`[ImageKit Delete Failed] ${img.fileId}:`, ikErr.message)
			}
		}

		// 3. UPLOAD GAMBAR BARU KE IMAGEKIT (JIKA ADA)
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const uniqueFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`

				const uploadResponse = await imagekit.files.upload({
					file: await toFile(file.buffer, uniqueFileName),
					fileName: uniqueFileName,
					folder: '/arenahub',
				})

				newUploadedImages.push({
					url: uploadResponse.url,
					fileId: uploadResponse.fileId,
				})
			}
		}

		// 4. GABUNGKAN GAMBAR LAMA YANG DIPERTAHANKAN + GAMBAR BARU
		const finalImages = [...parsedExistingImages, ...newUploadedImages]

		// 5. PENANGANAN KATEGORI DINAMIS
		if (
			req.body.category &&
			!mongoose.Types.ObjectId.isValid(req.body.category)
		) {
			const cleanedName = req.body.category.trim()
			let existingCategory = await Category.findOne({
				name: { $regex: new RegExp(`^${cleanedName}$`, 'i') },
			})
			if (!existingCategory) {
				existingCategory = await Category.create({ name: cleanedName })
			}
			req.body.category = existingCategory._id
		}

		// 6. PARSING FASILITAS
		if (req.body.facilities && typeof req.body.facilities === 'string') {
			try {
				req.body.facilities = JSON.parse(req.body.facilities)
			} catch (e) {
				req.body.facilities = req.body.facilities
					.split(',')
					.map((item) => item.trim())
			}
		}

		// 7. SETUP PAYLOAD AKHIR & SIMPAN KE DATABASE
		const updatePayload = {
			title: req.body.title || space.title,
			description: req.body.description || space.description,
			category: req.body.category || space.category,
			pricePerHour: req.body.pricePerHour
				? Number(req.body.pricePerHour)
				: space.pricePerHour,
			location: req.body.location || space.location,
			facilities: req.body.facilities || space.facilities,
			images: finalImages, // 🟢 Set array gambar final hasil penggabungan
		}

		space = await Space.findByIdAndUpdate(req.params.id, updatePayload, {
			new: true,
			runValidators: true,
		})

		return sendSuccess(res, 'Data arena berhasil diperbarui', space)
	} catch (error) {
		// Rollback: Hapus gambar baru di ImageKit jika simpan DB gagal
		if (newUploadedImages.length > 0) {
			for (const img of newUploadedImages) {
				try {
					await imagekit.files.delete(img.fileId)
				} catch (ikErr) {
					console.error(`[Rollback Failed] ${img.fileId}:`, ikErr.message)
				}
			}
		}
		next(error)
	}
}

// @desc    Hapus Arena (Owner Only)
// @route   DELETE /api/spaces/:id
exports.deleteSpace = async (req, res, next) => {
	try {
		const space = await Space.findById(req.params.id)

		if (!space) {
			res.status(404)
			throw new Error('Arena tidak ditemukan')
		}

		if (space.owner.toString() !== req.user.id) {
			res.status(403)
			throw new Error('Anda tidak memiliki hak akses untuk menghapus arena ini')
		}

		// 🛑 PROTEKSI KEAMANAN CUSTOMER (Cegah Owner Kabur)
		// Cari apakah ada booking sukses yang jadwalnya hari ini atau ke depan
		const today = new Date()
		today.setHours(0, 0, 0, 0) // Set ke awal hari ini

		const activeBooking = await Booking.findOne({
			space: space._id,
			paymentStatus: 'success', // Hanya yang sudah dibayar
			date: { $gte: today }, // Jadwal mainnya hari ini atau besok-besok
		})

		if (activeBooking) {
			res.status(400)
			throw new Error(
				'Arena tidak dapat dihapus! Masih ada pelanggan dengan jadwal aktif mendatang. Silakan tunggu hingga jadwal selesai.',
			)
		}

		// 🟢 PROSES PEMBERSIHAN OTOMATIS DI IMAGEKIT (Lanjut jika aman)
		if (space.images && space.images.length > 0) {
			for (const img of space.images) {
				try {
					await imagekit.files.delete(img.fileId)
				} catch (ikErr) {
					console.error(
						`Gagal menghapus gambar ${img.fileId} di ImageKit:`,
						ikErr.message,
					)
				}
			}
		}

		await space.deleteOne()

		return sendSuccess(
			res,
			'Arena dan seluruh aset gambar berhasil dihapus dari sistem',
		)
	} catch (error) {
		next(error)
	}
}
