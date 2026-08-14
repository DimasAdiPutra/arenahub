import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, PlusCircle, LogOut, Home, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OwnerSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Tambah Lapangan', path: '/owner/spaces/create', icon: <PlusCircle size={20} /> },
  ];

  return (
    <>
      {/* 🟢 OVERLAY GELAP DI BELAKANG SIDEBAR */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* 🟢 PANEL SIDEBAR (DRAWER PENUH) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Header Sidebar & Tombol Close (X) */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                ArenaHub
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="p-4 space-y-1">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <Home size={20} className="text-slate-400" />
              Kembali ke Beranda
            </Link>

            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Manajemen Bisnis
            </div>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil User & Tombol Keluar di Bagian Bawah */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Owner Arena'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}