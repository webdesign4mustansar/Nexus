import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType   = "Deposit" | "Withdraw" | "Transfer";
type TxStatus = "Completed" | "Pending" | "Failed";

interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  status: TxStatus;
  date: string;
  note: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_TXN: Transaction[] = [
  { id: 1, type: "Deposit",  amount: 50000, sender: "Bank Account",  receiver: "Your Wallet",  status: "Completed", date: "May 20, 2026", note: "Initial funding"         },
  { id: 2, type: "Transfer", amount: 15000, sender: "Your Wallet",   receiver: "Sara Kim",     status: "Completed", date: "May 21, 2026", note: "Seed investment round"  },
  { id: 3, type: "Transfer", amount: 8000,  sender: "Alex Mercer",   receiver: "Your Wallet",  status: "Completed", date: "May 22, 2026", note: "Deal: NexaApp funding"  },
  { id: 4, type: "Withdraw", amount: 3000,  sender: "Your Wallet",   receiver: "Bank Account", status: "Pending",   date: "May 23, 2026", note: "Monthly withdrawal"     },
  { id: 5, type: "Transfer", amount: 20000, sender: "Tom Bridges",   receiver: "Your Wallet",  status: "Completed", date: "May 23, 2026", note: "Series A contribution"  },
  { id: 6, type: "Deposit",  amount: 10000, sender: "Bank Account",  receiver: "Your Wallet",  status: "Failed",    date: "May 22, 2026", note: "Insufficient funds"     },
];

const CONTACTS = ["Sara Kim", "Alex Mercer", "Tom Bridges", "Investor Pool", "Entrepreneur Fund"];

// ─── Style Helpers ────────────────────────────────────────────────────────────

const TX_COLOR: Record<TxType, string>   = { Deposit: "#166534",  Withdraw: "#991b1b", Transfer: "#1d4ed8" };
const TX_BG: Record<TxType, string>      = { Deposit: "#f0fdf4",  Withdraw: "#fef2f2", Transfer: "#eff6ff" };
const TX_BORDER: Record<TxType, string>  = { Deposit: "#bbf7d0",  Withdraw: "#fecaca", Transfer: "#bfdbfe" };
const TX_ICON: Record<TxType, string>    = { Deposit: "⬇️",       Withdraw: "⬆️",       Transfer: "↔️"      };

const ST_COLOR: Record<TxStatus, string> = { Completed: "#166534", Pending: "#92400e", Failed: "#991b1b" };
const ST_BG: Record<TxStatus, string>    = { Completed: "#f0fdf4", Pending: "#fef3c7", Failed: "#fef2f2" };
const ST_BORDER: Record<TxStatus, string>= { Completed: "#bbf7d0", Pending: "#fde68a", Failed: "#fecaca" };

