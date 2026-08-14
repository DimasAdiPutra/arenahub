import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, PlusCircle, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OwnerSidebar() {
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
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
      <div>
        {/* Logo / Brand Area */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              ArenaHub <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Owner</span>
            </span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="p-4 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
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

      {/* User Profile & Logout di Bawah Sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl flex items-center justify-between">
        <div className="truncate">
          <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Owner Arena'}</p>
          <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Keluar"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}