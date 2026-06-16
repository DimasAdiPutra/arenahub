export default function Input({ label, id, type = 'text', required = false, value, onChange, placeholder }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm transition placeholder:text-slate-300"
      />
    </div>
  );
}