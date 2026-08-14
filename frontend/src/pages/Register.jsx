import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Toast from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Hotel, Users } from 'lucide-react'; // ◄ Tambahkan Eye dan EyeOff

export default function Register() {
  useDocumentTitle('Daftar Akun Baru');
  const navigate = useNavigate();

  // State Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // State Status & Preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ◄ State untuk Toggle Password

  // ==========================================
  // 🔒 LOGIKA VALIDASI FRONTEND
  // ==========================================

  // 1. Handler Khusus Nomor Telepon (Hanya Menerima Angka)
  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/\D/g, ''); // Hapus semua karakter selain angka
    setPhoneNumber(onlyNums);
  };

  // 2. Helper Pengecekan Syarat Password
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password); // Mengecek apakah ada angka
  const isPasswordValid = isMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/register', {
        name,
        email,
        phoneNumber,
        password,
        role
      });

      setShowToast(true);

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
      <Toast show={showToast} title="Pendaftaran Berhasil!" message="Mengalihkan Anda ke halaman masuk..." />

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
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Daftar Sebagai Apa?</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition select-none ${role === 'customer' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={(e) => setRole(e.target.value)} className="sr-only" />
                  <Users className={`w-6 h-6 ${role === 'customer' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold mt-2 ${role === 'customer' ? 'text-emerald-800' : 'text-slate-700'}`}>Penyewa</span>
                </label>
                <label className={`border rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition select-none ${role === 'owner' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={(e) => setRole(e.target.value)} className="sr-only" />
                  <Hotel className={`w-6 h-6 ${role === 'owner' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold mt-2 ${role === 'owner' ? 'text-emerald-800' : 'text-slate-700'}`}>Pemilik</span>
                </label>
              </div>
            </div>

            <Input
              label="Nama" id="name" type="text" required
              value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
            />

            <Input
              label="Alamat Email" id="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
            />

            <Input
              label="Nomor Telepon / WhatsApp" id="phone" type="tel" required
              value={phoneNumber} onChange={handlePhoneChange} placeholder="081234567890"
            />

            {/* 🟢 BLOK PASSWORD SEKARANG JAUH LEBIH BERSIH */}
            <div>
              <Input
                label="Password" id="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              />

              {/* Indikator Kekuatan Password tetap ditaruh di sini */}
              {password.length > 0 && (
                <div className="mt-2 text-xs space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                  <p className={isMinLength ? "text-emerald-600 font-medium flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                    <span>{isMinLength ? "✓" : "○"}</span> Minimal 8 karakter
                  </p>
                  <p className={hasUppercase ? "text-emerald-600 font-medium flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                    <span>{hasUppercase ? "✓" : "○"}</span> Minimal 1 huruf kapital
                  </p>
                  <p className={hasLowercase ? "text-emerald-600 font-medium flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                    <span>{hasLowercase ? "✓" : "○"}</span> Minimal 1 huruf kecil
                  </p>
                  <p className={hasNumber ? "text-emerald-600 font-medium flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                    <span>{hasNumber ? "✓" : "○"}</span> Minimal 1 angka
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={!isPasswordValid || phoneNumber.length < 10}
            >
              Daftar Akun Sekarang
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}