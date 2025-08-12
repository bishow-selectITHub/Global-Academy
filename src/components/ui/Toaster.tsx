import { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dedupeKey?: string;
  throttleMs?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastShownRef = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const key = isOffline && toast.type === 'error'
      ? 'network-offline-error'
      : (toast.dedupeKey || `${toast.type}|${toast.title}|${toast.message || ''}`);
    const throttleMs = isOffline && toast.type === 'error' ? Math.max(30000, toast.throttleMs ?? 0) : (toast.throttleMs ?? 8000);
    const now = Date.now();
    const lastShown = lastShownRef.current[key] ?? 0;

    if (now - lastShown < throttleMs) {
      return;
    }

    lastShownRef.current[key] = now;
    setToasts((prev) => [...prev, { ...toast, id } as Toast]);
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      addToast({
        type: 'warning',
        title: 'You are offline',
        message: 'Some features may not work until connection is restored.',
        duration: 5000,
        dedupeKey: 'network-offline',
        throttleMs: 30000,
      });
    };

    const handleOnline = () => {
      addToast({
        type: 'success',
        title: 'Back online',
        message: 'Your connection has been restored.',
        duration: 3000,
        dedupeKey: 'network-online',
        throttleMs: 30000,
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
  }
};

export const Toaster = () => {
  const { toasts, removeToast } = useToast?.() || { toasts: [], removeToast: () => { } };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, toasts[0].duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100"
          style={{ animation: 'slideInUp 0.3s ease-out' }}
        >
          <div className="p-4 flex">
            <div className="flex-shrink-0 mr-3">
              <ToastIcon type={toast.type} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{toast.title}</h3>
              {toast.message && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toaster;