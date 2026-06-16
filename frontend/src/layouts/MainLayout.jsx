import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* ◄ Halaman dinamis (Landing, Detail, History) akan muncul di sini */}
      </main>
      <Footer />
    </div>
  );
}