import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import Button from '../components/ui/Button';

export default function Login() {
  useDocumentTitle('Masuk ke Akun');
  const navigate = useNavigate();
  const { login } = useAuth();

  // State Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Status & Toast
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [showForgotToast, setShowForgotToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🚀 Tembak API Login Backend
      const response = await API.post('/auth/login', { email, password });

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

  // 🟢 Fungsi Handler Lupa Password yang Elegan
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotToast(true);

    // Otomatis sembunyikan toast dalam 3 detik
    setTimeout(() => {
      setShowForgotToast(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased relative">

      {/* 🟢 BANNER TOAST SUKSES (Meluncur dari atas layar) */}
      <Toast show={showToast} title="Berhasil Masuk!" message="Mempersiapkan dashboard Anda..." />

      {/* 🟢 Toast Baru untuk Lupa Password (Tipe Warning - Warna Kuning/Amber) */}
      <Toast
        show={showForgotToast}
        type="warning"
        title="Fitur Belum Tersedia"
        message="Sistem pemulihan kata sandi otomatis sedang disiapkan untuk pembaruan versi berikutnya! 😊"
      />

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

          <form className="space-y-5 flex flex-col" onSubmit={handleSubmit}>

            {/* Input Email */}
            <Input
              label="Alamat Email" id="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
            />

            {/* Input Password */}
            <Input
              label="Password" id="password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            />

            {/* Tombol Submit Masuk */}
            <Button type="submit" loading={loading}>
              Masuk
            </Button>

            {/* Placeholder Lupa Password untuk Estetika Desain Profesional */}
            <a href="#" onClick={handleForgotPasswordClick} className="text-xs font-semibold text-emerald-700 self-end hover:text-emerald-800">
              Lupa password?
            </a>
          </form>

        </div>
      </div>
    </div>
  );
}