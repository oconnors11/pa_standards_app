import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10B981" />,
    error: <AlertCircle size={18} color="#EF4444" />,
    info: <Info size={18} color="#3B82F6" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--safe-area-bottom) + 24px)',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 18px',
      background: '#0F2744',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: 'var(--radius-md)',
      color: '#F8FAFC',
      fontSize: '0.9rem',
      fontWeight: '500',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
      <button 
        onClick={onClose}
        style={{
          marginLeft: '8px',
          color: 'var(--text-muted)',
          padding: '2px',
          borderRadius: '4px'
        }}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
