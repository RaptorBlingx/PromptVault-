import React, { useEffect } from 'react';
import { ToastNotification } from '../types';
import { Icons } from './Icon';

interface ToastProps {
  notification: ToastNotification;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Icons.CheckCircle size={18} style={{ color: 'var(--color-success)' }} />;
      case 'error':
        return <Icons.XCircle size={18} style={{ color: 'var(--color-error)' }} />;
      default:
        return <Icons.Info size={18} style={{ color: 'var(--color-accent)' }} />;
    }
  };

  return (
    <div
      className={`toast toast-${notification.type} animate-slide-in-right`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      {getIcon()}
      <p style={{
        flex: 1,
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        margin: 0,
      }}>
        {notification.message}
      </p>
      <button
        onClick={onRemove}
        className="btn btn-ghost btn-icon"
        style={{ padding: 4 }}
      >
        <Icons.X size={14} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  notifications: ToastNotification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  removeNotification
}) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-6)',
      right: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      zIndex: 200,
    }}>
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};