function currency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
      padding: "1rem 1.25rem",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: accent ?? "#111827", margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ActionModal({
  type, onClose, onConfirm,
}: { type: TxType; onClose: () => void; onConfirm: (amount: number, to: string, note: string) => void }) {
  const [amount, setAmount] = useState("");
  const [to, setTo]         = useState(CONTACTS[0]);
  const [note, setNote]     = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: 13, padding: "8px 12px",
    border: "1px solid #e5e7eb", borderRadius: 8,
    background: "#f9fafb", color: "#111827",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "1.5rem",
        width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
            {TX_ICON[type]} {type} Funds
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Amount (USD)</label>
            <input
              type="number" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value)} style={inputStyle}
            />
          </div>

          {type === "Transfer" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Send To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle}>
                {CONTACTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Note (optional)</label>
            <input
              type="text" placeholder="Add a note..." value={note}
              onChange={(e) => setNote(e.target.value)} style={inputStyle}
            />
          </div>

          <div style={{
            background: TX_BG[type], border: `1px solid ${TX_BORDER[type]}`,
            borderRadius: 8, padding: "10px 12px", fontSize: 12, color: TX_COLOR[type],
          }}>
            {type === "Deposit"  && "💡 Funds will be added to your wallet from your linked bank account."}
            {type === "Withdraw" && "💡 Funds will be transferred to your linked bank account within 1-2 business days."}
            {type === "Transfer" && "💡 This is a simulated transfer for demo purposes only."}
          </div>

          <button
            onClick={() => {
              const amt = parseFloat(amount);
              if (!amt || amt <= 0) return;
              onConfirm(amt, type === "Transfer" ? to : type === "Deposit" ? "Bank Account" : "Bank Account", note || type);
            }}
            style={{
              padding: "10px", borderRadius: 8, border: "none",
              background: TX_COLOR[type], color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Confirm {type}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Funding Flow ────────────────────────────────────────────────────────

function FundingDeal({ onFund }: { onFund: (amount: number) => void }) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("25000");

  const steps = ["Select Deal", "Set Amount", "Confirm", "Done"];

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 1rem" }}>
        🤝 Fund a Deal  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>Investor → Entrepreneur</span>
      </h2>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.25rem", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: i < step ? "#2563eb" : i === step ? "#2563eb" : "#f3f4f6",
              color: i <= step ? "#fff" : "#9ca3af",
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 11, color: i <= step ? "#2563eb" : "#9ca3af", marginLeft: 6, fontWeight: 500, whiteSpace: "nowrap" }}>{s}</span>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < step ? "#2563eb" : "#e5e7eb", margin: "0 8px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "Sara Kim — NexaApp", target: "$50,000", raised: 68 },
            { name: "Tom Bridges — GreenGrid", target: "$80,000", raised: 35 },
          ].map((deal) => (
            <div key={deal.name} onClick={() => setStep(1)} style={{
              border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "background 0.1s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{deal.name}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 6px" }}>Target: {deal.target}</p>
                <div style={{ width: 180, height: 4, background: "#e5e7eb", borderRadius: 999 }}>
                  <div style={{ width: `${deal.raised}%`, height: "100%", background: "#2563eb", borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 10, color: "#6b7280", margin: "3px 0 0" }}>{deal.raised}% funded</p>
              </div>
              <span style={{ fontSize: 18, color: "#9ca3af" }}>›</span>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>How much do you want to invest?</p>
          <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "8px 12px", background: "#f9fafb", color: "#374151", fontSize: 14, fontWeight: 600, borderRight: "1px solid #e5e7eb" }}>$</span>
            <input
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, border: "none", padding: "8px 12px", fontSize: 14, color: "#111827", background: "#fff", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["5000", "10000", "25000", "50000"].map((q) => (
              <button key={q} onClick={() => setAmount(q)} style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 6,
                border: "1px solid #e5e7eb", background: amount === q ? "#eff6ff" : "#f9fafb",
                color: amount === q ? "#1d4ed8" : "#374151", cursor: "pointer",
              }}>${(parseInt(q)/1000).toFixed(0)}k</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => setStep(0)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 13 }}>Back</button>
            <button onClick={() => setStep(2)} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Investment amount</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{currency(parseFloat(amount) || 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Platform fee (1%)</span>
              <span style={{ fontSize: 13, color: "#111827" }}>{currency((parseFloat(amount) || 0) * 0.01)}</span>
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Total deducted</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>{currency((parseFloat(amount) || 0) * 1.01)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 13 }}>Back</button>
            <button onClick={() => { onFund(parseFloat(amount) || 0); setStep(3); }} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#166534", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✓ Confirm Investment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>Investment Successful!</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>{currency(parseFloat(amount) || 0)} sent to Sara Kim</p>
          <button onClick={() => { setStep(0); setAmount("25000"); }} style={{
            padding: "8px 24px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 13,
          }}>Fund Another Deal</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PaymentPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TXN);
  const [modal, setModal]               = useState<TxType | null>(null);
  const [balance, setBalance]           = useState(65000);
  const [filterType, setFilterType]     = useState<TxType | "All">("All");

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  function addTransaction(type: TxType, amount: number, to: string, note: string) {
    const newTx: Transaction = {
      id: Date.now(), type, amount, note,
      sender:   type === "Deposit" ? "Bank Account" : "Your Wallet",
      receiver: type === "Withdraw" ? "Bank Account" : to,
      status: "Completed",
      date: today,
    };
    setTransactions((t) => [newTx, ...t]);
    if (type === "Deposit")   setBalance((b) => b + amount);
    if (type === "Withdraw")  setBalance((b) => b - amount);
    if (type === "Transfer")  setBalance((b) => b - amount);
    setModal(null);
  }

  function fundDeal(amount: number) {
    addTransaction("Transfer", amount, "Sara Kim", "Deal funding");
  }

  const totalIn  = transactions.filter((t) => t.type === "Deposit"  && t.status === "Completed").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type !== "Deposit"  && t.status === "Completed").reduce((s, t) => s + t.amount, 0);
  const filtered = filterType === "All" ? transactions : transactions.filter((t) => t.type === filterType);

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1050, margin: "0 auto" }}>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 1.25rem" }}>
        Payments & Wallet
      </h1>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <StatCard label="Wallet Balance" value={currency(balance)} sub="Available funds" accent="#2563eb" />
        <StatCard label="Total Received" value={currency(totalIn)}  sub="All time deposits & transfers" accent="#166534" />
        <StatCard label="Total Sent"     value={currency(totalOut)} sub="All time withdrawals & transfers" accent="#991b1b" />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        {(["Deposit", "Withdraw", "Transfer"] as TxType[]).map((t) => (
          <button key={t} onClick={() => setModal(t)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: TX_COLOR[t], color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {TX_ICON[t]} {t}
          </button>
        ))}
      </div>

      {/* Deal funding flow */}
      <FundingDeal onFund={fundDeal} />

      {/* Transaction history */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Transaction History</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["All", "Deposit", "Withdraw", "Transfer"] as const).map((f) => (
              <button key={f} onClick={() => setFilterType(f)} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
                background: filterType === f ? "#2563eb" : "#f9fafb",
                border: filterType === f ? "none" : "1px solid #e5e7eb",
                color: filterType === f ? "#fff" : "#374151",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 2fr 1.5fr 1.5fr 90px 100px",
          padding: "8px 16px", background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          <span>Type</span><span>Note</span><span>Sender</span><span>Receiver</span><span style={{ textAlign: "right" }}>Amount</span><span style={{ textAlign: "right" }}>Status</span>
        </div>

        {filtered.map((tx, i) => (
          <div key={tx.id} style={{
            display: "grid", gridTemplateColumns: "100px 2fr 1.5fr 1.5fr 90px 100px",
            padding: "12px 16px", alignItems: "center",
            borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
              background: TX_BG[tx.type], color: TX_COLOR[tx.type], border: `1px solid ${TX_BORDER[tx.type]}`,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {TX_ICON[tx.type]} {tx.type}
            </span>
            <div>
              <p style={{ fontSize: 13, color: "#111827", margin: 0 }}>{tx.note}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{tx.date}</p>
            </div>
            <span style={{ fontSize: 12, color: "#374151" }}>{tx.sender}</span>
            <span style={{ fontSize: 12, color: "#374151" }}>{tx.receiver}</span>
            <span style={{
              fontSize: 13, fontWeight: 700, textAlign: "right",
              color: tx.type === "Deposit" ? "#166534" : "#991b1b",
            }}>
              {tx.type === "Deposit" ? "+" : "-"}{currency(tx.amount)}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
              background: ST_BG[tx.status], color: ST_COLOR[tx.status],
              border: `1px solid ${ST_BORDER[tx.status]}`,
              textAlign: "right", justifySelf: "end",
            }}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <ActionModal
          type={modal}
          onClose={() => setModal(null)}
          onConfirm={(amount, to, note) => addTransaction(modal, amount, to, note)}
        />
      )}
    </div>
  );
}
