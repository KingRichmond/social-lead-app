// src/components/LeadChatPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLeadChat } from "../hooks/useLeadChat";
import StatusBadge from "./StatusBadge";

const PLATFORM_ICONS = {
  instagram: "📸", twitter: "🐦", tiktok: "🎵",
  linkedin: "💼", facebook: "📘", other: "🔗",
};
const PLATFORM_COLORS = {
  instagram: "#fb923c", twitter: "#38bdf8", tiktok: "#f472b6",
  linkedin: "#60a5fa", facebook: "#818cf8", other: "#a8a49e",
};
const QUICK_PROMPTS = [
  "Write an opening outreach message",
  "Suggest a follow-up they have not replied to",
  "What is the best next step?",
  "Write a re-engagement message",
];
const STATUS_COLORS = {
  new:       { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  contacted: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  converted: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  lost:      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};
const STATUSES = ["new", "contacted", "converted", "lost"];
const STATUS_META = {
  new:       { icon: "✨" },
  contacted: { icon: "💬" },
  converted: { icon: "🎯" },
  lost:      { icon: "📉" },
};

const STYLES = `
  @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn   { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes bounce    { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  * { box-sizing: border-box; }

  .lcp-root {
    display: flex; flex-direction: column; height: 100vh;
    background: #faf9f7; font-family: 'DM Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .lcp-nav {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1.5rem; background: #fff;
    border-bottom: 1px solid #ede9e3; flex-shrink: 0; z-index: 20;
  }
  .lcp-back-btn {
    display: flex; align-items: center; gap: 6px;
    background: #faf9f7; border: 1px solid #ede9e3; border-radius: 8px;
    padding: 0.4rem 0.75rem; font-size: 0.78rem; font-weight: 600;
    color: #6b6860; cursor: pointer; font-family: inherit;
    transition: all 0.15s; flex-shrink: 0;
  }
  .lcp-back-btn:hover { border-color: #fb923c; color: #fb923c; background: #fff7f3; }
  .lcp-nav-lead { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
  .lcp-nav-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .lcp-nav-name { font-size: 0.9rem; font-weight: 700; color: #1a1916; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lcp-nav-sub  { font-size: 0.73rem; color: #a8a49e; }
  .lcp-info-btn {
    display: flex; align-items: center; gap: 5px;
    background: #faf9f7; border: 1px solid #ede9e3; border-radius: 8px;
    padding: 0.4rem 0.75rem; font-size: 0.78rem; font-weight: 600;
    color: #6b6860; cursor: pointer; font-family: inherit; flex-shrink: 0;
    transition: all 0.15s;
  }
  .lcp-info-btn:hover { border-color: #fb923c; color: #fb923c; background: #fff7f3; }
  .lcp-nav-ai { font-size: 0.7rem; color: #c4bfb9; flex-shrink: 0; display: flex; align-items: center; gap: 4px; }
  .lcp-nav-ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }

  /* Drawer */
  .lcp-drawer-overlay {
    position: fixed; inset: 0; background: rgba(26,25,22,0.45);
    z-index: 50; animation: overlayIn 0.2s ease; backdrop-filter: blur(2px);
  }
  .lcp-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 300px;
    background: #fff; border-left: 1px solid #ede9e3;
    z-index: 51; display: flex; flex-direction: column;
    animation: slideIn 0.25s ease; box-shadow: -8px 0 32px rgba(0,0,0,0.08);
  }
  .lcp-drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem; border-bottom: 1px solid #ede9e3; flex-shrink: 0;
  }
  .lcp-drawer-title { font-size: 0.85rem; font-weight: 700; color: #1a1916; }
  .lcp-drawer-close {
    background: #faf9f7; border: 1px solid #ede9e3; border-radius: 7px;
    width: 28px; height: 28px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; font-size: 0.85rem; color: #a8a49e;
    transition: all 0.15s;
  }
  .lcp-drawer-close:hover { border-color: #fb923c; color: #fb923c; }
  .lcp-drawer-body {
    flex: 1; overflow-y: auto; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }
  .lcp-drawer-avatar-block {
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    padding: 1rem; background: #faf9f7; border-radius: 12px; border: 1px solid #ede9e3;
  }
  .lcp-drawer-platform-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  }
  .lcp-drawer-lead-name { font-size: 1rem; font-weight: 700; color: #1a1916; text-align: center; }
  .lcp-drawer-lead-handle { font-size: 0.78rem; color: #a8a49e; }
  .lcp-info-row { display: flex; flex-direction: column; gap: 4px; }
  .lcp-info-label { font-size: 0.67rem; font-weight: 700; color: #c4bfb9; text-transform: uppercase; letter-spacing: 0.08em; }
  .lcp-info-value { font-size: 0.85rem; color: #1a1916; font-weight: 500; }
  .lcp-info-notes {
    font-size: 0.82rem; color: #6b6860; line-height: 1.6;
    background: #faf9f7; border: 1px solid #ede9e3; border-radius: 8px; padding: 0.6rem 0.75rem;
  }
  .lcp-status-pill {
    display: inline-flex; align-items: center; padding: 0.25rem 0.65rem;
    border-radius: 20px; font-size: 0.75rem; font-weight: 700; width: fit-content;
  }
  .lcp-drawer-divider { height: 1px; background: #ede9e3; margin: 0.25rem 0; }

  /* Status selector in drawer */
  .lcp-status-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;
  }
  .lcp-status-option {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.5rem 0.65rem; border-radius: 8px;
    border: 1.5px solid #ede9e3; background: #fff;
    cursor: pointer; font-size: 0.75rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif; text-transform: capitalize;
    transition: all 0.15s; color: #6b6860;
  }
  .lcp-status-option:hover { border-color: #fb923c; background: #fff7f3; color: #fb923c; }
  .lcp-status-option.active { border-color: transparent; color: #fff; }
  .lcp-status-option:disabled { opacity: 0.5; cursor: not-allowed; }
  .lcp-status-updating { font-size: 0.72rem; color: #fb923c; text-align: center; font-family: 'DM Sans', sans-serif; }

  /* Bot header */
  .lcp-bot-header {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    padding: 1rem 1.5rem; display: flex; align-items: center;
    gap: 1rem; flex-shrink: 0;
  }
  .lcp-bot-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .lcp-bot-name   { font-size: 0.9rem; font-weight: 700; color: #fff; }
  .lcp-bot-status { font-size: 0.72rem; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 5px; margin-top: 2px; }
  .lcp-bot-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #bbf7d0; animation: pulse 2s infinite; }
  .lcp-bot-meta { margin-left: auto; text-align: right; }
  .lcp-bot-meta-label { font-size: 0.67rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.06em; }
  .lcp-bot-meta-val   { font-size: 0.78rem; color: rgba(255,255,255,0.9); font-weight: 600; margin-top: 2px; }

  /* Messages */
  .lcp-messages {
    flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem;
    display: flex; flex-direction: column; gap: 1rem; background: #faf9f7;
  }
  .lcp-messages::-webkit-scrollbar { width: 4px; }
  .lcp-messages::-webkit-scrollbar-track { background: transparent; }
  .lcp-messages::-webkit-scrollbar-thumb { background: #e5e0d9; border-radius: 99px; }
  .lcp-divider { display: flex; align-items: center; gap: 0.75rem; font-size: 0.7rem; color: #c4bfb9; text-transform: uppercase; letter-spacing: 0.08em; margin: 0.25rem 0; }
  .lcp-divider-line { flex: 1; height: 1px; background: #ede9e3; }
  .lcp-row { display: flex; gap: 0.6rem; align-items: flex-end; animation: fadeUp 0.25s ease both; }
  .lcp-row-user { flex-direction: row-reverse; }
  .lcp-row-bot  { flex-direction: row; }
  .lcp-msg-avatar {
    width: 30px; height: 30px; border-radius: 9px;
    background: linear-gradient(135deg, #fb923c, #f97316);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(251,146,60,0.3);
  }
  .lcp-msg-avatar-spacer { width: 30px; flex-shrink: 0; }
  .lcp-bubble-wrap { display: flex; flex-direction: column; max-width: 70%; }
  .lcp-sender-label { font-size: 0.68rem; color: #c4bfb9; margin-bottom: 3px; font-weight: 600; letter-spacing: 0.04em; }
  .lcp-row-user .lcp-sender-label { text-align: right; }
  .lcp-bubble { padding: 0.75rem 1rem; border-radius: 18px; font-size: 0.875rem; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
  .lcp-bubble-bot  { background: #fff; border: 1px solid #ede9e3; color: #1a1916; border-bottom-left-radius: 5px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .lcp-bubble-user { background: #fb923c; color: #fff; border-bottom-right-radius: 5px; box-shadow: 0 2px 8px rgba(251,146,60,0.25); }
  .lcp-copy-btn { margin-top: 5px; align-self: flex-start; background: none; border: none; padding: 0; font-size: 0.7rem; color: #c4bfb9; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 3px; transition: color 0.15s; }
  .lcp-copy-btn:hover { color: #fb923c; }
  .lcp-copy-btn.copied { color: #4ade80; }
  .lcp-typing-bubble { background: #fff; border: 1px solid #ede9e3; border-radius: 18px; border-bottom-left-radius: 5px; padding: 0.75rem 1rem; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .lcp-dot { width: 7px; height: 7px; border-radius: 50%; background: #d6d0c9; animation: bounce 1.2s infinite; }
  .lcp-dot:nth-child(2) { animation-delay: 0.15s; }
  .lcp-dot:nth-child(3) { animation-delay: 0.3s; }
  .lcp-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; padding: 2rem; color: #c4bfb9; }
  .lcp-empty-icon { width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #fb923c, #f97316); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 0.5rem; box-shadow: 0 8px 24px rgba(251,146,60,0.25); }
  .lcp-empty-title { font-size: 0.95rem; font-weight: 700; color: #6b6860; }
  .lcp-empty-sub   { font-size: 0.8rem; color: #c4bfb9; max-width: 260px; line-height: 1.5; }
  .lcp-error { font-size: 0.78rem; color: #dc2626; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; padding: 0.6rem 1rem; text-align: center; }

  /* Client reply */
  .lcp-client-reply-section { padding: 0.75rem 1.5rem; background: #fff7f3; border-top: 1px solid #fed7aa; flex-shrink: 0; }
  .lcp-client-reply-label { font-size: 0.67rem; font-weight: 700; color: #c2410c; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 5px; }
  .lcp-client-reply-row { display: flex; gap: 0.5rem; align-items: flex-end; }
  .lcp-client-textarea { flex: 1; padding: 0.6rem 0.875rem; background: #fff; border: 1.5px solid #fed7aa; border-radius: 12px; font-family: inherit; font-size: 0.82rem; color: #1a1916; resize: none; outline: none; line-height: 1.5; transition: border-color 0.2s; overflow: hidden; }
  .lcp-client-textarea::placeholder { color: #fba96a; }
  .lcp-client-textarea:focus { border-color: #fb923c; }
  .lcp-suggest-btn { padding: 0.6rem 0.9rem; background: #fb923c; color: #fff; border: none; border-radius: 10px; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; flex-shrink: 0; transition: background 0.15s; white-space: nowrap; }
  .lcp-suggest-btn:hover:not(:disabled) { background: #f97316; }
  .lcp-suggest-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Quick prompts */
  .lcp-quick { padding: 0.65rem 1.5rem; display: flex; gap: 0.4rem; flex-wrap: wrap; border-top: 1px solid #ede9e3; background: #fff; flex-shrink: 0; }
  .lcp-quick-label { width: 100%; font-size: 0.67rem; font-weight: 700; color: #c4bfb9; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
  .lcp-qp-btn { padding: 0.35rem 0.85rem; background: #faf9f7; border: 1px solid #ede9e3; border-radius: 20px; font-size: 0.76rem; color: #6b6860; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
  .lcp-qp-btn:hover { background: #fff7f3; border-color: #fb923c; color: #fb923c; }

  /* Input */
  .lcp-input-wrap { padding: 0.85rem 1.5rem; background: #fff; border-top: 1px solid #ede9e3; display: flex; align-items: flex-end; gap: 0.65rem; flex-shrink: 0; }
  .lcp-textarea { flex: 1; padding: 0.7rem 1rem; background: #faf9f7; border: 1.5px solid #ede9e3; border-radius: 14px; font-family: inherit; font-size: 0.875rem; color: #1a1916; resize: none; outline: none; line-height: 1.5; transition: border-color 0.2s; overflow: hidden; }
  .lcp-textarea::placeholder { color: #c4bfb9; }
  .lcp-textarea:focus { border-color: #fb923c; background: #fff; }
  .lcp-send-btn { width: 42px; height: 42px; border-radius: 12px; background: #fb923c; border: none; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; flex-shrink: 0; transition: background 0.15s, transform 0.1s; box-shadow: 0 2px 8px rgba(251,146,60,0.3); }
  .lcp-send-btn:hover:not(:disabled) { background: #f97316; transform: scale(1.05); }
  .lcp-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .lcp-input-hint { font-size: 0.67rem; color: #c4bfb9; text-align: center; padding: 0 1.5rem 0.6rem; background: #fff; flex-shrink: 0; }

  @media (max-width: 640px) {
    .lcp-drawer { width: 85vw; }
    .lcp-bubble-wrap { max-width: 85%; }
    .lcp-bot-meta { display: none; }
    .lcp-status-grid { grid-template-columns: 1fr 1fr; }
  }
`;

const STATUS_BG = {
  new:       "#f59e0b",
  contacted: "#60a5fa",
  converted: "#4ade80",
  lost:      "#f87171",
};

export default function LeadChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [input, setInput] = useState("");
  const [clientReply, setClientReply] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const clientReplyRef = useRef(null);

  useEffect(() => {
    getDoc(doc(db, "leads", id)).then(snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setLead(data);
        setCurrentStatus(data.status);
      }
      setLeadLoading(false);
    });
  }, [id]);

  const { messages, loading, aiLoading, error, sendMessage } =
    useLeadChat(lead || { id, name: "", platform: "other", handle: "", status: "new", notes: "", followUpDate: "" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  useEffect(() => {
    const ta = clientReplyRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  }, [clientReply]);

  async function handleStatusChange(newStatus) {
    if (newStatus === currentStatus || statusUpdating) return;
    setStatusUpdating(true);
    setCurrentStatus(newStatus); // optimistic
    try {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
      setLead(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Status update failed:", err);
      setCurrentStatus(lead.status); // revert
    }
    setStatusUpdating(false);
  }

  async function handleSend() {
    if (!input.trim() || aiLoading) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }

  async function handleClientReply() {
    if (!clientReply.trim() || aiLoading) return;
    const reply = clientReply.trim();
    setClientReply("");
    await sendMessage(
      `The lead just replied to me with this message:\n\n"${reply}"\n\nBased on their reply, suggest the best response I should send them.`
    );
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }
  function handleClientReplyKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleClientReply(); }
  }

  async function handleCopy(msgId, content) {
    await navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleQuickPrompt(p) {
    setInput(p);
    textareaRef.current?.focus();
  }

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }

  if (leadLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#faf9f7", fontFamily: "'DM Sans', sans-serif", color: "#a8a49e" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>◌</div>
        Loading lead...
      </div>
    </div>
  );

  if (!lead) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#faf9f7", fontFamily: "'DM Sans', sans-serif", color: "#a8a49e", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontSize: "2rem" }}>📭</div>
      <p>Lead not found.</p>
      <button onClick={handleBack} style={{ color: "#fb923c", background: "none", border: "1px solid #fb923c", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Go Back</button>
    </div>
  );

  const platformColor = PLATFORM_COLORS[lead.platform] || "#a8a49e";
  const platformIcon  = PLATFORM_ICONS[lead.platform]  || "🔗";
  const statusStyle   = STATUS_COLORS[currentStatus]   || STATUS_COLORS.new;

  return (
    <>
      <style>{STYLES}</style>
      <div className="lcp-root">

        {/* ── Lead info drawer ── */}
        {drawerOpen && (
          <>
            <div className="lcp-drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <div className="lcp-drawer">
              <div className="lcp-drawer-header">
                <span className="lcp-drawer-title">Lead Details</span>
                <button className="lcp-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
              </div>
              <div className="lcp-drawer-body">

                {/* Avatar block */}
                <div className="lcp-drawer-avatar-block">
                  <div className="lcp-drawer-platform-icon" style={{ background: platformColor + "18" }}>
                    {platformIcon}
                  </div>
                  <div className="lcp-drawer-lead-name">{lead.name}</div>
                  {lead.handle && <div className="lcp-drawer-lead-handle">{lead.handle}</div>}
                  <div className="lcp-status-pill" style={{ background: statusStyle.bg, color: statusStyle.color, border: "1px solid " + statusStyle.border }}>
                    {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : "New"}
                  </div>
                </div>

                <div className="lcp-drawer-divider" />

                {/* Info rows */}
                <div className="lcp-info-row">
                  <div className="lcp-info-label">Platform</div>
                  <div className="lcp-info-value" style={{ textTransform: "capitalize" }}>{platformIcon} {lead.platform}</div>
                </div>
                {lead.handle && (
                  <div className="lcp-info-row">
                    <div className="lcp-info-label">Handle</div>
                    <div className="lcp-info-value">{lead.handle}</div>
                  </div>
                )}
                <div className="lcp-info-row">
                  <div className="lcp-info-label">Follow-up Date</div>
                  <div className="lcp-info-value">{lead.followUpDate ? "📅 " + lead.followUpDate : "—"}</div>
                </div>

                <div className="lcp-drawer-divider" />

                {/* ── Editable status ── */}
                <div className="lcp-info-row">
                  <div className="lcp-info-label" style={{ marginBottom: "0.5rem" }}>
                    Change Status {statusUpdating && <span style={{ color: "#fb923c", fontWeight: 400 }}>· saving…</span>}
                  </div>
                  <div className="lcp-status-grid">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        className={"lcp-status-option" + (currentStatus === s ? " active" : "")}
                        style={currentStatus === s ? { background: STATUS_BG[s] } : {}}
                        disabled={statusUpdating}
                        onClick={() => handleStatusChange(s)}
                      >
                        <span>{STATUS_META[s].icon}</span>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lcp-drawer-divider" />

                {/* Notes */}
                <div className="lcp-info-row">
                  <div className="lcp-info-label">Notes</div>
                  {lead.notes
                    ? <div className="lcp-info-notes">{lead.notes}</div>
                    : <div className="lcp-info-value" style={{ color: "#c4bfb9" }}>No notes added</div>
                  }
                </div>

              </div>
            </div>
          </>
        )}

        {/* ── Top nav ── */}
        <div className="lcp-nav">
          <button className="lcp-back-btn" onClick={handleBack}>← Back</button>
          <div className="lcp-nav-lead">
            <div className="lcp-nav-icon" style={{ background: platformColor + "18" }}>{platformIcon}</div>
            <div style={{ minWidth: 0 }}>
              <div className="lcp-nav-name">{lead.name}</div>
              <div className="lcp-nav-sub">{lead.handle ? lead.handle + " · " : ""}{lead.platform}</div>
            </div>
          </div>
          <StatusBadge status={currentStatus} />
          <button className="lcp-info-btn" onClick={() => setDrawerOpen(true)}>👤 Lead Info</button>
          <div className="lcp-nav-ai">
            <div className="lcp-nav-ai-dot" />
            AI active
          </div>
        </div>

        {/* ── Bot header ── */}
        <div className="lcp-bot-header">
          <div className="lcp-bot-avatar">🤖</div>
          <div>
            <div className="lcp-bot-name">LeadBot</div>
            <div className="lcp-bot-status">
              <div className="lcp-bot-status-dot" />
              Online Now
            </div>
          </div>
          <div className="lcp-bot-meta">
            <div className="lcp-bot-meta-label">Chatting about</div>
            <div className="lcp-bot-meta-val">{lead.name}</div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="lcp-messages">
          {loading ? (
            <div className="lcp-empty">
              <div style={{ fontSize: "1.5rem" }}>◌</div>
              <span>Loading chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="lcp-empty">
              <div className="lcp-empty-icon">🤖</div>
              <div className="lcp-empty-title">LeadBot is ready</div>
              <div className="lcp-empty-sub">Ask me to write an outreach message, suggest a follow-up, or plan your next step for {lead.name}.</div>
            </div>
          ) : (
            <>
              <div className="lcp-divider">
                <div className="lcp-divider-line" />
                <span>Conversation</span>
                <div className="lcp-divider-line" />
              </div>
              {messages.map((msg, i) => {
                const isBot = msg.role === "assistant";
                return (
                  <div key={msg.id} className={"lcp-row lcp-row-" + (isBot ? "bot" : "user")} style={{ animationDelay: (i * 0.03) + "s" }}>
                    {isBot ? <div className="lcp-msg-avatar">🤖</div> : <div className="lcp-msg-avatar-spacer" />}
                    <div className="lcp-bubble-wrap">
                      <div className="lcp-sender-label">{isBot ? "LeadBot" : "You"}</div>
                      <div className={"lcp-bubble lcp-bubble-" + (isBot ? "bot" : "user")}>{msg.content}</div>
                      {isBot && (
                        <button className={"lcp-copy-btn" + (copiedId === msg.id ? " copied" : "")} onClick={() => handleCopy(msg.id, msg.content)}>
                          {copiedId === msg.id ? "✓ Copied!" : "📋 Copy message"}
                        </button>
                      )}
                    </div>
                    {!isBot && <div className="lcp-msg-avatar-spacer" />}
                  </div>
                );
              })}
            </>
          )}

          {aiLoading && (
            <div className="lcp-row lcp-row-bot">
              <div className="lcp-msg-avatar">🤖</div>
              <div className="lcp-bubble-wrap">
                <div className="lcp-sender-label">LeadBot</div>
                <div className="lcp-typing-bubble">
                  <div className="lcp-dot" /><div className="lcp-dot" /><div className="lcp-dot" />
                </div>
              </div>
            </div>
          )}

          {error && <div className="lcp-error">⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* ── Client reply ── */}
        <div className="lcp-client-reply-section">
          <div className="lcp-client-reply-label">📨 Paste lead reply — get instant suggestion</div>
          <div className="lcp-client-reply-row">
            <textarea
              ref={clientReplyRef}
              className="lcp-client-textarea"
              rows={1}
              placeholder={"What did " + lead.name + " reply? Paste it here..."}
              value={clientReply}
              onChange={e => setClientReply(e.target.value)}
              onKeyDown={handleClientReplyKeyDown}
            />
            <button className="lcp-suggest-btn" onClick={handleClientReply} disabled={!clientReply.trim() || aiLoading}>
              Suggest
            </button>
          </div>
        </div>

        {/* ── Quick prompts ── */}
        <div className="lcp-quick">
          <div className="lcp-quick-label">Quick prompts</div>
          {QUICK_PROMPTS.map(p => (
            <button key={p} className="lcp-qp-btn" onClick={() => handleQuickPrompt(p)}>{p}</button>
          ))}
        </div>

        {/* ── Main input ── */}
        <div className="lcp-input-wrap">
          <textarea
            ref={textareaRef}
            className="lcp-textarea"
            rows={1}
            placeholder={"Ask LeadBot about " + lead.name + "..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="lcp-send-btn" onClick={handleSend} disabled={!input.trim() || aiLoading} title="Send">↑</button>
        </div>
        <div className="lcp-input-hint">Enter to send · Shift+Enter for new line</div>

      </div>
    </>
  );
}