import { Search } from 'lucide-react';
import Input from './ui/Input';

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  categories, // ◄ Terima properti categories dari hook
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100/80">

      {/* Kolom Input Pencarian */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama arena atau lokasi arena..."
          className="pl-12"
        />
      </div>

      {/* Quick Tags Filter Kategori Dinamis dari Database */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar select-none">
        {categories && categories.map((cat) => (
          <button
            key={cat._id || cat.id} // ◄ Menggunakan ID Mongoose sebagai key unik React
            onClick={() => setSelectedCategory(cat.name)} // ◄ Set filter berdasarkan field 'name' skema Mongoose Anda
            className={`text-xs font-bold px-4 py-2 rounded-lg transition whitespace-nowrap shrink-0 border
              ${selectedCategory === cat.name
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            {cat.name} {/* ◄ Menampilkan nama kategori asli dari database */}
          </button>
        ))}
      </div>

    </div>
  );
}