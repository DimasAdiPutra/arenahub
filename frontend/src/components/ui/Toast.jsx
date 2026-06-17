import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ show, type = 'success', title, message }) {
  const styles = {
    success: {
      bg: 'bg-emerald-800 border-emerald-600/20',
      iconColor: 'text-emerald-300',
      textColor: 'text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    error: {
      bg: 'bg-rose-800 border-rose-600/20',
      iconColor: 'text-rose-300',
      textColor: 'text-rose-200',
      icon: <XCircle className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-amber-800 border-amber-600/20',
      iconColor: 'text-amber-300',
      textColor: 'text-amber-200',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  };

  const activeStyle = styles[type] || styles.success;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <div className={`${activeStyle.bg} text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border`}>
        <div className={activeStyle.iconColor} className="shrink-0">
          {activeStyle.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{title}</p>
          <p className={`text-xs mt-0.5 ${activeStyle.textColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}