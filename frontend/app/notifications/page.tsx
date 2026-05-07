"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Header from "@/components/Header";
import Toast, { ToastMessage } from "@/components/Toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  fileName?: string;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 5));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`);
      setNotifications(res.data);
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not load notifications." });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await axios.patch(`${API}/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not mark as read." });
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${API}/api/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast({ type: "success", title: "Done", message: "All notifications marked as read." });
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not mark all as read." });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Livvic:wght@300;400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fe; font-family: 'Livvic', sans-serif; }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s;
          cursor: pointer;
          position: relative;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: rgba(59,130,246,0.025); }
        .notif-item.unread { background: rgba(29,78,216,0.03); }
        .notif-item.unread:hover { background: rgba(29,78,216,0.055); }
        .mark-read-btn {
          font-family: 'Livvic', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px 8px;
          border-radius: 6px;
          opacity: 0;
          transition: all 0.15s;
        }
        .notif-item:hover .mark-read-btn { opacity: 1; }
        .mark-read-btn:hover { background: rgba(59,130,246,0.1); }
        .mark-all-btn {
          font-family: 'Livvic', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1d4ed8;
          background: rgba(29,78,216,0.07);
          border: none;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 9px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mark-all-btn:hover { background: rgba(29,78,216,0.12); }
        .mark-all-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .skeleton { animation: pulse 1.4s infinite; background: #f3f4f6; border-radius: 6px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#f8f9fe 40%)" }}>
        <Header unreadCount={unreadCount} />
        <Toast toasts={toasts} onDismiss={dismissToast} />

        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Back + Title */}
          <div style={{ marginBottom: "24px" }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontFamily: "'Livvic', sans-serif", fontSize: "13px", fontWeight: 600,
              color: "#6b7280", textDecoration: "none", marginBottom: "16px",
              padding: "6px 10px", borderRadius: "8px", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Dashboard
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 900, fontSize: "26px", color: "#0f172a", letterSpacing: "-0.4px" }}>
                  Notifications
                </h1>
                <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                  {loading ? "Loading…" : `${notifications.length} total · ${unreadCount} unread`}
                </p>
              </div>

              {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllRead}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f0f1f5", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: "13px", width: "70%", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ height: "11px", width: "40%" }} />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "72px 24px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "rgba(59,130,246,0.07)", display: "flex",
                  alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>
                <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "15px", color: "#374151", marginBottom: "6px" }}>
                  No notifications yet
                </div>
                <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "13px", color: "#9ca3af" }}>
                  Upload a PDF to receive notifications
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item${!n.read ? " unread" : ""}`}
                  onClick={() => !n.read && markRead(n._id)}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
                      width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6",
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: "36px", height: "36px", flexShrink: 0, borderRadius: "10px",
                    background: n.read ? "rgba(156,163,175,0.1)" : "rgba(29,78,216,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={n.read ? "#9ca3af" : "#3b82f6"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Livvic', sans-serif", fontSize: "13px",
                      fontWeight: n.read ? 400 : 600,
                      color: n.read ? "#6b7280" : "#111827",
                      lineHeight: 1.4, marginBottom: "4px",
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "11px", color: "#9ca3af" }}>
                      {formatDate(n.createdAt)}
                    </div>
                  </div>

                  {/* Mark read btn (shows on hover if unread) */}
                  {!n.read && (
                    <button
                      className="mark-read-btn"
                      onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                    >
                      Mark read
                    </button>
                  )}

                  {/* Read check */}
                  {n.read && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
