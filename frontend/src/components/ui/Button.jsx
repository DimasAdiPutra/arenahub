import { LoaderCircle } from "lucide-react";

export default function Button({ type = 'button', disabled = false, loading = false, children, onClick }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          {/* Spinner Loading Halus */}
          <LoaderCircle className="animate-spin h-5 w-5 text-white" strokeWidth={2.5} />
          <span>Memproses...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}