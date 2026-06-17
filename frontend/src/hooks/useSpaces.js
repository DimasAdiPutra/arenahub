import { useState, useEffect } from 'react'
import API from '../utils/api'

export default function useSpaces() {
	const [spaces, setSpaces] = useState([])
	const [categories, setCategories] = useState([]) // ◄ State baru untuk menampung kategori dari DB
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('Semua') // 'Semua' tetap menjadi default string

	useEffect(() => {
		async function fetchAllData() {
			try {
				setLoading(true)

				// 🚀 Jalankan fetch /spaces dan /categories secara paralel agar performa ngebut
				const [spacesRes, categoriesRes] = await Promise.all([
					API.get('/spaces'),
					API.get('/categories'), // ◄ Sesuaikan dengan endpoint kategori backend Anda
				])

				const spacesData = spacesRes.data?.data || spacesRes.data
				const categoriesData = categoriesRes.data?.data || categoriesRes.data

				setSpaces(spacesData)

				// ✨ Masukkan opsi 'Semua' di awal array kategori agar user tetap bisa melihat seluruh lapangan
				setCategories([
					{ _id: 'all', name: 'Semua', slug: 'all' },
					...categoriesData,
				])
			} catch (err) {
				console.error('Gagal mengambil data dari server:', err)
				setError(
					'Gagal memuat data dari server. Pastikan API backend Anda aktif.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchAllData()
	}, [])

	// 🔍 Logika Penyaringan (Filtering) Lokal yang Akurat
	const filteredSpaces = spaces.filter((space) => {
		// 1. Filter Berdasarkan Judul atau Lokasi
		const matchesSearch =
			space.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			space.location?.toLowerCase().includes(searchQuery.toLowerCase())

		// 2. Filter Berdasarkan Kategori
		// Karena 'selectedCategory' menyimpan string nama (misal: 'Futsal'), kita cocokkan
		// dengan space.category.name (jika di-populate) atau space.category langsung.
		const categoryName = space.category?.name || space.category || ''
		const matchesCategory =
			selectedCategory === 'Semua' ||
			categoryName.toLowerCase() === selectedCategory.toLowerCase()

		return matchesSearch && matchesCategory
	})

	return {
		loading,
		error,
		searchQuery,
		setSearchQuery,
		categories, // ◄ Kirim data kategori database ke komponen UI
		selectedCategory,
		setSelectedCategory,
		filteredSpaces,
	}
}
