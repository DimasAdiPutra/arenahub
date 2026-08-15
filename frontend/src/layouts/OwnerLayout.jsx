import { useState } from 'react';
import { Outlet } from 'react-router'; // Perhatikan ini, kita butuh Outlet
import { Menu } from 'lucide-react';
import OwnerSidebar from '../components/OwnerSidebar';
import Toast from '../components/ui/Toast'; // Sesuaikan path komponen Toast milikmu

export default function OwnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🟢 1. STATE UNTUK TOAST
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // 🟢 2. FUNGSI UNTUK MEMICU TOAST (Otomatis hilang dalam 3 detik)
  const triggerToast = (type, title, message) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

      {/* 🟢 3. RENDER KOMPONEN TOAST DI PALING ATAS */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      {/* SIDEBAR DRAWER */}
      <OwnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* TOP HEADER BAR */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
          >
            <Menu size={22} />
          </button>

          <span className="font-extrabold text-base tracking-tight text-slate-900">
            CeritaKita <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Owner Panel</span>
          </span>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 🟢 4. KIRIM triggerToast KE SEMUA HALAMAN ANAK (Termasuk OwnerSpacesPage) */}
        <Outlet context={{ triggerToast }} />
      </main>

    </div>
  );
}