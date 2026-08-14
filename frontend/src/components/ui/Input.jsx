import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, id, type = 'text', required = false, value, onChange, placeholder }) {
  // State khusus untuk toggle password (hanya aktif jika type="password")
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          // Jika isPassword true dan showPassword true, ubah jadi 'text'. Selain itu gunakan type bawaan.
          type={isPassword && showPassword ? 'text' : type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          // Tambahkan padding kanan (pr-10) khusus untuk password agar teks tidak menabrak ikon mata
          className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition placeholder:text-slate-300 ${isPassword ? 'pr-10' : ''}`}
        />

        {/* Tombol mata hanya di-render jika properti type adalah 'password' */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}