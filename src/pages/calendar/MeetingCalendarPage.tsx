import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeetingRequest {
  id: number;
  name: string;
  role: "Investor" | "Entrepreneur";
  date: string;
  time: string;
  status: "pending" | "confirmed" | "declined";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatDisplay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function buildCalendarCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: Date[] = [];
  for (let i = 0; i < first.getDay(); i++)
    cells.push(new Date(year, month, -(first.getDay() - i - 1)));
  for (let i = 1; i <= last.getDate(); i++)
    cells.push(new Date(year, month, i));
  while (cells.length % 7 !== 0)
    cells.push(new Date(year, month + 1, cells.length - last.getDate() - first.getDay() + 1));
  return cells;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const today = new Date();

const INITIAL_SLOTS: Record<string, string[]> = {
  [toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2))]: ["09:00", "14:00"],
  [toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5))]: ["11:00", "15:30"],
  [toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8))]: ["09:00", "13:00"],
};

const INITIAL_REQUESTS: MeetingRequest[] = [
  {
    id: 1, name: "Alex Mercer", role: "Investor",
    date: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    time: "09:00", status: "pending",
  },
  {
    id: 2, name: "Sara Kim", role: "Entrepreneur",
    date: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
    time: "11:00", status: "pending",
  },
  {
    id: 3, name: "Tom Bridges", role: "Investor",
    date: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8)),
    time: "09:00", status: "confirmed",
  },
];

// ─── Badge Component ──────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: "blue" | "green" | "red" | "amber" }) {
  const styles: Record<string, React.CSSProperties> = {
    blue:  { background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #B5D4F4" },
    green: { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97" },
    red:   { background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F7C1C1" },
    amber: { background: "#FAEEDA", color: "#633806", border: "0.5px solid #FAC775" },
  };
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 500, ...styles[color] }}>
      {label}
    </span>
  );
}

// ─── Main Page Export (matches Nexus naming convention) ───────────────────────

export function MeetingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, string[]>>(INITIAL_SLOTS);
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);
  const [newSlotTime, setNewSlotTime] = useState("09:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const cells = buildCalendarCells(year, month);
  const todayKey = toKey(today);

  const addSlot = useCallback(() => {
    if (!selectedKey || !newSlotTime) return;
    setSlots((prev) => {
      const existing = prev[selectedKey] ?? [];
      if (existing.includes(newSlotTime)) return prev;
      return { ...prev, [selectedKey]: [...existing, newSlotTime].sort() };
    });
  }, [selectedKey, newSlotTime]);

  const removeSlot = useCallback((key: string, time: string) => {
    setSlots((prev) => {
      const updated = (prev[key] ?? []).filter((t) => t !== time);
      if (updated.length === 0) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: updated };
    });
  }, []);

  const handleRequest = useCallback((id: number, status: "confirmed" | "declined") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const pending = requests.filter((r) => r.status === "pending");
  const confirmed = requests.filter((r) => r.status === "confirmed");

  const card: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "1.25rem",
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: "1.25rem", color: "#111827" }}>
        Meeting Scheduler
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>

        {/* ── Left: Calendar + Slots ── */}
        <div style={card}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
              {MONTHS[month]} {year}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["‹", "›"].map((arrow, i) => (
                <button
                  key={arrow}
                  onClick={() => setCurrentDate(new Date(year, month + (i === 0 ? -1 : 1), 1))}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb",
                    background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#6b7280",
                  }}
                >
                  {arrow}
                </button>
              ))}
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", fontWeight: 600, padding: "2px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((cell, i) => {
              const key = toKey(cell);
              const inMonth = cell.getMonth() === month;
              const isToday = key === todayKey;
              const isSel = key === selectedKey;
              const hasDot = !!slots[key];

              let bg = "transparent", color = inMonth ? "#374151" : "#d1d5db", border = "1px solid transparent";
              if (isSel)       { bg = "#2563eb"; color = "#fff"; border = "1px solid #2563eb"; }
              else if (isToday){ bg = "#eff6ff"; color = "#2563eb"; border = "1px solid #bfdbfe"; }

              return (
                <div
                  key={i}
                  onClick={() => inMonth && setSelectedKey(key)}
                  style={{
                    aspectRatio: "1", borderRadius: 8, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", fontSize: 13,
                    cursor: inMonth ? "pointer" : "default", position: "relative",
                    bg, color, border, background: bg,
                    transition: "background 0.1s",
                  }}
                >
                  {cell.getDate()}
                  {hasDot && (
                    <span style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: isSel ? "#93c5fd" : "#16a34a",
                      position: "absolute", bottom: 3,
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Availability slots */}
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 10 }}>
              {selectedKey ? `Availability — ${formatDisplay(selectedKey)}` : "Click a date to manage slots"}
            </p>

            {selectedKey && (
              <>
                {(slots[selectedKey] ?? []).length === 0 ? (
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>No slots added yet.</p>
                ) : (
                  (slots[selectedKey] ?? []).map((time) => (
                    <div key={time} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{
                        flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb",
                        borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#374151",
                      }}>
                        🕐 {time}
                      </div>
                      <button
                        onClick={() => removeSlot(selectedKey, time)}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: "1px solid #fecaca",
                          background: "#fef2f2", cursor: "pointer", fontSize: 13, color: "#ef4444",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    style={{
                      flex: 1, fontSize: 13, border: "1px solid #e5e7eb",
                      borderRadius: 8, padding: "6px 10px", background: "#f9fafb", color: "#374151",
                    }}
                  />
                  <button
                    onClick={addSlot}
                    style={{
                      fontSize: 13, padding: "6px 16px", borderRadius: 8,
                      border: "none", background: "#2563eb", color: "#fff",
                      cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    + Add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Requests + Confirmed ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Requests */}
          <div style={card}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 10 }}>
              Meeting Requests
              {pending.length > 0 && (
                <span style={{
                  marginLeft: 8, background: "#fef3c7", color: "#92400e",
                  fontSize: 11, padding: "1px 7px", borderRadius: 999, fontWeight: 600,
                }}>
                  {pending.length}
                </span>
              )}
            </p>
            {pending.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "1rem 0" }}>
                No pending requests
              </p>
            ) : pending.map((r) => (
              <div key={r.id} style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: 8, padding: "10px 12px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.name}</span>
                  <Badge label={r.role} color={r.role === "Investor" ? "blue" : "amber"} />
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                  📅 {formatDisplay(r.date)} at {r.time}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => handleRequest(r.id, "confirmed")} style={{
                    fontSize: 11, padding: "3px 12px", borderRadius: 6,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    color: "#166534", cursor: "pointer", fontWeight: 600,
                  }}>✓ Accept</button>
                  <button onClick={() => handleRequest(r.id, "declined")} style={{
                    fontSize: 11, padding: "3px 12px", borderRadius: 6,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    color: "#991b1b", cursor: "pointer", fontWeight: 600,
                  }}>✕ Decline</button>
                </div>
              </div>
            ))}
          </div>

          {/* Confirmed */}
          <div style={card}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 10 }}>
              Confirmed Meetings
            </p>
            {confirmed.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "1rem 0" }}>
                No confirmed meetings yet
              </p>
            ) : confirmed.map((r) => (
              <div key={r.id} style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: 8, padding: "10px 12px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.name}</span>
                  <Badge label="Confirmed" color="green" />
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                  📅 {formatDisplay(r.date)} at {r.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
