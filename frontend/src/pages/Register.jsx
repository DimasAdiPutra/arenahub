import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Register() {
  useDocumentTitle('ArenaHub | Daftar Akun Baru');
  const navigate = useNavigate();

  // State Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // State Status & Elemen Elegan
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false); // ◄ State pemicu notifikasi sukses

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        phoneNumber,
        password,
        role
      });

      // 🟢 GANTI ALERT: Munculkan notifikasi melayang yang manis
      setShowToast(true);

      // Tunggu 2.5 detik agar user sempat membaca, lalu pindah halaman otomatis
      setTimeout(() => {
        setShowToast(false);
        navigate('/login');
      }, 2500);

    } catch (err) {
      console.error("Error Registrasi:", err);
      const pesanError = err.response?.data?.message || 'Gagal mendaftar. Periksa kembali koneksi internet Anda.';
      setError(pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased relative">

      {/* 🟢 BANNER NOTIFIKASI TOAST MELAYANG (Muncul dari atas layar) */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300 ease-out
          ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <div className="bg-emerald-800 text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-600/20">
          <svg className="w-5 h-5 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-bold">Pendaftaran Berhasil!</p>
            <p className="text-xs text-emerald-200 mt-0.5">Mengalihkan Anda ke halaman masuk...</p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-950 tracking-tight">
          Mulai di Arena<span className="text-emerald-700">Hub</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 transition">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 rounded-xl sm:px-10">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* ... bagian input Form sama persis dengan kode sebelumnya ... */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Daftar Sebagai Apa?</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition select-none ${role === 'customer' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={(e) => setRole(e.target.value)} className="sr-only" />
                  <svg className={`w-6 h-6 ${role === 'customer' ? 'text-emerald-700' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className={`text-sm font-bold mt-2 ${role === 'customer' ? 'text-emerald-800' : 'text-slate-700'}`}>Penyewa</span>
                </label>
                <label className={`border rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition select-none ${role === 'owner' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={(e) => setRole(e.target.value)} className="sr-only" />
                  <svg className={`w-6 h-6 ${role === 'owner' ? 'text-emerald-700' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className={`text-sm font-bold mt-2 ${role === 'owner' ? 'text-emerald-800' : 'text-slate-700'}`}>Pemilik</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition" placeholder="Contoh: Ahmad Fauzi" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Alamat Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition" placeholder="name@example.com" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input id="phone" type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition" placeholder="081234567890" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition" placeholder="••••••••" />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memproses Pendaftaran...' : 'Daftar Akun Sekarang'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}