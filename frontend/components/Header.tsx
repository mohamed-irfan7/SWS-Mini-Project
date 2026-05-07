"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Header({ unreadCount: propCount }: { unreadCount?: number }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(propCount ?? 0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API}/api/notifications`);
        const count = res.data.filter((n: { read: boolean }) => !n.read).length;
        setUnread(count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (propCount !== undefined) setUnread(propCount);
  }, [propCount]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Livvic:wght@300;400;500;600;700;900&display=swap');
        .header-nav-link {
          font-family: 'Livvic', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 8px;
          transition: all 0.18s ease;
        }
        .header-nav-link:hover { color: #1d4ed8; background: rgba(29,78,216,0.06); }
        .header-nav-link.active { color: #1d4ed8; background: rgba(29,78,216,0.08); font-weight: 600; }
        .bell-btn {
          position: relative;
          background: none;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          color: #6b7280;
        }
        .bell-btn:hover { border-color: #1d4ed8; color: #1d4ed8; background: rgba(29,78,216,0.04); }
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-family: 'Livvic', sans-serif;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          padding: 0 3px;
          animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(229,231,235,0.8)",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 3h7l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M11 3v3h3" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M6 9h6M6 12h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "17px", color: "#111827", letterSpacing: "-0.3px" }}>
              DocDash
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link href="/" className={`header-nav-link${pathname === "/" ? " active" : ""}`}>Dashboard</Link>
            <Link href="/notifications" className={`header-nav-link${pathname === "/notifications" ? " active" : ""}`}>Notifications</Link>
          </nav>

          {/* Bell */}
          <Link href="/notifications" style={{ textDecoration: "none" }}>
            <button className="bell-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unread > 0 && (
                <span key={unread} className="badge">{unread > 99 ? "99+" : unread}</span>
              )}
            </button>
          </Link>
        </div>
      </header>
    </>
  );
}
