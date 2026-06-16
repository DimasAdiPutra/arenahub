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

/**
 * Mengubah format tanggal standar menjadi format lokal Indonesia yang human-readable
 * Contoh: 2026-06-16 -> 16 Juni 2026
 */
export const formatTanggalIndo = (dateString) => {
	if (!dateString) return '-'
	const opsi = { year: 'numeric', month: 'long', day: 'numeric' }
	return new Date(dateString).toLocaleDateString('id-ID', opsi)
}
