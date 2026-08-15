import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Store,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Import Komponen UI
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast'; // Sesuaikan jika path-nya berbeda

export default function EditSpacePage() {
  useDocumentTitle('Edit Arena');
  const { id } = useParams();
  const navigate = useNavigate();

  // 🟢 1. STATE UNTUK TOAST
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  const showTemporaryToast = ({ type, title, message }) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // 2. STATE LOADING
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 3. STATE FORMULIR UTAMA
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerHour: '',
    location: '',
  });

  // 4. STATE FASILITAS
  const [facilities, setFacilities] = useState([]);
  const [facilityInput, setFacilityInput] = useState('');

  // 5. STATE GAMBAR (Lama vs Baru)
  const [existingImages, setExistingImages] = useState([]); // Array dari objek DB { url, fileId }
  const [newImageFiles, setNewImageFiles] = useState([]);   // Array dari File objek (sudah kompres)
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Array dari URL Blob

  // 6. STATE KATEGORI
  const [categories, setCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // 🟢 FETCH DATA ARENA & KATEGORI SAAT MOUNT
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [spaceRes, catRes] = await Promise.all([
          API.get(`/spaces/${id}`),
          API.get('/categories')
        ]);

        const spaceData = spaceRes.data.data;
        const catData = catRes.data.data || [];

        setCategories(catData);
        setFormData({
          title: spaceData.title || '',
          description: spaceData.description || '',
          category: spaceData.category?._id || spaceData.category || '',
          pricePerHour: spaceData.pricePerHour || '',
          location: spaceData.location || '',
        });
        setFacilities(spaceData.facilities || []);
        setExistingImages(spaceData.images || []);

      } catch (err) {
        console.error('Gagal mengambil data arena:', err);
        showTemporaryToast({ type: 'error', title: 'Gagal', message: 'Tidak dapat memuat data arena.' });
        setTimeout(() => navigate('/owner/spaces'), 1500); // Balik jika error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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

  // 🟢 HANDLER GAMBAR (Kompresi & Validasi Maksimal 5 Foto Gabungan)
  const handleImageChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const totalImages = existingImages.length + newImageFiles.length + selectedFiles.length;
    if (totalImages > 5) {
      showTemporaryToast({ type: 'warning', title: 'Batas Maksimal', message: 'Maksimal gambar yang dapat disimpan adalah 5 foto.' });
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFiles = [];
      const previews = [];

      for (const file of selectedFiles) {
        const compressed = await imageCompression(file, options);
        const convertedFile = new File([compressed], file.name, { type: file.type });
        compressedFiles.push(convertedFile);
        previews.push(URL.createObjectURL(convertedFile));
      }

      setNewImageFiles((prev) => [...prev, ...compressedFiles]);
      setNewImagePreviews((prev) => [...prev, ...previews]);
    } catch (error) {
      showTemporaryToast({ type: 'error', title: 'Gagal', message: 'Terjadi kesalahan saat memproses gambar.' });
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🟢 HANDLER SUBMIT (UPDATE KE BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      showTemporaryToast({ type: 'warning', title: 'Foto Wajib Diisi', message: 'Harap sisakan atau unggah minimal 1 foto arena!' });
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

      // Kirim array gambar lama yang masih dipertahankan
      data.append('existingImages', JSON.stringify(existingImages));

      // Append gambar baru (jika ada)
      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      await API.put(`/spaces/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showTemporaryToast({ type: 'success', title: 'Arena Diperbarui', message: `Perubahan pada "${formData.title}" berhasil disimpan!` });

      // Jeda agar toast terlihat sebelum kembali ke daftar arena
      setTimeout(() => {
        navigate('/owner/spaces');
      }, 1500);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal memperbarui arena.';
      showTemporaryToast({ type: 'error', title: 'Gagal Update', message: errMsg });
      setSubmitting(false); // Matikan loading jika gagal
    }
  };

  // Tampilan jika sedang mengambil data dari backend
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        <p className="font-semibold text-sm">Memuat data arena...</p>
      </div>
    );
  }

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
        Batal & Kembali
      </button>

      {/* HEADER PAGE */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="text-emerald-600" size={26} />
          Edit Arena
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perbarui informasi atau ganti foto lapangan sewa Anda.
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
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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
              value={formData.pricePerHour}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Lokasi / Alamat Lengkap"
            name="location"
            required
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
                placeholder="Tambah fasilitas (Misal: Wi-Fi, Kantin)"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddFacility(e); }}
              />
            </div>
            <Button type="button" variant="secondary" size="md" fullWidth={false} onClick={handleAddFacility} className="gap-1">
              <Plus size={16} /> Tambah
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {facilities.map((facility, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {facility}
                <button type="button" onClick={() => handleRemoveFacility(idx)} className="text-emerald-600 hover:text-rose-600 cursor-pointer"><X size={14} /></button>
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
              {existingImages.length + newImageFiles.length} / 5 Foto
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">

            {/* Render Gambar Lama */}
            {existingImages.map((img, idx) => (
              <div key={`old-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                <img src={img.url} alt="Lama" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">Lama</span>
                <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Render Gambar Baru */}
            {newImagePreviews.map((src, idx) => (
              <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-emerald-50">
                <img src={src} alt="Baru" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">Baru</span>
                <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Tombol Input File (Hidden jika sudah 5) */}
            {(existingImages.length + newImageFiles.length) < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition group">
                <Upload size={22} className="text-slate-400 group-hover:text-emerald-600 mb-1 transition" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">Unggah Foto</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="md" fullWidth={false} onClick={() => navigate('/owner/spaces')}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="md" fullWidth={false} loading={submitting}>
            Simpan Perubahan
          </Button>
        </div>

      </form>
    </div>
  );
}