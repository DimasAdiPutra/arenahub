const Space = require('../models/Space')
const Category = require('../models/Category') // 1. Import model Category
const { sendSuccess } = require('../utils/responseHandler')
const mongoose = require('mongoose')

exports.createSpace = async (req, res, next) => {
	try {
		let {
			title,
			description,
			category,
			pricePerHour,
			location,
			facilities,
			images,
		} = req.body

		// 2. LOGIKA OTOMATIS: Cek apakah 'category' yang dikirim berupa ObjectId valid atau teks biasa
		const isObjectId = mongoose.Types.ObjectId.isValid(category)

		if (!isObjectId) {
			// Jika BUKAN ObjectId, berarti owner mengetik kategori baru yang belum ada di DB
			// Cek dulu apakah kategori dengan nama tersebut sebetulnya sudah ada (antisipasi duplikat huruf besar/kecil)
			let existingCategory = await Category.findOne({
				name: { $regex: new RegExp(`^${category}$`, 'i') },
			})

			if (!existingCategory) {
				// Jika benar-benar belum ada, buat kategori baru otomatis
				existingCategory = await Category.create({ name: category })
			}

			// Ganti variabel category dengan ID kategori yang baru dibuat/ditemukan
			category = existingCategory._id
		}

		// 3. Simpan space dengan ID kategori yang sudah fix
		const space = await Space.create({
			owner: req.user.id,
			title,
			description,
			category, // Sudah pasti berupa ObjectId sekarang
			pricePerHour,
			location,
			facilities,
			images,
		})

		return sendSuccess(res, 'Tempat/Lapangan berhasil didaftarkan', space, 201)
	} catch (error) {
		next(error)
	}
}

// @desc    Ambil Semua Lapangan (Public - Menampilkan Fitur Filter & Populate)
// @route   GET /api/spaces
exports.getAllSpaces = async (req, res, next) => {
	try {
		// Kita gunakan .populate() untuk mengambil data Nama Kategori & Nama Owner secara otomatis
		const spaces = await Space.find()
			.populate('category', 'name slug')
			.populate('owner', 'name emailphoneNumber')

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

// @desc    Update Data Lapangan (Hanya bisa oleh Owner pemilik lapangan tersebut)
// @route   PUT /api/spaces/:id
exports.updateSpace = async (req, res, next) => {
	try {
		let space = await Space.findById(req.params.id)

		if (!space) {
			res.status(404)
			throw new Error('Lapangan/Tempat tidak ditemukan')
		}

		// PROTEKSI: Pastikan owner yang mau edit adalah owner yang mendaftarkan lapangan ini
		if (space.owner.toString() !== req.user.id) {
			res.status(403)
			throw new Error(
				'Anda tidak memiliki hak akses untuk mengubah data lapangan ini',
			)
		}

		// Jika di update ada perubahan kategori berupa string teks baru (Logika Pendekatan B kita)
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

		// Lakukan update data
		space = await Space.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		return sendSuccess(res, 'Data lapangan berhasil diperbarui', space)
	} catch (error) {
		next(error)
	}
}

// @desc    Hapus Lapangan (Hanya bisa oleh Owner pemilik lapangan)
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

		await space.deleteOne()

		return sendSuccess(res, 'Lapangan berhasil dihapus dari sistem')
	} catch (error) {
		next(error)
	}
}
