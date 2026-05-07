"use client";

const API = process.env.NEXT_PUBLIC_API_URL;

interface FileDoc {
  _id: string;
  originalName: string;
  filename: string;
  size: number;
  status: string;
  createdAt: string;
}

interface FileListProps {
  files: FileDoc[];
  loading: boolean;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  uploaded: { bg: "rgba(34,197,94,0.08)", text: "#15803d", dot: "#22c55e" },
  processing: { bg: "rgba(245,158,11,0.08)", text: "#b45309", dot: "#f59e0b" },
  failed: { bg: "rgba(239,68,68,0.08)", text: "#dc2626", dot: "#ef4444" },
};

function SkeletonRow() {
  return (
    <tr>
      {[70, 50, 40, 60, 40].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{
            height: "13px", width: `${w}%`, borderRadius: "6px",
            background: "linear-gradient(90deg, #f3f4f6 25%, #e9eaf0 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function FileList({ files, loading }: FileListProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .file-table { width: 100%; border-collapse: collapse; }
        .file-table thead th {
          font-family: 'Livvic', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #9ca3af;
          padding: 10px 16px;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
          background: #fafbff;
        }
        .file-table tbody tr {
          border-bottom: 1px solid #f9fafb;
          transition: background 0.15s;
        }
        .file-table tbody tr:last-child { border-bottom: none; }
        .file-table tbody tr:hover { background: rgba(59,130,246,0.02); }
        .file-table tbody td {
          padding: 13px 16px;
          font-family: 'Livvic', sans-serif;
          font-size: 13px;
          color: #374151;
          vertical-align: middle;
        }
        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Livvic', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #1d4ed8;
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 7px;
          border: 1px solid rgba(29,78,216,0.15);
          background: rgba(29,78,216,0.04);
          transition: all 0.15s;
        }
        .download-btn:hover {
          background: rgba(29,78,216,0.09);
          border-color: rgba(29,78,216,0.3);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Livvic', sans-serif;
        }
        .empty-state {
          text-align: center;
          padding: 64px 24px;
        }
      `}</style>

      <div style={{ borderRadius: "14px", border: "1px solid #f0f1f5", overflow: "hidden", background: "white" }}>
        {/* Table header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fafbff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <span style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "14px", color: "#111827" }}>
              Uploaded Files
            </span>
            {!loading && (
              <span style={{
                fontFamily: "'Livvic', sans-serif", fontSize: "11px", fontWeight: 600,
                background: "rgba(29,78,216,0.08)", color: "#1d4ed8",
                padding: "2px 8px", borderRadius: "999px",
              }}>
                {files.length}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "14px",
                        background: "rgba(59,130,246,0.07)", display: "flex",
                        alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                      <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "15px", color: "#374151", marginBottom: "6px" }}>
                        No files yet
                      </div>
                      <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "13px", color: "#9ca3af" }}>
                        Upload your first PDF to get started
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                files.map((file) => {
                  const statusStyle = statusColors[file.status] ?? statusColors.uploaded;
                  return (
                    <tr key={file._id}>
                      {/* Name */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "30px", height: "30px", flexShrink: 0, borderRadius: "7px",
                            background: "rgba(29,78,216,0.07)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <span style={{
                            fontWeight: 600, color: "#111827", maxWidth: "220px",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      {/* Size */}
                      <td style={{ color: "#6b7280", fontWeight: 500 }}>{formatSize(file.size)}</td>
                      {/* Status */}
                      <td>
                        <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusStyle.dot, display: "inline-block" }} />
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </span>
                      </td>
                      {/* Date */}
                      <td style={{ color: "#9ca3af", fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(file.createdAt)}</td>
                      {/* Download */}
                      <td>
                        <a
                          className="download-btn"
                          href={`${API}/api/files/download/${file.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
