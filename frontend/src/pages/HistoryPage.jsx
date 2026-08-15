import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Toast from '../components/ui/Toast';
import HistoryCard from '../components/HistoryCard'; // 🟢 Import komponen baru

export default function HistoryPage() {
  useDocumentTitle('Riwayat Transaksi');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToast] = useState({ show: false, title: '', message: '' });

  const showTemporaryToast = ({ title, type, message }) => {
    setToast({ show: true, title, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
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

  const isPaymentExpiredLocal = (createdAt) => {
    const bookingTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiffMinutes = (currentTime - bookingTime) / (1000 * 60);
    return timeDiffMinutes > 15;
  };

  const handlePayNow = (snapToken) => {
    if (!window.snap) {
      showTemporaryToast({ title: 'Error', type: 'error', message: 'Sistem pembayaran belum siap.' });
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: function () {
        showTemporaryToast({ title: 'Pembayaran Sukses!', message: 'Status arena berhasil diperbarui.' });
        fetchMyBookings();
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

  const filteredBookings = bookings.filter((booking) => {
    const spaceTitle = booking.space?.title || 'Arena Dihapus';
    return spaceTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        <div className="rounded-xl shadow-sm border border-slate-100 overflow-hidden bg-white">
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
            <div className="p-4 sm:p-6 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredBookings.map((booking) => (
                  <HistoryCard
                    key={booking._id}
                    booking={booking}
                    onPay={handlePayNow}
                    isExpired={isPaymentExpiredLocal(booking.createdAt)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}