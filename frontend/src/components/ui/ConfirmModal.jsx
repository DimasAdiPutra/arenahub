import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Gelap */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onClose : undefined}
      ></div>

      {/* Kotak Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 animate-fadeIn">
        <div className="p-6 text-center space-y-4">

          {/* Ikon Peringatan */}
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>

          {/* Teks */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex border-t border-slate-100 p-3 gap-2">
          <Button
            variant="ghost"
            size="md"
            fullWidth={true}
            disabled={loading}
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            size="md"
            fullWidth={true}
            loading={loading}
            onClick={onConfirm}
          >
            Ya, Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}