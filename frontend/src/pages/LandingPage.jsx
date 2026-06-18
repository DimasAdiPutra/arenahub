import { Trophy } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useSpaces from '../hooks/useSpaces'; // ◄ Custom Hook
import SearchFilter from '../components/SearchFilter'; // ◄ Sub-komponen
import SpaceCard from '../components/SpaceCard'; // ◄ Sub-komponen

export default function LandingPage() {
  useDocumentTitle('Sewa Arena Online Mudah & Cepat');

  // Panggil semua data & fungsi kontrol dari custom hook hanya dengan 1 baris
  const {
    loading, error, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, filteredSpaces, categories
  } = useSpaces();

  return (
    <div className="font-sans antialiased bg-slate-50 min-h-screen pb-12">

      {/* HERO BANNER */}
      <section className="bg-emerald-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-3xl mx-auto">
          {/* Mengubah tagline agar lebih realistis dan berfokus pada solusi kemudahan */}
          <span className="bg-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-600/30">
            Solusi Praktis Sewa Ruang & Arena
          </span>

          {/* Mengubah judul agar mencakup tempat olahraga DAN ruang non-olahraga */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-tight">
            Temukan & Booking <br className="hidden sm:inline" /> Ruangan dan Arena Favoritmu
          </h1>

          {/* Mengubah deskripsi agar terasa inklusif untuk semua jenis kegiatan (olahraga/acara/rapat) */}
          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto font-medium">
            Sewa berbagai pilihan arena olahraga dan ruang serbaguna secara instan. Cukup pilih jam, bayar, dan langsung gunakan tanpa ribet!
          </p>
        </div>
      </section>

      {/* FLOATING SEARCH & FILTER COMPONENT */}
      <section className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories} // ◄ Salurkan state kategori dinamis ke bawah
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </section>

      {/* KATALOG MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">Rekomendasi Tempat Terpopuler</h2>
            <p className="text-xs text-slate-400 font-medium">Fasilitas terbaik pilihan komunitas dan pelaku kreatif lokal</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
            {filteredSpaces.length} Tempat Ditemukan
          </span>
        </div>

        {/* Status Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="bg-slate-200 aspect-16/10 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-full pt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Status Error Backend */}
        {!loading && error && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <p className="text-sm font-semibold text-red-500">{error}</p>
          </div>
        )}

        {/* Status Data Pencarian Kosong */}
        {!loading && !error && filteredSpaces.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-6 max-w-md mx-auto">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-800 mt-4">Arena Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba ketik kata kunci lain atau pilih kategori lainnya.</p>
          </div>
        )}

        {/* Grid Kartu Utama - Tinggal Di-mapping saja */}
        {!loading && !error && filteredSpaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space._id || space.id} space={space} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}