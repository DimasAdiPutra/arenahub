import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

export default function HistoryCard({ booking, onPay, isExpired }) {
  // Helper Formatter
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatDate = (dateString) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(dateString));

  // 🟢 1. IDENTIFIKASI APAKAH ARENA SUDAH DIHAPUS OLEH OWNER
  const isDeleted = !booking.space;
  const spaceTitle = isDeleted ? 'Arena Telah Ditutup / Dihapus' : booking.space.title;

  // 🟢 2. LOGIKA STATUS & KADALUARSA
  const isPending = booking.paymentStatus === 'pending';
  let badgeClass = "bg-slate-100 text-slate-800";
  let displayStatus = booking.paymentStatus;

  if (booking.paymentStatus === 'success') {
    badgeClass = "bg-emerald-100 text-emerald-800";
  } else if (booking.paymentStatus === 'failed' || booking.paymentStatus === 'expired') {
    badgeClass = "bg-rose-100 text-rose-800";
  } else if (isPending) {
    if (isExpired) {
      badgeClass = "bg-rose-100 text-rose-800";
      displayStatus = "expired";
    } else {
      badgeClass = "bg-amber-100 text-amber-800";
    }
  }

  // 🟢 3. LOGIKA JAM MAIN
  const sortedHours = [...booking.bookedHours].sort((a, b) => a - b);
  const startHour = sortedHours[0];
  const duration = sortedHours.length;
  const endHour = sortedHours[sortedHours.length - 1] + 1;

  return (
    <div
      className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full
        ${isDeleted ? 'bg-slate-50 border-slate-200 opacity-90 grayscale-40' : 'bg-white border-slate-200'}
      `}
    >
      {/* Bagian Atas Card: Judul dan Badge Status */}
      <div className="flex justify-between items-start gap-4 mb-4 relative">
        <div>
          <h3 className={`font-extrabold text-base sm:text-lg line-clamp-2 
            ${isDeleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}
          `}>
            {spaceTitle}
          </h3>

          <div className="flex items-center gap-1.5 mt-1">
            {isDeleted ? (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                <AlertTriangle size={12} /> Permanen Ditutup
              </span>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {formatDate(booking.date)}
              </p>
            )}
          </div>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
          {displayStatus}
        </span>
      </div>

      {/* Bagian Tengah Card: Detail Jam */}
      <div className={`rounded-lg p-3 mb-4 flex justify-between items-center border 
        ${isDeleted ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-50 border-slate-100'}
      `}>
        <div>
          <p className={`text-xs mb-0.5 ${isDeleted ? 'text-slate-400' : 'text-slate-500'}`}>Waktu Main:</p>
          <p className={`font-bold text-sm ${isDeleted ? 'text-slate-500' : 'text-slate-700'}`}>
            {startHour}:00 - {endHour}:00
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xs mb-0.5 ${isDeleted ? 'text-slate-400' : 'text-slate-500'}`}>Durasi:</p>
          <span className={`font-bold text-sm px-2.5 py-1 rounded-md
            ${isDeleted ? 'text-slate-500 bg-slate-200' : 'text-emerald-700 bg-emerald-100/50'}
          `}>
            {duration} Jam
          </span>
        </div>
      </div>

      {/* Bagian Bawah Card: Harga & Tombol (Border Top) */}
      <div className={`flex justify-between items-center border-t pt-4 mt-auto 
        ${isDeleted ? 'border-slate-200' : 'border-slate-100'}
      `}>
        <div>
          <p className="text-xs text-slate-400 font-medium mb-0.5">Total Belanja</p>
          <p className={`font-bold text-base sm:text-lg ${isDeleted ? 'text-slate-500' : 'text-emerald-600'}`}>
            {formatCurrency(booking.totalPrice)}
          </p>
        </div>

        {/* Tombol Bayar Darurat (Disembunyikan jika arena sudah dihapus) */}
        {!isDeleted && isPending && !isExpired && booking.snapToken && (
          <button
            onClick={() => onPay(booking.snapToken)}
            className="px-5 py-2 sm:px-6 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            Bayar
          </button>
        )}
      </div>
    </div>
  );
}