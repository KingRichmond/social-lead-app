// src/components/LeadCard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import StatusBadge from "./StatusBadge";

const PLATFORM_ICONS = {
  instagram: "📸", twitter: "🐦", tiktok: "🎵",
  linkedin: "💼", facebook: "📘", other: "🔗",
};
const PLATFORM_COLORS = {
  instagram: "#fb923c", twitter: "#38bdf8", tiktok: "#f472b6",
  linkedin: "#60a5fa", facebook: "#818cf8", other: "#a8a49e",
};
const STATUSES = ["new", "contacted", "converted", "lost"];
const STATUS_META = {
  new:       { icon: "✨", color: "#c2410c" },
  contacted: { icon: "💬", color: "#92400e" },
  converted: { icon: "🎯", color: "#166534" },
  lost:      { icon: "📉", color: "#991b1b" },
};

export default function LeadCard({ lead, index = 0 }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);
  const color = PLATFORM_COLORS[lead.platform] || "#a8a49e";

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  async function handleStatusChange(newStatus) {
    if (newStatus === currentStatus) { setDropdownOpen(false); return; }
    setUpdating(true);
    setCurrentStatus(newStatus);
    setDropdownOpen(false);
    try {
      await updateDoc(doc(db, "leads", lead.id), { status: newStatus });
    } catch (err) {
      console.error("Status update failed:", err);
      setCurrentStatus(lead.status);
    }
    setUpdating(false);
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dropdownIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .lc-status-btn {
          background: none; border: none; padding: 0;
          cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 4px;
          border-radius: 999px; transition: opacity 0.15s;
        }
        .lc-status-btn:hover { opacity: 0.8; }
        .lc-status-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .lc-chevron { font-size: 0.6rem; color: #a8a49e; margin-left: 2px; transition: transform 0.15s; }
        .lc-chevron.open { transform: rotate(180deg); }
        .lc-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #fff; border: 1px solid #ede9e3;
          border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 100; min-width: 150px; overflow: hidden;
          animation: dropdownIn 0.15s ease;
        }
        .lc-dropdown-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 0.85rem; cursor: pointer;
          font-size: 0.82rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.1s; border: none;
          background: none; width: 100%; text-align: left;
          text-transform: capitalize;
        }
        .lc-dropdown-item:hover { background: #faf9f7; }
        .lc-dropdown-item.active { background: #fff7f3; }
        .lc-dropdown-divider { height: 1px; background: #f3f0eb; margin: 0; }
        .lc-dropdown-label {
          font-size: 0.65rem; font-weight: 700; color: #c4bfb9;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 0.5rem 0.85rem 0.25rem;
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 640px) {
          .lc-grid { grid-template-columns: 1fr 1fr !important; }
          .lc-platform-col { display: none; }
          .lc-followup-col { display: none; }
        }
      `}</style>

      <div
        onClick={() => navigate("/lead/" + lead.id)}
        style={{
          background: "#fff", border: "1px solid #ede9e3",
          borderLeft: "3px solid " + color, borderRadius: "12px",
          padding: "1rem 1.25rem", cursor: "pointer",
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
          alignItems: "center", gap: "1rem",
          transition: "box-shadow 0.15s, transform 0.15s",
          animation: "fadeSlideIn 0.3s ease both",
          animationDelay: (index * 0.05) + "s",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
        }}
        className="lc-grid"
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
          e.currentTarget.style.transform = "translateX(3px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Name + handle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: color + "18", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
          }}>
            {PLATFORM_ICONS[lead.platform] || "🔗"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1916" }}>{lead.name}</div>
            {lead.handle && <div style={{ fontSize: "0.78rem", color: "#a8a49e" }}>{lead.handle}</div>}
          </div>
        </div>

        {/* Platform */}
        <div className="lc-platform-col" style={{ fontSize: "0.82rem", color: "#6b6860", textTransform: "capitalize" }}>
          {lead.platform}
        </div>

        {/* Follow-up */}
        <div className="lc-followup-col" style={{ fontSize: "0.82rem", color: lead.followUpDate ? "#6b6860" : "#c4bfb9" }}>
          {lead.followUpDate ? "📅 " + lead.followUpDate : "—"}
        </div>

        {/* Status dropdown */}
        <div
          style={{ position: "relative" }}
          ref={dropdownRef}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="lc-status-btn"
            disabled={updating}
            onClick={() => setDropdownOpen(o => !o)}
            title="Change status"
          >
            <StatusBadge status={currentStatus} />
            <span className={"lc-chevron" + (dropdownOpen ? " open" : "")}>▼</span>
          </button>

          {dropdownOpen && (
            <div className="lc-dropdown">
              <div className="lc-dropdown-label">Change status</div>
              {STATUSES.map((s, i) => (
                <div key={s}>
                  <button
                    className={"lc-dropdown-item" + (s === currentStatus ? " active" : "")}
                    style={{ color: STATUS_META[s]?.color || "#6b6860" }}
                    onClick={() => handleStatusChange(s)}
                  >
                    <span>{STATUS_META[s]?.icon}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === currentStatus && (
                      <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#fb923c" }}>✓</span>
                    )}
                  </button>
                  {i < STATUSES.length - 1 && <div className="lc-dropdown-divider" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}