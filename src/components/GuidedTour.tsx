import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
  target: string;       // CSS selector of the element to highlight
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TooltipPos {
  top: number;
  left: number;
  arrowSide: "top" | "bottom" | "left" | "right";
}

// ─── Tour Steps (all Nexus features) ─────────────────────────────────────────

export const NEXUS_TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "🏠 Dashboard",
    content: "Your central hub. See wallet balance, upcoming meetings, and recent activity at a glance.",
    position: "right",
  },
  {
    target: "[data-tour='calendar']",
    title: "📅 Meeting Scheduler",
    content: "Set your availability, send and accept meeting requests, and track confirmed meetings with investors or entrepreneurs.",
    position: "right",
  },
  {
    target: "[data-tour='videocall']",
    title: "🎥 Video Call",
    content: "Join live video sessions with your connections. Toggle mute, camera, and screen sharing during calls.",
    position: "right",
  },
  {
    target: "[data-tour='documents']",
    title: "📄 Document Chamber",
    content: "Upload contracts and deals, track their status (Draft → In Review → Signed), and apply your e-signature.",
    position: "right",
  },
  {
    target: "[data-tour='payments']",
    title: "💳 Payments & Wallet",
    content: "Deposit, withdraw, or transfer funds. Fund deals directly from investor to entrepreneur with full transaction history.",
    position: "right",
  },
  {
    target: "[data-tour='security']",
    title: "🔒 Security",
    content: "Update your password with strength feedback, enable Two-Factor Authentication, and manage active sessions.",
    position: "right",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTooltipPosition(el: Element, position: TourStep["position"] = "right"): TooltipPos {
  const rect = el.getBoundingClientRect();
  const TW = 300, TH = 160, GAP = 14;

  switch (position) {
    case "right":
      return { top: rect.top + rect.height / 2 - TH / 2, left: rect.right + GAP, arrowSide: "left" };
    case "left":
      return { top: rect.top + rect.height / 2 - TH / 2, left: rect.left - TW - GAP, arrowSide: "right" };
    case "bottom":
      return { top: rect.bottom + GAP, left: rect.left + rect.width / 2 - TW / 2, arrowSide: "top" };
    case "top":
      return { top: rect.top - TH - GAP, left: rect.left + rect.width / 2 - TW / 2, arrowSide: "bottom" };
    default:
      return { top: rect.bottom + GAP, left: rect.left, arrowSide: "top" };
  }
}

// ─── Spotlight Overlay ────────────────────────────────────────────────────────

function SpotlightOverlay({ targetRect }: { targetRect: DOMRect | null }) {
  if (!targetRect) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999, pointerEvents: "none" }} />
  );

  const PAD = 6;
  const x = targetRect.left - PAD;
  const y = targetRect.top  - PAD;
  const w = targetRect.width  + PAD * 2;
  const h = targetRect.height + PAD * 2;

  return (
    <svg
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 999, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={8} fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#spotlight-mask)" />
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({
  step, stepIndex, totalSteps, pos,
  onPrev, onNext, onSkip,
}: {
  step: TourStep; stepIndex: number; totalSteps: number; pos: TooltipPos;
  onPrev: () => void; onNext: () => void; onSkip: () => void;
}) {
  const isLast = stepIndex === totalSteps - 1;

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: 0, height: 0,
    ...(pos.arrowSide === "left"   && { left: -8,  top: "50%", transform: "translateY(-50%)", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid #1e293b" }),
    ...(pos.arrowSide === "right"  && { right: -8, top: "50%", transform: "translateY(-50%)", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "8px solid #1e293b"  }),
    ...(pos.arrowSide === "top"    && { top: -8,   left: "50%", transform: "translateX(-50%)", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "8px solid #1e293b" }),
    ...(pos.arrowSide === "bottom" && { bottom: -8, left: "50%", transform: "translateX(-50%)", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #1e293b" }),
  };

  return (
    <div style={{
      position: "fixed",
      top: Math.max(8, Math.min(pos.top, window.innerHeight - 180)),
      left: Math.max(8, Math.min(pos.left, window.innerWidth - 316)),
      width: 300, zIndex: 1001,
      background: "#1e293b", borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      padding: "1rem",
      animation: "tourFadeIn 0.2s ease",
    }}>
      <style>{`@keyframes tourFadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>

      {/* Arrow */}
      <div style={arrowStyle} />

      {/* Step counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
          {stepIndex + 1} of {totalSteps}
        </span>
        <button onClick={onSkip} style={{
          background: "none", border: "none", color: "#64748b",
          cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0,
        }}>✕</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#334155", borderRadius: 999, marginBottom: 10 }}>
        <div style={{
          height: "100%", borderRadius: 999, background: "#3b82f6",
          width: `${((stepIndex + 1) / totalSteps) * 100}%`,
          transition: "width 0.3s ease",
        }} />
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>
        {step.title}
      </h3>
      <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 14px", lineHeight: 1.5 }}>
        {step.content}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {stepIndex > 0 && (
          <button onClick={onPrev} style={{
            flex: 1, padding: "7px", borderRadius: 8,
            border: "1px solid #334155", background: "transparent",
            color: "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>← Back</button>
        )}
        <button onClick={onNext} style={{
          flex: 2, padding: "7px", borderRadius: 8, border: "none",
          background: "#3b82f6", color: "#fff",
          cursor: "pointer", fontSize: 12, fontWeight: 600,
        }}>
          {isLast ? "🎉 Finish Tour" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── Tour Button (place this in your dashboard/navbar) ────────────────────────

export function TourLaunchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-tour="tour-launch"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        border: "1px solid #e5e7eb", background: "#fff",
        color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 600,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      🗺️ Take a Tour
    </button>
  );
}

// ─── Main Tour Component ──────────────────────────────────────────────────────

export function GuidedTour({
  steps = NEXUS_TOUR_STEPS,
  isOpen,
  onClose,
}: {
  steps?: TourStep[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect]   = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos]   = useState<TooltipPos>({ top: 200, left: 200, arrowSide: "left" });
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      setTooltipPos(getTooltipPosition(el, step.position));
      // Scroll element into view if needed
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setTargetRect(null);
      setTooltipPos({ top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - 150, arrowSide: "top" });
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!isOpen) return;
    // Small delay to let any navigation settle
    const t = setTimeout(() => {
      updatePosition();
      rafRef.current = requestAnimationFrame(updatePosition);
    }, 100);
    window.addEventListener("resize", updatePosition);
    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, currentStep, updatePosition]);

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else { setCurrentStep(0); onClose(); }
  }

  function prev() { if (currentStep > 0) setCurrentStep((s) => s - 1); }

  function skip() { setCurrentStep(0); onClose(); }

  if (!isOpen) return null;

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />
      <Tooltip
        step={steps[currentStep]}
        stepIndex={currentStep}
        totalSteps={steps.length}
        pos={tooltipPos}
        onPrev={prev}
        onNext={next}
        onSkip={skip}
      />
    </>
  );
}

// ─── Hook for easy use ────────────────────────────────────────────────────────

export function useGuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    startTour: () => setIsOpen(true),
    endTour:   () => setIsOpen(false),
  };
}
