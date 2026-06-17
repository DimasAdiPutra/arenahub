const Space = require('../models/Space')
const Category = require('../models/Category')
const { sendSuccess } = require('../utils/responseHandler')
const mongoose = require('mongoose')
const { imagekit, toFile } = require('../config/imagekit')

// @desc    Tambah Lapangan/Tempat Baru (Owner Only)
// @route   POST /api/spaces
exports.createSpace = async (req, res, next) => {
	// 1. Definisikan array imageUrls di luar blok try agar bisa diakses oleh blok catch jika terjadi error
	let imageUrls = []

	try {
		let { title, description, category, pricePerHour, location, facilities } =
			req.body

		// ─── 2. PROSES UPLOAD GAMBAR KE IMAGEKIT ───
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const uniqueFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`

				const uploadResponse = await imagekit.files.upload({
					file: await toFile(file.buffer, uniqueFileName),
					fileName: uniqueFileName,
					folder: '/arenahub',
				})

				// Simpan url dan fileId ke array eksternal
				imageUrls.push({
					url: uploadResponse.url,
					fileId: uploadResponse.fileId,
				})
			}
		}

		// ─── 3. LOGIKA OTOMATISASI KATEGORI DINAMIS ───
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

		// ─── 4. PARSING ANTISIPASI FORMAT MULTIPART ───
		if (typeof facilities === 'string') {
			try {
				facilities = JSON.parse(facilities)
			} catch (e) {
				facilities = facilities.split(',').map((item) => item.trim())
			}
		}

		// ─── 5. SIMPAN DATA KE MONGOOSE (Memicu validasi skema) ───
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

		return sendSuccess(res, 'Tempat/Lapangan berhasil didaftarkan', space, 201)
	} catch (error) {
		// ─── 6. BLOK ROLLBACK OTOMATIS JIKA DB GAGAL SIMPAN ───
		if (imageUrls.length > 0) {
			console.log(
				'⚠️ Database gagal menyimpan data. Memulai pembersihan berkas sampah di ImageKit...',
			)

			for (const img of imageUrls) {
				try {
					await imagekit.files.delete(img.fileId)
					console.log(
						`[Rollback] Berhasil menghapus kembali file sampah ID: ${img.fileId}`,
					)
				} catch (ikErr) {
					console.error(
						`[Rollback Gagal] Gagal menghapus berkas ${img.fileId}:`,
						ikErr.message,
					)
				}
			}
		}

		// Teruskan error utama (misal: "Title is required") ke middleware global error handler
		next(error)
	}
}

// @desc    Ambil Semua Lapangan (Public)
// @route   GET /api/spaces
exports.getAllSpaces = async (req, res, next) => {
	try {
		const spaces = await Space.find()
			.populate('category', 'name slug')
			.populate('owner', 'name email phoneNumber')

		return sendSuccess(res, 'Daftar lapangan berhasil diambil', spaces)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Detail Satu Lapangan Berdasarkan ID
// @route   GET /api/spaces/:id
exports.getSpaceById = async (req, res, next) => {
	try {
		const space = await Space.findById(req.params.id)
			.populate('category', 'name slug')
			.populate('owner', 'name email phoneNumber')

		if (!space) {
			res.status(404)
			throw new Error('Lapangan/Tempat tidak ditemukan')
		}

		return sendSuccess(res, 'Detail lapangan berhasil diambil', space)
	} catch (error) {
		next(error)
	}
}

// @desc    Update Data Lapangan (Owner Only)
// @route   PUT /api/spaces/:id
exports.updateSpace = async (req, res, next) => {
	try {
		let space = await Space.findById(req.params.id)

		if (!space) {
			res.status(404)
			throw new Error('Lapangan/Tempat tidak ditemukan')
		}

		if (space.owner.toString() !== req.user.id) {
			res.status(403)
			throw new Error(
				'Anda tidak memiliki hak akses untuk mengubah data lapangan ini',
			)
		}

		// Pemrosesan Kategori Baru pada Rute Update
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

		// Pemrosesan parsing fasilitas pada Rute Update
		if (req.body.facilities && typeof req.body.facilities === 'string') {
			try {
				req.body.facilities = JSON.parse(req.body.facilities)
			} catch (e) {
				req.body.facilities = req.body.facilities
					.split(',')
					.map((item) => item.trim())
			}
		}

		// ─── BONUS PROTEKSI DATA IMAGES SAAT UPDATE ───
		// Jika update tidak mengirim berkas file gambar baru, tetap pertahankan gambar lama di DB
		if (!req.files || req.files.length === 0) {
			delete req.body.images
		}

		space = await Space.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		return sendSuccess(res, 'Data lapangan berhasil diperbarui', space)
	} catch (error) {
		next(error)
	}
}

// @desc    Hapus Lapangan (Owner Only)
// @route   DELETE /api/spaces/:id
exports.deleteSpace = async (req, res, next) => {
	try {
		const space = await Space.findById(req.params.id)

		if (!space) {
			res.status(404)
			throw new Error('Lapangan/Tempat tidak ditemukan')
		}

		// PROTEKSI: Pastikan owner yang mau hapus adalah pemilik sahnya
		if (space.owner.toString() !== req.user.id) {
			res.status(403)
			throw new Error(
				'Anda tidak memiliki hak akses untuk menghapus lapangan ini',
			)
		}

		// 🟢 PROSES PEMBERSIHAN OTOMATIS DI IMAGEKIT
		if (space.images && space.images.length > 0) {
			for (const img of space.images) {
				try {
					// Tembak API ImageKit untuk menghapus file berdasarkan fileId yang tersimpan
					await imagekit.files.delete(img.fileId)
					console.log(
						`Berhasil menghapus file ImageKit dengan ID: ${img.fileId}`,
					)
				} catch (ikErr) {
					// Gunakan try-catch internal agar jika ada satu gambar gagal dihapus di cloud,
					// proses penghapusan data utama di MongoDB tidak ikut macet/gagal.
					console.error(
						`Gagal menghapus gambar ${img.fileId} di ImageKit:`,
						ikErr.message,
					)
				}
			}
		}

		// Hapus dokumen dari MongoDB setelah semua aset di cloud bersih
		await space.deleteOne()

		return sendSuccess(
			res,
			'Lapangan dan seluruh aset gambar berhasil dihapus dari sistem',
		)
	} catch (error) {
		next(error)
	}
}
