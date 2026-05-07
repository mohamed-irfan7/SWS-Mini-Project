"use client";
import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { ToastMessage, ToastType } from "./Toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
}

interface UploadZoneProps {
  onUploadComplete: () => void;
  onToast: (toast: Omit<ToastMessage, "id">) => void;
}

export default function UploadZone({ onUploadComplete, onToast }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateUpload = (id: string, patch: Partial<UploadFile>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type === "application/pdf");
    const rejected = Array.from(files).length - arr.length;

    if (rejected > 0) {
      onToast({ type: "error", title: "Invalid file type", message: `${rejected} file(s) skipped — PDF only.` });
    }
    if (arr.length === 0) return;

    const isBulk = arr.length > 3;
    if (isBulk) {
      onToast({ type: "bulk", title: "Bulk upload started", message: `Uploading ${arr.length} files in the background.` });
    }

    const newUploads: UploadFile[] = arr.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      progress: 0,
      status: "pending",
    }));

    setUploads((prev) => [...newUploads, ...prev]);

    await Promise.all(
      newUploads.map(async (uf) => {
        const form = new FormData();
        form.append("file", uf.file);
        updateUpload(uf.id, { status: "uploading" });
        try {
          await axios.post(`${API}/api/files/upload`, form, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
              updateUpload(uf.id, { progress: pct });
            },
          });
          updateUpload(uf.id, { status: "done", progress: 100 });
          if (!isBulk) {
            onToast({ type: "success", title: "Upload complete", message: `${uf.file.name} uploaded successfully.` });
          }
          onUploadComplete();
        } catch {
          updateUpload(uf.id, { status: "error", errorMsg: "Upload failed" });
          onToast({ type: "error", title: "Upload failed", message: `${uf.file.name} could not be uploaded.` });
        }
      })
    );

    if (isBulk) {
      onToast({ type: "success", title: "Bulk upload complete", message: `${arr.length} files uploaded.` });
    }
  }, [onToast, onUploadComplete]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const clearDone = () => setUploads((prev) => prev.filter((u) => u.status === "uploading" || u.status === "pending"));

  const activeUploads = uploads.filter((u) => u.status !== "done" || u.progress < 100);
  const completedUploads = uploads.filter((u) => u.status === "done");

  return (
    <div>
      <style>{`
        .upload-zone {
          border: 2px dashed #d1d5db;
          border-radius: 16px;
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafbff;
          position: relative;
          overflow: hidden;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.04);
        }
        .upload-zone.dragging {
          border-color: #1d4ed8;
          background: rgba(29,78,216,0.07);
          transform: scale(1.005);
        }
        .upload-zone.dragging::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(29,78,216,0.05) 0%, rgba(59,130,246,0.03) 100%);
          border-radius: 14px;
          pointer-events: none;
        }
        .progress-bar-track {
          background: #e5e7eb;
          border-radius: 999px;
          height: 4px;
          overflow: hidden;
          flex: 1;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.2s ease;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          margin-bottom: 6px;
          animation: slideIn 0.25s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .clear-btn {
          font-family: 'Livvic', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .clear-btn:hover { background: #f3f4f6; color: #374151; }
      `}</style>

      {/* Drop Zone */}
      <div
        className={`upload-zone${dragging ? " dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: dragging ? "rgba(29,78,216,0.12)" : "rgba(59,130,246,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto", transition: "all 0.2s",
            transform: dragging ? "scale(1.1) rotate(3deg)" : "none",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#1d4ed8" : "#3b82f6"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        </div>
        <div style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "6px" }}>
          {dragging ? "Drop your PDFs here" : "Drag & drop PDFs here"}
        </div>
        <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          or click to browse — PDF files only
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
          color: "white", borderRadius: "8px", padding: "8px 20px",
          fontFamily: "'Livvic', sans-serif", fontWeight: 600, fontSize: "13px",
          boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Choose Files
        </div>
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              {uploads.filter(u => u.status === "uploading").length > 0
                ? `Uploading ${uploads.filter(u => u.status === "uploading").length} file(s)…`
                : `${completedUploads.length} file(s) uploaded`}
            </span>
            {completedUploads.length > 0 && (
              <button className="clear-btn" onClick={clearDone}>Clear done</button>
            )}
          </div>

          {uploads.slice(0, 10).map((uf) => (
            <div key={uf.id} className="file-item">
              {/* PDF icon */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                background: uf.status === "error" ? "rgba(239,68,68,0.08)" : "rgba(29,78,216,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={uf.status === "error" ? "#ef4444" : "#1d4ed8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Livvic', sans-serif", fontSize: "12px", fontWeight: 600,
                  color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px",
                }}>
                  {uf.file.name}
                </div>
                {uf.status === "error" ? (
                  <div style={{ fontFamily: "'Livvic', sans-serif", fontSize: "11px", color: "#ef4444" }}>{uf.errorMsg}</div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${uf.progress}%`,
                          background: uf.status === "done" ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#3b82f6,#1d4ed8)",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
                      {uf.status === "done" ? "✓" : `${uf.progress}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
