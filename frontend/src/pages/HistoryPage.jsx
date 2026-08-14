import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Toast from '../components/ui/Toast';

export default function HistoryPage() {
  useDocumentTitle('Riwayat Transaksi');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Toast Notifikasi
  const [toast, setToast] = useState({ show: false, title: '', message: '' });

  // 🟢 FUNGSI BARU: Memunculkan Toast lalu menghilangkannya otomatis setelah 3 detik
  const showTemporaryToast = ({ title, type, message }) => {
    setToast({ show: true, title, type, message });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000); // 3000 ms = 3 detik
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await API.get('/bookings/my-bookings');
      setBookings(response.data.data);
    } catch (err) {
      setError('Gagal memuat riwayat transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🕒 LOGIKA BATAS WAKTU 15 MENIT
  // ==========================================
  const isPaymentExpiredLocal = (createdAt) => {
    const bookingTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiffMinutes = (currentTime - bookingTime) / (1000 * 60);
    return timeDiffMinutes > 15;
  };

  // ==========================================
  // 💳 FITUR TOMBOL BAYAR DARURAT
  // ==========================================
  const handlePayNow = (snapToken) => {
    if (!window.snap) {
      showTemporaryToast({ title: 'Error', type: 'error', message: 'Sistem pembayaran belum siap.' })
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: function () {
        showTemporaryToast({ title: 'Pembayaran Sukses!', message: 'Status arena berhasil diperbarui.' })
        fetchMyBookings(); // Refresh data otomatis
      },
      onPending: function () {
        showTemporaryToast({ title: 'Menunggu', type: 'warning', message: 'Selesaikan pembayaran Anda segera.' });
        fetchMyBookings();
      },
      onError: function () {
        showTemporaryToast({ title: 'Gagal', type: 'error', message: 'Pembayaran gagal diproses.' });
        fetchMyBookings();
      },
      onClose: function () {
        showTemporaryToast({ title: 'Tertutup', type: 'warning', message: 'Anda menutup jendela pembayaran.' });
        fetchMyBookings();
      }
    });
  };

  // ==========================================
  // 🔍 LOGIKA PENCARIAN & FILTERING
  // ==========================================
  const filteredBookings = bookings.filter((booking) => {
    const spaceTitle = booking.space?.title || '';
    return spaceTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper Formatter
  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatDate = (dateString) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(dateString));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header & Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Riwayat Transaksi</h1>

          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Cari nama arena..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Tabel Data Section */}
        <div className="rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">Memuat data transaksi...</div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 flex items-center justify-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Belum ada riwayat transaksi yang sesuai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-transparent border-none shadow-none">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 animate-pulse rounded-xl border border-slate-100 shadow-sm">Memuat data transaksi...</div>
                ) : error ? (
                  <div className="p-8 text-center text-rose-500 flex items-center justify-center gap-2 rounded-xl border border-slate-100 shadow-sm">
                    <AlertCircle size={20} /> {error}
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 rounded-xl border border-slate-100 shadow-sm">
                    Belum ada riwayat transaksi yang sesuai.
                  </div>
                ) : (
                  // Grid pembungkus Card. Di HP 1 kolom, di laptop bisa dibuat berjejer 2 kolom agar tidak terlalu memanjang ke bawah
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {filteredBookings.map((booking) => {
                      const isPending = booking.paymentStatus === 'pending';
                      const isExpiredLocal = isPaymentExpiredLocal(booking.createdAt);

                      // Dekorasi Badge Dinamis
                      let badgeClass = "bg-slate-100 text-slate-800";
                      let displayStatus = booking.paymentStatus;

                      if (booking.paymentStatus === 'success') {
                        badgeClass = "bg-emerald-100 text-emerald-800";
                      } else if (booking.paymentStatus === 'failed' || booking.paymentStatus === 'expired') {
                        badgeClass = "bg-rose-100 text-rose-800";
                      } else if (isPending) {
                        if (isExpiredLocal) {
                          badgeClass = "bg-rose-100 text-rose-800";
                          displayStatus = "expired";
                        } else {
                          badgeClass = "bg-amber-100 text-amber-800";
                        }
                      }

                      // Pastikan jam diurutkan dari terkecil ke terbesar
                      const sortedHours = [...booking.bookedHours].sort((a, b) => a - b);
                      const startHour = sortedHours[0]; // Jam mulai
                      const duration = sortedHours.length; // Durasi (1 index = 1 jam)
                      const endHour = sortedHours[sortedHours.length - 1] + 1; // Jam selesai

                      return (
                        <div
                          key={booking._id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full"
                        >
                          {/* Bagian Atas Card: Judul dan Badge Status */}
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg line-clamp-2">
                                {booking.space?.title || 'Arena Dihapus'}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                {formatDate(booking.date)}
                              </p>
                            </div>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                              {displayStatus}
                            </span>
                          </div>

                          {/* Bagian Tengah Card: Detail Jam */}
                          <div className="bg-slate-50 rounded-lg p-3 mb-4 flex justify-between items-center border border-slate-100">
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Waktu Main:</p>
                              <p className="font-bold text-slate-700 text-sm">
                                {startHour}:00 - {endHour}:00
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-0.5">Durasi:</p>
                              <span className="font-bold text-emerald-700 text-sm bg-emerald-100/50 px-2.5 py-1 rounded-md">
                                {duration} Jam
                              </span>
                            </div>
                          </div>

                          {/* Bagian Bawah Card: Harga & Tombol (Border Top) */}
                          <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                            <div>
                              <p className="text-xs text-slate-400 font-medium mb-0.5">Total Belanja</p>
                              <p className="font-bold text-emerald-600 text-base sm:text-lg">
                                {formatRupiah(booking.totalPrice)}
                              </p>
                            </div>

                            {/* Tombol Bayar Darurat */}
                            {isPending && !isExpiredLocal && booking.snapToken && (
                              <button
                                onClick={() => handlePayNow(booking.snapToken)}
                                className="px-5 py-2 sm:px-6 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
                              >
                                Bayar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}