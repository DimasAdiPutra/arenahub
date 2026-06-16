import { CircleCheck } from "lucide-react";

export default function Toast({ show, title, message }) {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <div className="bg-emerald-800 text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-600/20">
        <CircleCheck className="w-5 h-5 text-emerald-300 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-emerald-200 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}