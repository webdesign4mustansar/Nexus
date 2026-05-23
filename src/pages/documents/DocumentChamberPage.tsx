import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "Draft" | "In Review" | "Signed";

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_DOCS: Document[] = [
  { id: 1, name: "Investment_Agreement_v2.pdf",  type: "PDF",  size: "2.4 MB", status: "In Review", uploadedAt: "May 20, 2026", uploadedBy: "Alex Mercer"  },
  { id: 2, name: "NDA_Confidentiality.pdf",       type: "PDF",  size: "1.1 MB", status: "Signed",    uploadedAt: "May 18, 2026", uploadedBy: "Sara Kim"     },
  { id: 3, name: "Term_Sheet_Q2.docx",            type: "DOCX", size: "540 KB", status: "Draft",     uploadedAt: "May 22, 2026", uploadedBy: "You"          },
  { id: 4, name: "Equity_Split_Proposal.pdf",     type: "PDF",  size: "3.2 MB", status: "Draft",     uploadedAt: "May 23, 2026", uploadedBy: "Tom Bridges"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<DocStatus, React.CSSProperties> = {
  Draft:      { background: "#f3f4f6", color: "#374151",  border: "1px solid #e5e7eb" },
  "In Review":{ background: "#fef3c7", color: "#92400e",  border: "1px solid #fde68a" },
  Signed:     { background: "#f0fdf4", color: "#166534",  border: "1px solid #bbf7d0" },
};

const STATUS_ICON: Record<DocStatus, string> = {
  Draft: "📝", "In Review": "🔍", Signed: "✅",
};

const ALL_STATUSES: DocStatus[] = ["Draft", "In Review", "Signed"];

function fileIcon(type: string) {
  return type === "PDF" ? "📄" : "📝";
}

// ─── Signature Pad ────────────────────────────────────────────────────────────

function SignaturePad({ onSave, onClose }: { onSave: (data: string) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() { drawing.current = false; }

  function clearPad() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function save() {
    const data = canvasRef.current?.toDataURL("image/png") ?? "";
    onSave(data);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "1.5rem",
        width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>
            ✍️ Sign Document
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: "#6b7280", lineHeight: 1,
          }}>✕</button>
        </div>

        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
          Draw your signature below:
        </p>

        <canvas
          ref={canvasRef}
          width={420} height={160}
          onMouseDown={startDraw} onMouseMove={draw}
          onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{
            width: "100%", height: 160, border: "1.5px dashed #d1d5db",
            borderRadius: 8, cursor: "crosshair", display: "block", touchAction: "none",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
          <button onClick={clearPad} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500,
          }}>
            Clear
          </button>
          <button onClick={save} style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onUpload }: { onUpload: (name: string, size: string, type: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    const type = file.name.endsWith(".pdf") ? "PDF" : "DOCX";
    const size = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;
    onUpload(file.name, size, type);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "#2563eb" : "#d1d5db"}`,
        borderRadius: 12, padding: "2rem",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        cursor: "pointer", background: dragging ? "#eff6ff" : "#f9fafb",
        transition: "all 0.15s", marginBottom: "1.25rem",
      }}
    >
      <span style={{ fontSize: 32 }}>📤</span>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>
        Drop your file here or click to browse
      </p>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
        Supports PDF, DOCX — max 20MB
      </p>
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" onChange={onChange} style={{ display: "none" }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DocumentChamberPage() {
  const [docs, setDocs] = useState<Document[]>(SEED_DOCS);
  const [filter, setFilter] = useState<DocStatus | "All">("All");
  const [signingDocId, setSigningDocId] = useState<number | null>(null);
  const [signedDocs, setSignedDocs] = useState<Set<number>>(new Set([2]));

  function uploadDoc(name: string, size: string, type: string) {
    const newDoc: Document = {
      id: Date.now(), name, type, size,
      status: "Draft",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      uploadedBy: "You",
    };
    setDocs((d) => [newDoc, ...d]);
  }

  function changeStatus(id: number, status: DocStatus) {
    setDocs((d) => d.map((doc) => doc.id === id ? { ...doc, status } : doc));
  }

  function deleteDoc(id: number) {
    setDocs((d) => d.filter((doc) => doc.id !== id));
  }

  function applySignature(data: string) {
    if (!signingDocId || !data) { setSigningDocId(null); return; }
    setSignedDocs((s) => new Set([...s, signingDocId]));
    changeStatus(signingDocId, "Signed");
    setSigningDocId(null);
  }

  const filtered = filter === "All" ? docs : docs.filter((d) => d.status === filter);

  const counts = {
    All: docs.length,
    Draft: docs.filter((d) => d.status === "Draft").length,
    "In Review": docs.filter((d) => d.status === "In Review").length,
    Signed: docs.filter((d) => d.status === "Signed").length,
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>
          Document Chamber
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Manage deals, contracts, and agreements
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.25rem" }}>
        {(["All", ...ALL_STATUSES] as const).map((s) => (
          <div key={s} style={{
            background: filter === s ? "#2563eb" : "#fff",
            border: `1px solid ${filter === s ? "#2563eb" : "#e5e7eb"}`,
            borderRadius: 10, padding: "12px 16px",
            cursor: "pointer", transition: "all 0.15s",
          }} onClick={() => setFilter(s)}>
            <p style={{ fontSize: 11, fontWeight: 600, color: filter === s ? "#bfdbfe" : "#6b7280", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s === "All" ? "Total" : s}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: filter === s ? "#fff" : "#111827", margin: 0 }}>
              {counts[s]}
            </p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={uploadDoc} />

      {/* Document list */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

        {/* List header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 80px 90px 120px 100px 120px",
          padding: "10px 16px", background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          <span>Document</span>
          <span>Type</span>
          <span>Size</span>
          <span>Uploaded</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            No documents found
          </div>
        ) : (
          filtered.map((doc, i) => (
            <div key={doc.id} style={{
              display: "grid", gridTemplateColumns: "2fr 80px 90px 120px 100px 120px",
              padding: "14px 16px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
              transition: "background 0.1s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{fileIcon(doc.type)}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>By {doc.uploadedBy}</p>
                </div>
              </div>

              {/* Type */}
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{doc.type}</span>

              {/* Size */}
              <span style={{ fontSize: 12, color: "#6b7280" }}>{doc.size}</span>

              {/* Date */}
              <span style={{ fontSize: 12, color: "#6b7280" }}>{doc.uploadedAt}</span>

              {/* Status badge */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px",
                borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
                ...STATUS_STYLE[doc.status],
              }}>
                {STATUS_ICON[doc.status]} {doc.status}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {/* Change status */}
                <select
                  value={doc.status}
                  onChange={(e) => changeStatus(doc.id, e.target.value as DocStatus)}
                  style={{
                    fontSize: 11, padding: "3px 6px", borderRadius: 6,
                    border: "1px solid #e5e7eb", background: "#f9fafb",
                    color: "#374151", cursor: "pointer",
                  }}
                >
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Sign button */}
                {doc.status !== "Signed" && (
                  <button
                    onClick={() => setSigningDocId(doc.id)}
                    title="Sign document"
                    style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      background: "#eff6ff", border: "1px solid #bfdbfe",
                      color: "#1d4ed8", cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    ✍️
                  </button>
                )}

                {/* Signed checkmark */}
                {signedDocs.has(doc.id) && (
                  <span title="Signed" style={{ fontSize: 16 }}>✅</span>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteDoc(doc.id)}
                  title="Delete document"
                  style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 6,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    color: "#dc2626", cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Signature pad modal */}
      {signingDocId !== null && (
        <SignaturePad
          onSave={applySignature}
          onClose={() => setSigningDocId(null)}
        />
      )}
    </div>
  );
}
