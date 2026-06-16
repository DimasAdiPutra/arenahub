import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('ArenaHub | Masuk ke Akun');
  const navigate = useNavigate();
  const { login } = useAuth();

  // State Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Status & Toast
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🚀 Tembak API Login Backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Ambil data user & token sesuai standar responseHandler backend Anda
      const { user, token } = response.data.data;

      // Simpan ke AuthContext & localStorage via fungsi login global
      login(user, token);

      // 🟢 Munculkan Toast Sukses melayang yang elegan
      setShowToast(true);

      // Beri jeda 1.5 detik agar animasi transisinya terasa smooth sebelum pindah halaman
      setTimeout(() => {
        setShowToast(false);

        // 🔀 REDIRECT CERDAS: Owner ke Dashboard, Customer ke Landing Page
        if (user.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (err) {
      console.error("Error Login:", err);
      const pesanError = err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.';
      setError(pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased relative">

      {/* 🟢 BANNER TOAST SUKSES (Meluncur dari atas layar) */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300 ease-out
          ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <div className="bg-emerald-800 text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-600/20">
          <svg className="w-5 h-5 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-bold">Berhasil Masuk!</p>
            <p className="text-xs text-emerald-200 mt-0.5">Mempersiapkan dashboard Anda...</p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto w-full max-w-md">
        {/* Logo Identitas */}
        <div className="text-center text-3xl font-extrabold text-slate-950 tracking-tight">
          Arena<span className="text-emerald-700">Hub</span>
        </div>
        <h2 className="mt-3 text-center text-2xl font-bold text-slate-800 tracking-tight">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 transition">
            Daftar gratis di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 rounded-xl sm:px-10">

          {/* Alert Gagal */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition"
                placeholder="name@example.com"
              />
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                {/* Placeholder Lupa Password untuk Estetika Desain Profesional */}
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Fitur reset password sedang dikembangkan.'); }} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Lupa password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition"
                placeholder="••••••••"
              />
            </div>

            {/* Tombol Submit Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}