import { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import OwnerSidebar from '../components/OwnerSidebar';

export default function OwnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

      {/* 🟢 SIDEBAR DRAWER */}
      <OwnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 🟢 TOP HEADER BAR (Konsep Navbar) */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Tombol Hamburger untuk Membuka Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            aria-label="Buka Menu"
          >
            <Menu size={22} />
          </button>

          <span className="font-extrabold text-base tracking-tight text-slate-900">
            ArenaHub <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Owner Panel</span>
          </span>
        </div>
      </header>

      {/* 🟢 KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}