import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { formatRupiah } from '../utils/formatters';

export default function SpaceCard({ space }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
      <div className="aspect-16/10 bg-slate-100 overflow-hidden relative">
        <img
          src={(space.images && space.images.length > 0) ? `${space.images[0].url}?tr=w-400,h-300,fo-auto` : fallbackImage}
          alt={space.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => { e.target.src = fallbackImage; }}
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
          {space.category?.name || 'Arena'}
        </span>
      </div>

      <div className="p-4 flex flex-col grow">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-emerald-700 transition line-clamp-1">
          {space.title}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="truncate font-medium">{space.location}</span>
        </div>

        <div className="border-t border-slate-50 my-3.5"></div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-none">Mulai dari</p>
            <p className="text-base font-extrabold text-emerald-700 mt-1">
              {formatRupiah(space.pricePerHour)}<span className="text-slate-400 text-xs font-medium">/jam</span>
            </p>
          </div>

          <Link
            to={`/venue/${space._id || space.id}`}
            className="bg-slate-900 text-white p-2.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="hidden sm:inline">Lihat Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}