import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Store,
  CheckCircle2
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Import Komponen UI buatanmu
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast'; // Sesuaikan path jika berbeda

export default function CreateSpacePage() {
  useDocumentTitle('Tambah Arena Baru');
  const navigate = useNavigate();

  // 🟢 1. STATE UNTUK TOAST
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  const showTemporaryToast = ({ type, title, message }) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // 2. STATE FORMULIR
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerHour: '',
    location: '',
  });

  // 3. STATE FASILITAS & GAMBAR
  const [facilities, setFacilities] = useState(['Ruang Ganti', 'Toilet', 'Parkir']);
  const [facilityInput, setFacilityInput] = useState('');

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // 4. STATE KATEGORI & LOADING
  const [categories, setCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Kategori saat halaman dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Gagal mengambil kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  // Handler Input Biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Fasilitas
  const handleAddFacility = (e) => {
    e.preventDefault();
    if (!facilityInput.trim()) return;
    if (facilities.includes(facilityInput.trim())) return;
    setFacilities([...facilities, facilityInput.trim()]);
    setFacilityInput('');
  };

  const handleRemoveFacility = (indexToRemove) => {
    setFacilities(facilities.filter((_, idx) => idx !== indexToRemove));
  };

  // Handler Gambar (Dengan Kompresi)
  const handleImageChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (imageFiles.length + selectedFiles.length > 5) {
      showTemporaryToast({ type: 'warning', title: 'Batas Maksimal', message: 'Maksimal gambar yang dapat diunggah adalah 5 foto.' });
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFiles = [];
      const newPreviews = [];

      for (const file of selectedFiles) {
        const compressed = await imageCompression(file, options);
        const convertedFile = new File([compressed], file.name, { type: file.type });

        compressedFiles.push(convertedFile);
        newPreviews.push(URL.createObjectURL(convertedFile));
      }

      setImageFiles((prev) => [...prev, ...compressedFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      showTemporaryToast({ type: 'error', title: 'Gagal', message: 'Terjadi kesalahan saat memproses gambar.' });
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🟢 HANDLER SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      showTemporaryToast({ type: 'warning', title: 'Foto Wajib Diisi', message: 'Harap unggah minimal 1 foto arena!' });
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('pricePerHour', formData.pricePerHour);
      data.append('location', formData.location);
      data.append('facilities', JSON.stringify(facilities));

      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      await API.post('/spaces', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showTemporaryToast({ type: 'success', title: 'Arena Didaftarkan', message: `Arena "${formData.title}" berhasil ditambahkan!` });

      // Jeda 1.5 detik agar Toast terlihat sebelum pindah halaman
      setTimeout(() => {
        navigate('/owner/spaces');
      }, 1500);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal menambahkan arena baru.';
      showTemporaryToast({ type: 'error', title: 'Gagal', message: errMsg });
      setSubmitting(false); // Matikan loading jika gagal
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6 relative">

      {/* 🟢 RENDER TOAST DI SINI */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      {/* TOMBOL KEMBALI */}
      <button
        type="button"
        onClick={() => navigate('/owner/spaces')}
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Kembali ke Kelola Arena
      </button>

      {/* HEADER PAGE */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="text-emerald-600" size={26} />
          Tambah Arena Baru
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi informasi dan unggah foto terbaik lapangan yang ingin Anda sewakan.
        </p>
      </div>

      {/* FORMULIR UTAMA */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* KOTAK 1: INFORMASI UTAMA */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
            Informasi Dasar
          </h2>

          <Input
            label="Nama Arena / Lapangan"
            name="title"
            required
            placeholder="Contoh: Lapangan Futsal Synthetic A - CeritaKita"
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Kategori */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    setFormData((prev) => ({ ...prev, category: '' }));
                  }}
                  className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  {isCustomCategory ? 'Pilih dari List' : '+ Kategori Baru'}
                </button>
              </div>

              {isCustomCategory ? (
                <Input
                  name="category"
                  required
                  placeholder="Ketik kategori baru (Misal: Padel)"
                  value={formData.category}
                  onChange={handleChange}
                />
              ) : (
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition bg-white"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              label="Harga per Jam (Rp)"
              name="pricePerHour"
              type="number"
              required
              min="0"
              placeholder="150000"
              value={formData.pricePerHour}
              onChange={handleChange}
            />

          </div>

          <Input
            label="Lokasi / Alamat Lengkap"
            name="location"
            required
            placeholder="Jl. Sukabumi No. 12, Bandung Jawa Barat"
            value={formData.location}
            onChange={handleChange}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deskripsi Arena <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Jelaskan jenis rumput/lantai, kondisi pencahayaan, aturan tempat, dll."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition placeholder:text-slate-300"
            />
          </div>

        </div>

        {/* KOTAK 2: FASILITAS ARENA */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
            Fasilitas Arena
          </h2>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Tambah fasilitas (Misal: Wi-Fi, Kantin, Rompi)"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFacility(e);
                }}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth={false}
              onClick={handleAddFacility}
              className="gap-1"
            >
              <Plus size={16} /> Tambah
            </Button>
          </div>

          {/* List Tag Fasilitas */}
          <div className="flex flex-wrap gap-2 pt-2">
            {facilities.map((facility, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold"
              >
                <CheckCircle2 size={12} className="text-emerald-600" />
                {facility}
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(idx)}
                  className="text-emerald-600 hover:text-rose-600 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* KOTAK 3: UPLOAD FOTO (Maks 5) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Foto Arena <span className="text-rose-500">*</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {imageFiles.length} / 5 Foto
            </span>
          </div>

          {/* Area Preview Foto */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Tombol Input File */}
            {imageFiles.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition group">
                <Upload size={22} className="text-slate-400 group-hover:text-emerald-600 mb-1 transition" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">
                  Unggah Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth={false}
            onClick={() => navigate('/owner/spaces')}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth={false}
            loading={submitting}
          >
            Daftarkan Arena
          </Button>
        </div>

      </form>
    </div>
  );
}