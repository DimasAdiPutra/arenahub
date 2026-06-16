import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Toast from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Hotel, Users } from 'lucide-react';

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
      await API.post('/auth/register', {
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
            {/* ... bagian input Form sama persis dengan kode sebelumnya ... */}
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
              label="Name" id="name" type="text" required
              value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
            />

            <Input
              label="Alamat Email" id="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com  "
            />

            <Input
              label="Nomor Telepon / WhatsApp" id="phone" type="tel" required
              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="081234567890"
            />

            <Input
              label="Password" id="password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            />

            <Button type="submit" loading={loading}>
              Daftar Akun Sekarang
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}