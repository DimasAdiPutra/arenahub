// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
	let statusCode = res.statusCode === 200 ? 500 : res.statusCode
	let message = err.message

	// Tangani Mongoose Bad ObjectId
	if (err.name === 'CastError') {
		statusCode = 400
		message = 'Format ID yang dikirim tidak valid'
	}

	// Tangani Mongoose Duplicate Key Error
	if (err.code === 11000) {
		statusCode = 400
		message = `${Object.keys(err.keyValue)} sudah digunakan, silakan gunakan yang lain`
	}

	// Tangani ValidationError Mongoose
	if (err.name === 'ValidationError') {
		statusCode = 400
		message = Object.values(err.errors)
			.map((val) => val.message)
			.join(', ')
	}

	// ──── LOGGING ERROR UNTUK DEBUGGING DI TERMINAL ────
	console.log('\n❌ [=== ERROR DETECTED ===]')
	console.log(`📌 Method/URL : ${req.method} ${req.originalUrl}`)
	console.log(`⚠️ Status Code : ${statusCode}`)
	console.log(`💬 Message     : ${message}`)
	if (process.env.NODE_ENV !== 'production') {
		// Mencetak baris file mana yang error (Stack Trace) agar tahu persis letak salahnya
		console.log(`🔍 Stack Trace :\n${err.stack}`)
	}
	console.log('───────────────────────────\n')
	// ──────────────────────────────────────────────────

	res.status(statusCode).json({
		success: false,
		message,
		errors: err.errors || null,
	})
}

module.exports = errorHandler
