const { default: ImageKit, toFile } = require('@imagekit/nodejs')

// Inisialisasi client instance sesuai panduan dokumentasi GitHub
const imagekit = new ImageKit({
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // Otomatis dibaca dari env
	publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
	urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

// Ekspor instansi utama dan pembantu toFile
module.exports = { imagekit, toFile }
