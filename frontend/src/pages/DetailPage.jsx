import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, MapPin, Tag, Store } from 'lucide-react';

// Import components
import ImageCarousel from '../components/ImageCarousel';
import Toast from '../components/ui/Toast';
import BookingWidget from '../components/BookingWidget';

// Import context & utils
import { useAuth } from '../context/AuthContext'; // ◄ 1. Import AuthContext
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Button from '../components/ui/Button';

const DetailPage = () => {
  useDocumentTitle('Detail Arena');

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ◄ 2. Ambil data user yang sedang login

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toastConfig, setToastConfig] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const triggerToast = (type, title, message) => {
    setToastConfig({ show: true, type, title, message });

    setTimeout(() => {
      setToastConfig(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const fetchSpaceDetail = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/spaces/${id}`);
        setSpace(response.data.data);
      } catch (err) {
        console.error('Gagal memuat data detail space:', err);
        setError(err.response?.data?.message || 'Gagal mengambil detail arena.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSpaceDetail();
  }, [id]);

  if (loading) return <div className="text-center pt-20 text-slate-500 font-medium">Memuat detail arena...</div>;
  if (error || !space) return <div className="text-center pt-20 text-rose-600 font-semibold">{error}</div>;

  // 🟢 3. Pengecekan apakah user yang login adalah pemilik arena ini
  const rawOwnerId = typeof space.owner === 'object' ? space.owner?._id : space.owner;
  const currentUserId = user?._id || user?.id;
  const isMyOwnSpace = Boolean(user && currentUserId && rawOwnerId && String(currentUserId) === String(rawOwnerId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">

      {/* TOMBOL KEMBALI */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Kembali
      </button>

      {/* LAYOUT UTAMA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* KOLOM KIRI: DETAIL VENUE */}
        <div className="lg:col-span-2 space-y-6">

          {/* CAROUSEL GAMBAR */}
          <ImageCarousel images={space.images} title={space.title} />

          {/* Area Informasi Konten */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">{space.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/70 font-bold">
                  <Tag className="w-3 h-3" />
                  {space.category?.name || 'Umum'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {space.location}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Render Fasilitas Dinamis */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Fasilitas Tersedia</h3>
              <div className="flex flex-wrap gap-2">
                {space.facilities && space.facilities.length > 0 ? (
                  space.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl shadow-2xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{facility}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Owner belum menyertakan fasilitas spesifik.</p>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Deskripsi */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi Arena</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{space.description}</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: WIDGET PEMESANAN ATAU CARD PREVIEW OWNER */}
        <div className="lg:col-span-1">
          {isMyOwnSpace ? (
            /* 🟢 KOTAK INFORMASI KHUSUS OWNER (Ganti Widget Booking) */
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4 lg:sticky lg:top-8">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                <Store size={24} />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Arena Milik Anda</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ini adalah halaman peninjauan (*preview*) arena sewa Anda. Pemesanan slot waktu disembunyikan untuk akun pemilik.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <p><span className="font-bold text-slate-700">Harga Sewa:</span> Rp {space.pricePerHour?.toLocaleString('id-ID')} / jam</p>
                <p><span className="font-bold text-slate-700">Status:</span> Aktif di Katalog</p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/owner/spaces/edit/${space._id}`)}
              >
                Edit Informasi Arena
              </Button>
            </div>
          ) : (
            /* 🌐 WIDGET PEMESANAN NORMAL UNTUK CUSTOMER & OWNER LAIN */
            <BookingWidget space={space} triggerToast={triggerToast} />
          )}
        </div>

        {/* KOMPONEN TOAST INTERAKTIF */}
        <Toast
          show={toastConfig.show}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
        />

      </div>
    </div>
  );
};

export default DetailPage;