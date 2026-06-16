import { useState } from 'react';
import { useNavigate, Link } from 'react-router'; // ◄ Memakai react-router sesuai instruksi
import axios from 'axios';

import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // ◄ State baru untuk nomor telepon
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🚀 Mengirim data lengkap termasuk nomor telepon ke API Register Backend
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        phoneNumber, // ◄ Ikut dikirim ke backend
        password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftarkan akun. Coba email lain.');
    } finally {
      setLoading(false);
    }
  };

  useDocumentTitle('Register')

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Buat Akun</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Gabung ArenaHUB untuk kemudahan sewa fasilitas olahraga</p>

        {error && (
          <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-3 rounded-lg text-green-600 text-sm mb-4 border border-green-100 font-medium">
            🎉 Registrasi Berhasil! Mengalihkan ke halaman login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          {/* 📞 FIELD INPUT BARU: Nomor Telepon */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="081234567xxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition disabled:bg-slate-400"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}