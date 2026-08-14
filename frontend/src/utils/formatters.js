/**
 * Mengubah angka menjadi format mata uang Rupiah yang rapi
 * Contoh: 150000 -> Rp 150.000
 */
export const formatRupiah = (number) => {
	if (number === undefined || number === null) return 'Rp 0'
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(number)
}

export const formatCompactCurrency = (value) => {
	if (value == null || isNaN(value)) return 'Rp 0'

	// Jika >= 1 Juta (Contoh: 1.563.000 -> 1.5jt atau 2.000.000 -> 2jt)
	if (value >= 1000000) {
		const millions = value / 1000000
		// toFixed(1) mengambil 1 angka di belakang koma, parseFloat membuang .0 jika bulat (misal: 2.0 jadi 2)
		return `Rp ${parseFloat(millions.toFixed(1))}jt`
	}

	// Jika >= 1 Ribu dan < 1 Juta (Contoh: 500.000 -> 500k, 545.000 -> 545k)
	else if (value >= 1000) {
		const thousands = value / 1000
		return `Rp ${parseFloat(thousands.toFixed(1))}k`
	}

	// Jika di bawah 1.000 (angka biasa)
	else {
		return `Rp ${value.toLocaleString('id-ID')}`
	}
}

/**
 * Mengubah format tanggal standar menjadi format lokal Indonesia yang human-readable
 * Contoh: 2026-06-16 -> 16 Juni 2026
 */
export const formatTanggalIndo = (dateString) => {
	if (!dateString) return '-'
	const opsi = { year: 'numeric', month: 'long', day: 'numeric' }
	return new Date(dateString).toLocaleDateString('id-ID', opsi)
}
