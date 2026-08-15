import { LoaderCircle } from "lucide-react";
import { Link } from "react-router";

export default function Button({
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md',         // 'sm' | 'md' | 'lg'
  fullWidth = true,    // true | false
  disabled = false,
  loading = false,
  children,
  onClick,
  to,                  // Jika diisi, otomatis merender tag <Link>
  className = '',      // Untuk kustomisasi style tambahan
  ...props
}) {
  // 🎨 Pilihan Varian Warna
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs focus:ring-emerald-600',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white border-transparent shadow-xs focus:ring-slate-900',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent focus:ring-rose-600',
    dangerGhost: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-transparent focus:ring-rose-600',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border-transparent focus:ring-slate-400',
    outline: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
  };

  // 📐 Pilihan Ukuran Button
  const sizes = {
    sm: 'py-2 px-3 text-xs font-bold rounded-xl',
    md: 'py-2.5 px-4 text-sm font-semibold rounded-xl',
    lg: 'py-3 px-5 text-sm font-bold rounded-xl',
  };

  const baseStyles = `inline-flex justify-center items-center border transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${fullWidth ? 'w-full' : 'w-auto'
    } ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  // 🟢 Jika properti `to` diberikan, render komponen <Link>
  if (to && !disabled) {
    return (
      <Link to={to} className={baseStyles} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  // 🌐 Jika tidak ada `to`, render elemen <button> biasa
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={baseStyles}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoaderCircle className="animate-spin h-4 w-4 text-current" strokeWidth={2.5} />
          <span>Memproses...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}