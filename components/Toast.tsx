import React, { useEffect } from 'react';
import { ToastNotification } from '../types';
import { Icons } from './Icon';

interface ToastProps {
  notifications: ToastNotification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeNotification(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastNotification; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-fade-in-up`}>
      {toast.type === 'success' && <Icons.Save size={18} />}
      {toast.type === 'error' && <Icons.X size={18} />}
      {toast.type === 'info' && <Icons.Monitor size={18} />}
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
};
