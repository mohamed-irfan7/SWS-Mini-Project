"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import FileList from "@/components/FileList";
import Toast, { ToastMessage } from "@/components/Toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface FileDoc {
  _id: string;
  originalName: string;
  filename: string;
  size: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 5));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/files`);
      setFiles(res.data);
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not load files." });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`);
      setUnread(res.data.filter((n: { read: boolean }) => !n.read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchUnread();

    // Socket.io connection
    const socket: Socket = io(API!, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("notification", (data: { message?: string; fileName?: string }) => {
      addToast({
        type: "info",
        title: "New notification",
        message: data.message ?? `File "${data.fileName}" was processed.`,
      });
      fetchFiles();
      fetchUnread();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchFiles, fetchUnread, addToast]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Livvic:wght@300;400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fe; font-family: 'Livvic', sans-serif; }
        .stat-card {
          background: white;
          border: 1px solid #f0f1f5;
          border-radius: 14px;
          padding: 20px 24px;
          flex: 1;
          min-width: 0;
          transition: box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #f8f9fe 40%)" }}>
        <Header unreadCount={unread} />
        <Toast toasts={toasts} onDismiss={dismissToast} />

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Page title */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{
              fontFamily: "'Livvic', sans-serif", fontWeight: 900,
              fontSize: "28px", color: "#0f172a", letterSpacing: "-0.5px", marginBottom: "6px",
            }}>
              Document Dashboard
            </h1>
            <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: "14px", color: "#9ca3af", fontWeight: 400 }}>
              Upload, manage, and download your PDF documents in one place.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Total Files
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(29,78,216,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
              </div>
              <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 900, fontSize: "30px", color: "#0f172a", lineHeight: 1 }}>
                {loading ? "—" : files.length}
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Uploaded
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(34,197,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 900, fontSize: "30px", color: "#0f172a", lineHeight: 1 }}>
                {loading ? "—" : files.filter((f) => f.status === "uploaded").length}
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Total Size
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
              </div>
              <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 900, fontSize: "30px", color: "#0f172a", lineHeight: 1 }}>
                {loading ? "—" : (() => {
                  const total = files.reduce((a, f) => a + f.size, 0);
                  if (total < 1024 * 1024) return `${(total / 1024).toFixed(0)}KB`;
                  return `${(total / 1024 / 1024).toFixed(1)}MB`;
                })()}
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Notifications
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>
              </div>
              <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 900, fontSize: "30px", color: "#0f172a", lineHeight: 1 }}>
                {unread}
              </div>
            </div>
          </div>

          {/* Upload zone */}
          <div style={{
            background: "white", borderRadius: "16px", padding: "28px",
            border: "1px solid #f0f1f5", marginBottom: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>
                Upload Documents
              </h2>
              <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: "13px", color: "#9ca3af" }}>
                PDF files only · Multiple files supported · Per-file progress tracking
              </p>
            </div>
            <UploadZone onUploadComplete={fetchFiles} onToast={addToast} />
          </div>

          {/* File list */}
          <FileList files={files} loading={loading} />
        </main>
      </div>
    </>
  );
}
