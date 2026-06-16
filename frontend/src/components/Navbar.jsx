import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

import { Bolt, ChevronDown, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // Untuk dropdown mobile
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false); // Untuk dropdown desktop
  const navRef = useRef(null);

  // 🖱️ Menutup semua dropdown jika user mengetuk di luar area navbar
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
        setDesktopDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsAlert = () => {
    setMenuOpen(false);
    setDesktopDropdownOpen(false);
    alert("Fitur Pengaturan Akun (Nama, Email, No. Telp, Ganti Password) sedang disiapkan untuk rilis versi berikutnya! 😊");
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 w-full" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* 🟩 KIRI: Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
          Arena<span className="text-slate-800">Hub</span>
        </Link>

        {/* 🟩 KANAN: Menu Desktop (Layar Tablet/Laptop Ke Atas `md:`) */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/history" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition">
                Booking History
              </Link>

              {/* Dropdown Akun Desktop */}
              <div className="relative border-l pl-6 border-slate-200">
                <button
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  className="flex items-center cursor-pointer gap-2 group focus:outline-none"
                >
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 font-medium capitalize mt-1 text-right">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform duration-200 ${desktopDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Isi Dropdown Desktop */}
                <div className={`absolute right-0 top-12 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 transition-all duration-300 ease-out transform origin-top-right ${desktopDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged in as</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  {user.role === 'owner' && (
                    <Link to="/owner/dashboard" onClick={() => setDesktopDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition">
                      Dashboard Owner
                    </Link>
                  )}
                  <button onClick={handleSettingsAlert} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition">
                    Account Settings
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={() => { setDesktopDropdownOpen(false); logout(); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold transition">
                    Logout Account
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 px-3 py-1.5 transition">Login</Link>
              <Link to="/register" className="text-sm font-semibold bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition">Daftar</Link>
            </div>
          )}
        </div>

        {/* 🟩 KANAN MOBIL: Tombol Hamburger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-600 p-1 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? (<X className="w-6 h-6" strokeWidth={3} />) : (<Menu className="w-6 h-6" strokeWidth={3} />)}
          </button>
        </div>
      </div>

      {/* 📱 MENU PANEL MOBILE (Meluncur Mulus ke Bawah pada Layar HP) */}
      <div
        className={`md:hidden bg-white border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out origin-top
          ${menuOpen ? 'max-h-100 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
      >
        <div className="px-5 py-4 space-y-3.5 shadow-inner">
          {user && (
            <div className="pb-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Akun Aktif</p>
              <p className="text-base font-extrabold text-slate-800 mt-0.5 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email} • <span className="capitalize font-semibold text-emerald-700">{user.role}</span></p>
            </div>
          )}

          {/* 📍 Bagian 1: Navigasi Halaman Utama */}
          <div className="flex flex-col space-y-2 pt-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 py-1 transition"
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-700 py-1 transition"
                >
                  Booking History
                </Link>
                {user.role === 'owner' && (
                  <Link
                    to="/owner/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-slate-700 hover:text-emerald-700 py-1 transition"
                  >
                    Dashboard Owner
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ➖ GARIS HORIZONTAL PEMBATAS (Hanya muncul jika sudah login) */}
          {user && <hr className="border-slate-100 my-2" />}

          {/* 📍 Bagian 2: Pengaturan Akun & Log Out */}
          {user ? (
            <div className="flex flex-col space-y-2.5">
              <button
                onClick={handleSettingsAlert}
                className="w-full text-left text-sm font-medium text-slate-500 hover:text-emerald-700 py-1 transition flex items-center gap-2"
              >
                <Bolt className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                Account Settings
              </button>

              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full text-left text-sm font-bold text-red-600 py-1 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                Logout Account
              </button>
            </div>
          ) : (
            /* Jika belum login, tampilkan grid tombol masuk/daftar di paling bawah */
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-semibold text-slate-600 bg-slate-50 py-2.5 rounded-xl block"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-semibold bg-emerald-700 text-white py-2.5 rounded-xl block"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}