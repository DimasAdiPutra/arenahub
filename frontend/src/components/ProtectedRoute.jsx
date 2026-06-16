import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Tunggu sampai status pengecekan token di AuthContext selesai
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  // Jika belum login, tendang ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role user tidak ada di dalam daftar yang diizinkan, kembalikan ke beranda
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Jika lolos verifikasi, tampilkan halaman anak (children)
  return <Outlet />;
}