import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🚀 Tembak API Backend kamu (Sesuaikan URL jika port backend-mu bukan 5000)
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Ambil data user dan token dari respon backend-mu
      // Contoh struktur respon biasanya: { user: {name, email}, token: "ey..." }
      const { user, token } = response.data.data;

      // Simpan ke AuthContext global
      login(user, token);

      // Lempar user kembali ke halaman utama setelah sukses login
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah!');
    } finally {
      setLoading(false);
    }
  };

  useDocumentTitle('Login')

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Selamat Datang</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Silakan login untuk mulai booking fasilitas</p>

        {error && (
          <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:bg-slate-400"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}