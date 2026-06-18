import axios from 'axios'

const API = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000/api', // Base URL Backend Anda
	timeout: 10000,
})

// Otomatis sisipkan Bearer Token ke Header jika user sudah login
API.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token') // Sesuaikan dengan key token Anda
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

export default API
