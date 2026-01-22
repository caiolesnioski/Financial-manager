import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import { Check, AlertCircle, Info, X } from 'lucide-react';

/**
 * Componente que renderiza todos os Toasts
 * Deve ser colocado no layout principal (normalmente em App.jsx)
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500',
          icon: <Check size={20} />,
          text: 'text-white'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <AlertCircle size={20} />,
          text: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: <AlertCircle size={20} />,
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-blue-500',
          icon: <Info size={20} />,
          text: 'text-white'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map(toast => {
        const styles = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.text} rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-sm animate-slide-in pointer-events-auto`}
          >
            <span className="flex-shrink-0">{styles.icon}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
