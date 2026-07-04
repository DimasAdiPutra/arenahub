// 📄 src/utils/auth.js
import { jwtDecode } from 'jwt-decode'

/**
 * Memeriksa validitas token JWT di localStorage berdasarkan waktu ekspirasi ('exp')
 * @returns {string|null} Mengembalikan string token jika valid, atau null jika tidak valid/expired
 */
export const getValidToken = () => {
	const token = localStorage.getItem('token')
	if (!token) return null

	try {
		// Bongkar token untuk mengambil properti 'exp' bawaan JWT
		const decoded = jwtDecode(token)

		// Waktu sekarang dalam satuan detik
		const currentTime = Date.now() / 1000

		// Jika token sudah kedaluwarsa
		if (decoded.exp < currentTime) {
			localStorage.removeItem('token') // Bersihkan token usang
			return null
		}

		return token // Token aman digunakan
	} catch (error) {
		// Jika token rusak/corrupt, hanguskan dari storage
		localStorage.removeItem('token')
		return null
	}
}
