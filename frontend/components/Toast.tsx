"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "bulk";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, JSX.Element> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#22c55e" fillOpacity="0.15" />
      <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#ef4444" fillOpacity="0.15" />
      <path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#3b82f6" fillOpacity="0.15" />
      <path d="M9 8v4M9 6v.01" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  bulk: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#8b5cf6" fillOpacity="0.15" />
      <path d="M5 7h8M5 10h8M5 13h5" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const borderColors: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#3b82f6",
  bulk: "#8b5cf6",
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => dismiss(), 4500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 350);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(100%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        borderLeft: `3px solid ${borderColors[toast.type]}`,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        borderRadius: "10px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        cursor: "pointer",
        minWidth: "280px",
        maxWidth: "360px",
        marginBottom: "8px",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: "1px" }}>{icons[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 600, fontSize: "13px", color: "#111827", lineHeight: 1.3 }}>
          {toast.title}
        </div>
        <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "12px", color: "#6b7280", marginTop: "2px", lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>
      <button
        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0", flexShrink: 0, lineHeight: 1 }}
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
