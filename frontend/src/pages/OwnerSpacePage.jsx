import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router';
import {
  PlusCircle,
  Trash2,
  Edit3,
  Eye,
  Store,
  AlertCircle,
  Loader2
} from 'lucide-react';
import API from '../utils/api';
import SpaceCard from '../components/SpaceCard';
import ConfirmModal from '../components/ui/ConfirmModal'; // Pastikan sudah di-import

export default function OwnerSpacesPage() {
  // Asumsi triggerToast didapatkan dari Outlet Context (atau sesuaikan dengan strukturmu)
  const { triggerToast } = useOutletContext() || {};

  // State untuk manajemen data
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal Hapus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [arenaToDelete, setArenaToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mengambil data arena khusus milik owner yang sedang login
      const res = await API.get('/owner/my-spaces');
      setSpaces(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil daftar arena milik Anda.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Fungsi untuk membuka modal konfirmasi
  const openDeleteModal = (id, title) => {
    setArenaToDelete({ id, title });
    setIsModalOpen(true);
  };

  // 2. Fungsi eksekusi hapus setelah user klik "Ya, Hapus" di dalam modal
  const confirmDelete = async () => {
    if (!arenaToDelete) return;

    const targetId = arenaToDelete.id;
    const targetTitle = arenaToDelete.title;

    // 1. BACKUP DATA LAMA: Buat salinan state jika nanti API ternyata gagal
    const previousSpaces = [...spaces];

    // 2. OPTIMISTIC UPDATE: Langsung tutup modal & hilangkan arena dari layar seketika!
    setIsModalOpen(false);
    setSpaces((prev) => prev.filter((s) => s._id !== targetId));

    try {
      // 3. PROSES BACKGROUND: Biarkan API bekerja secara asinkron di belakang layar
      await API.delete(`/spaces/${targetId}`);

      // Jika berhasil, munculkan toast
      if (triggerToast) {
        triggerToast('success', 'Arena Dihapus', `Arena "${targetTitle}" berhasil dihapus.`);
      }
    } catch (err) {
      // 4. ROLLBACK: Oops, ternyata API error/gagal. Kembalikan arena ke layar!
      setSpaces(previousSpaces);

      if (triggerToast) {
        triggerToast('error', 'Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan server.');
      }
    } finally {
      setArenaToDelete(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

      {/* 🟢 HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="text-emerald-600" size={26} />
            Kelola Arena
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh lapangan dan arena sewa yang Anda miliki.
          </p>
        </div>

        <Link
          to="/owner/spaces/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
        >
          <PlusCircle size={18} />
          Tambah Arena Baru
        </Link>
      </div>

      {/* 🟢 AREA CONTENT (LOADING / ERROR / EMPTY / GRID) */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
          <p className="text-sm text-slate-500 font-medium">Memuat arena milik Anda...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : spaces.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Store size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Arena Terdaftar</h3>
            <p className="text-xs text-slate-500 mt-1">
              Anda belum mendaftarkan arena sewa satu pun.
            </p>
          </div>
          <Link
            to="/owner/spaces/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            <PlusCircle size={16} /> Daftarkan Arena Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space._id || space.id}
              space={space}
              actions={
                <div className="flex items-center gap-1.5">
                  {/* Tombol Preview Detail Publik */}
                  <Link
                    to={`/space/${space._id || space.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka Preview Detail Arena"
                    className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                  >
                    <Eye size={15} />
                  </Link>

                  {/* Tombol Edit */}
                  <Link
                    to={`/owner/spaces/edit/${space._id || space.id}`}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-100"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </Link>

                  {/* Tombol Hapus (Kini membuka modal, bukan window.confirm) */}
                  <button
                    onClick={() => openDeleteModal(space._id || space.id, space.title)}
                    disabled={deletingId === (space._id || space.id)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer border border-rose-100"
                    title="Hapus Arena"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* 🟢 MODAL KONFIRMASI HAPUS BUATAN SENDIRI */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Arena Permanen?"
        message={`Apakah Anda yakin ingin menghapus arena "${arenaToDelete?.title}"? Tindakan ini tidak dapat dibatalkan dan seluruh gambar di cloud akan ikut terhapus.`}
        loading={deletingId === arenaToDelete?.id}
      />

    </div>
  );
}