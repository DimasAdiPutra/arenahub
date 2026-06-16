import { Link } from 'react-router';

export default function Footer() {
  const tahunSekarang = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Arena<span className="text-emerald-700">Hub</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            &copy; {tahunSekarang} ArenaHub Project. Hak Cipta Dilindungi.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-emerald-700 transition">Bantuan</Link>
          <a href="#" className="hover:text-emerald-700 transition">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-emerald-700 transition">Kontak</a>
        </div>
      </div>
    </footer>
  );
}