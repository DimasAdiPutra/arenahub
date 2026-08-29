const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dns = require('node:dns/promises')

const { sanitize } = require('./middleware/sanitizeMiddleware.js')

// Hanya gunakan DNS Google/Cloudflare jika berjalan di komputer lokal (development)
if (process.env.NODE_ENV !== 'production') {
	dns.setServers(['8.8.8.8', '1.1.1.1'])
	if (typeof dns.setDefaultResultOrder === 'function') {
		dns.setDefaultResultOrder('ipv4first')
	}
}

// import middlerware
const errorHandler = require('./middleware/errorMiddleware')

// import utilities
const initCleanupJob = require('./utils/cleanupJob')

require('dotenv').config()
const connectDB = require('./config/db.js')

const app = express()
const PORT = process.env.PORT || 5000

// Jalankan Koneksi Database
connectDB()

// Middleware Global
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
	sanitize(req, res, next)
})
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// logging dengan morgan
app.use(morgan('dev'))

// Daftarkan Route API
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/categories', require('./routes/categoryRoutes'))
app.use('/api/spaces', require('./routes/spaceRoutes'))
app.use('/api/bookings', require('./routes/bookingRoutes'))
app.use('/api/owner', require('./routes/ownerRoutes'))

// error handler
app.use(errorHandler)

// Rute Cek Status Server (Sanity Check)
app.get('/', (req, res) => {
	res
		.status(200)
		.json({ message: 'Welcome to ArenaHub API Server is running smoothly!' })
})

// Jalankan fungsi cron job agar aktif di background
initCleanupJob()

// 4. Nyalakan Server HTTP
app.listen(PORT, () => {
	console.log(`🚀 Server is listening at http://localhost:${PORT}`)
})
