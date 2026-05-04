'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = 'info') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('obgp-toast', { detail: { message, type } });
    window.dispatchEvent(event);
  }
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('obgp-toast', handleToast);
    return () => window.removeEventListener('obgp-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none'
    }}>
      {toasts.map(t => {
        const bg = t.type === 'error' ? '#fef2f2' : t.type === 'success' ? '#f0fdf4' : '#eff6ff';
        const border = t.type === 'error' ? '#f87171' : t.type === 'success' ? '#4ade80' : '#60a5fa';
        const color = t.type === 'error' ? '#991b1b' : t.type === 'success' ? '#166534' : '#1e40af';
        const Icon = t.type === 'error' ? AlertCircle : t.type === 'success' ? CheckCircle2 : Info;
        
        return (
          <div key={t.id} style={{
            background: bg, border: `1px solid ${border}`, color,
            padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}>
            <Icon size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
              opacity: 0.6, marginLeft: 8, padding: 0, display: 'flex'
            }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
