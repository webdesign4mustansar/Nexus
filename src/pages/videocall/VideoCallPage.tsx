import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  id: number;
  name: string;
  role: "Investor" | "Entrepreneur";
  initials: string;
  color: string;
  muted: boolean;
  videoOff: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Seed Participants ────────────────────────────────────────────────────────

const REMOTE_PARTICIPANTS: Participant[] = [
  { id: 1, name: "Alex Mercer",  role: "Investor",     initials: "AM", color: "#185FA5", muted: false, videoOff: false },
  { id: 2, name: "Sara Kim",     role: "Entrepreneur", initials: "SK", color: "#0F6E56", muted: true,  videoOff: false },
  { id: 3, name: "Tom Bridges",  role: "Investor",     initials: "TB", color: "#854F0B", muted: false, videoOff: true  },
];

// ─── Video Tile ───────────────────────────────────────────────────────────────

function VideoTile({
  name, initials, color, muted, videoOff, isLocal, isLarge, isSpeaking,
}: {
  name: string; initials: string; color: string;
  muted: boolean; videoOff: boolean;
  isLocal?: boolean; isLarge?: boolean; isSpeaking?: boolean;
}) {
  return (
    <div style={{
      position: "relative",
      background: "#111827",
      borderRadius: 12,
      overflow: "hidden",
      aspectRatio: isLarge ? "16/9" : "4/3",
      border: isSpeaking ? "2px solid #2563eb" : "2px solid transparent",
      transition: "border-color 0.2s",
    }}>
      {/* Video placeholder / avatar */}
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: videoOff ? "#1f2937" : `${color}22`,
      }}>
        {videoOff ? (
          <div style={{
            width: isLarge ? 72 : 48, height: isLarge ? 72 : 48,
            borderRadius: "50%", background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isLarge ? 28 : 18, fontWeight: 600, color: "#fff",
          }}>
            {initials}
          </div>
        ) : (
          // Simulated video gradient
          <div style={{
            width: "100%", height: "100%",
            background: `radial-gradient(ellipse at 60% 40%, ${color}33 0%, #111827 70%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: isLarge ? 80 : 52, height: isLarge ? 80 : 52,
              borderRadius: "50%", background: color, opacity: 0.9,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isLarge ? 30 : 20, fontWeight: 600, color: "#fff",
            }}>
              {initials}
            </div>
          </div>
        )}
      </div>

      {/* Name tag */}
      <div style={{
        position: "absolute", bottom: 8, left: 8,
        background: "rgba(0,0,0,0.6)", borderRadius: 6,
        padding: "3px 8px", display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
          {isLocal ? "You" : name}
        </span>
        {muted && (
          <span style={{ fontSize: 11, color: "#f87171" }}>🔇</span>
        )}
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 10, height: 10, borderRadius: "50%",
          background: "#2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.3)",
        }} />
      )}
    </div>
  );
}

// ─── Control Button ───────────────────────────────────────────────────────────

function ControlBtn({
  icon, label, active, danger, onClick,
}: {
  icon: string; label: string; active?: boolean; danger?: boolean; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        background: danger ? (hover ? "#991b1b" : "#dc2626") : active ? "#374151" : hover ? "#374151" : "#1f2937",
        border: "none", borderRadius: 12, padding: "12px 16px",
        cursor: "pointer", transition: "background 0.15s", minWidth: 64,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function VideoCallPage() {
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [speakingId, setSpeakingId] = useState<number | null>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      // Simulate speaking indicator cycling
      speakerRef.current = setInterval(() => {
        setSpeakingId((prev) => {
          const ids = [1, 2, 3, null];
          const next = ids[(ids.indexOf(prev) + 1) % ids.length];
          return next;
        });
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speakerRef.current) clearInterval(speakerRef.current);
      setDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speakerRef.current) clearInterval(speakerRef.current);
    };
  }, [callActive]);

  const endCall = () => {
    setCallActive(false);
    setMuted(false);
    setVideoOff(false);
    setScreenSharing(false);
    setSpeakingId(null);
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>
            Video Call
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {callActive
              ? `Call in progress — ${formatDuration(duration)}`
              : "Start a call with investors or entrepreneurs"}
          </p>
        </div>

        {callActive && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "6px 14px",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
              Live · {formatDuration(duration)}
            </span>
          </div>
        )}
      </div>

      {/* Main call area */}
      <div style={{
        background: "#0f172a", borderRadius: 16,
        padding: "1.5rem", marginBottom: 16,
        border: "1px solid #1e293b",
      }}>
        {!callActive ? (
          /* Pre-call lobby */
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "3rem 0", gap: 16,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#185FA5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
            }}>
              👤
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#f9fafb", margin: 0 }}>Ready to join?</p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                3 participants waiting in the room
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {REMOTE_PARTICIPANTS.map((p) => (
                <div key={p.id} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: p.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 auto 4px",
                  }}>
                    {p.initials}
                  </div>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{p.name.split(" ")[0]}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCallActive(true)}
              style={{
                marginTop: 8, padding: "12px 40px", borderRadius: 10,
                background: "#2563eb", border: "none",
                color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}
            >
              📞 Join Call
            </button>
          </div>
        ) : (
          /* Active call grid */
          <div>
            {/* Main speaker */}
            <div style={{ marginBottom: 12 }}>
              <VideoTile
                name="Alex Mercer" initials="AM" color="#185FA5"
                muted={false} videoOff={false} isLarge isSpeaking={speakingId === 1}
              />
            </div>

            {/* Participant strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {REMOTE_PARTICIPANTS.slice(1).map((p) => (
                <VideoTile
                  key={p.id} name={p.name} initials={p.initials} color={p.color}
                  muted={p.muted} videoOff={p.videoOff} isSpeaking={speakingId === p.id}
                />
              ))}
              {/* Local tile */}
              <VideoTile
                name="You" initials="ME" color="#0F6E56"
                muted={muted} videoOff={videoOff} isLocal
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div style={{
        background: "#111827", borderRadius: 16, padding: "1rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        border: "1px solid #1e293b",
      }}>
        {callActive ? (
          <>
            <ControlBtn
              icon={muted ? "🔇" : "🎤"} label={muted ? "Unmute" : "Mute"}
              active={muted} onClick={() => setMuted((m) => !m)}
            />
            <ControlBtn
              icon={videoOff ? "📷" : "🎥"} label={videoOff ? "Start Video" : "Stop Video"}
              active={videoOff} onClick={() => setVideoOff((v) => !v)}
            />
            <ControlBtn
              icon="🖥️" label={screenSharing ? "Stop Share" : "Share Screen"}
              active={screenSharing} onClick={() => setScreenSharing((s) => !s)}
            />
            <ControlBtn
              icon="👥" label="Participants" onClick={() => {}}
            />
            <ControlBtn
              icon="💬" label="Chat" onClick={() => {}}
            />
            <ControlBtn
              icon="📞" label="End Call" danger onClick={endCall}
            />
          </>
        ) : (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Click "Join Call" to start your session
          </p>
        )}
      </div>

      {/* Participants sidebar info */}
      {callActive && (
        <div style={{
          marginTop: 16, display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        }}>
          {REMOTE_PARTICIPANTS.map((p) => (
            <div key={p.id} style={{
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 10, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: p.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0,
              }}>
                {p.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{p.role}</p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {p.muted && <span title="Muted" style={{ fontSize: 14 }}>🔇</span>}
                {p.videoOff && <span title="Camera off" style={{ fontSize: 14 }}>📷</span>}
                {speakingId === p.id && <span title="Speaking" style={{ fontSize: 14 }}>🗣️</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
