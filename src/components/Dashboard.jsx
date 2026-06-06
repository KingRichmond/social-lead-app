// src/components/Dashboard.jsx
import { useState } from "react";
import { useLeads } from "../hooks/useLeads";
import { useAuth } from "../AuthContext";
import Layout from "./Layout";
import LeadCard from "./LeadCard";
import LeadForm from "./LeadForm";
import LeadsPage from "./LeadsPage";
import FollowUpsPage from "./FollowUpsPage";
import ReportsPage from "./ReportsPage";
import ProfilePage from "./ProfilePage";

const STATUS_FILTERS = ["all", "new", "contacted", "converted", "lost"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .db-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 2rem; background: #fff;
    border-bottom: 1px solid #ede9e3;
    position: sticky; top: 0; z-index: 50;
    font-family: 'DM Sans', sans-serif;
  }
  .db-topbar h1 {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700;
    color: #1a1916; margin: 0; letter-spacing: -0.02em;
  }
  .db-topbar-sub {
    font-size: 0.78rem; color: #a8a49e; margin: 3px 0 0;
    font-family: 'DM Sans', sans-serif;
  }
  .db-topbar-right { display: flex; align-items: center; gap: 0.6rem; }
  .db-add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0.55rem 1.1rem; background: #fb923c; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
    font-weight: 700; cursor: pointer; white-space: nowrap;
    transition: background 0.15s, transform 0.15s;
    box-shadow: 0 2px 8px rgba(251,146,60,0.25);
  }
  .db-add-btn:hover { background: #f97316; transform: translateY(-1px); }

  /* Search bar */
  .db-search-bar {
    padding: 0.6rem 2rem; background: #fff;
    border-bottom: 1px solid #ede9e3;
    position: sticky; top: 64px; z-index: 49;
  }
  .db-search-inner {
    display: flex; align-items: center; gap: 0.75rem;
    background: #faf9f7; border: 1px solid #ede9e3;
    border-radius: 12px; padding: 0.5rem 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .db-search-inner:focus-within {
    border-color: #fb923c;
    box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
  }
  .db-search-icon { font-size: 0.9rem; color: #c4bfb9; flex-shrink: 0; }
  .db-search-input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1a1916;
  }
  .db-search-input::placeholder { color: #c4bfb9; }
  .db-search-clear {
    background: none; border: none; color: #c4bfb9;
    cursor: pointer; font-size: 0.8rem; padding: 0; transition: color 0.15s;
  }
  .db-search-clear:hover { color: #fb923c; }

  /* Content */
  .db-content { padding: 1.5rem 2rem; }

  /* Section header */
  .db-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }
  .db-section-title {
    font-size: 0.7rem; font-weight: 700; color: #c4bfb9;
    text-transform: uppercase; letter-spacing: 0.1em;
    font-family: 'DM Sans', sans-serif;
  }

  /* Desktop stats */
  .db-stats-row {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem; margin-bottom: 1.75rem;
  }
  .db-stat-card {
    background: #fff; border: 1px solid #ede9e3;
    border-radius: 14px; padding: 1rem 1.1rem;
    display: flex; align-items: center; gap: 0.75rem;
    transition: box-shadow 0.15s, transform 0.15s;
    animation: fadeUp 0.4s ease both;
  }
  .db-stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
  .db-stat-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .db-stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; }
  .db-stat-label { font-size: 0.7rem; color: #a8a49e; font-weight: 500; margin-top: 3px; }

  /* Mobile stats */
  .db-stats-mobile { display: none; margin-bottom: 1.25rem; }
  .db-stats-mobile-row {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem;
  }
  .db-stat-mini {
    background: #fff; border: 1px solid #ede9e3; border-radius: 10px;
    padding: 0.6rem 0.4rem; text-align: center;
    animation: fadeUp 0.3s ease both;
  }
  .db-stat-mini-icon  { font-size: 1rem; display: block; margin-bottom: 2px; }
  .db-stat-mini-value { font-size: 1rem; font-weight: 800; line-height: 1; display: block; }
  .db-stat-mini-label { font-size: 0.52rem; color: #a8a49e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; display: block; margin-top: 2px; }

  /* Leads section */
  .db-leads-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;
  }
  .db-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; }
  .db-filter-btn {
    padding: 0.3rem 0.75rem; border-radius: 20px;
    border: 1px solid #ede9e3; background: #fff;
    color: #6b6860; font-size: 0.73rem; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    text-transform: capitalize; transition: all 0.15s;
  }
  .db-filter-btn:hover { border-color: #fb923c; color: #fb923c; }
  .db-filter-btn.active { background: #fb923c; border-color: #fb923c; color: #fff; }
  .db-leads-count {
    font-size: 0.73rem; color: #c4bfb9;
    font-family: 'DM Sans', sans-serif; margin-bottom: 0.75rem;
  }
  .db-table-head {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 0.5rem 1.25rem; gap: 1rem; margin-bottom: 0.4rem;
    background: #faf9f7; border-radius: 8px;
  }
  .db-table-head span {
    font-size: 0.65rem; font-weight: 700; color: #c4bfb9;
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'DM Sans', sans-serif;
  }
  .db-empty {
    text-align: center; padding: 3.5rem 2rem; color: #c4bfb9;
    background: #fff; border: 1px solid #ede9e3; border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
  }
  .db-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,25,22,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
  }
  .db-modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 80px rgba(0,0,0,0.15); animation: modalIn 0.2s ease;
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

  @media (max-width: 900px) {
    .db-stats-row { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 640px) {
    .db-topbar    { padding: 0.85rem 1.25rem; top: 52px; }
    .db-search-bar { padding: 0.5rem 1.25rem; top: calc(52px + 60px); }
    .db-content   { padding: 1rem 1.25rem; }
    .db-stats-row { display: none; }
    .db-stats-mobile { display: block; }
    .db-table-head { display: none; }
  }
`;

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function DashboardHome() {
  const { leads, loading } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  const firstName = user?.displayName || user?.email?.split("@")[0] || "there";

  const filtered = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.handle || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1; return acc;
  }, {});

  const STATS = [
    { label: "Total",     value: leads.length,          icon: "👥", accent: "#fb923c", bg: "rgba(251,146,60,0.1)"  },
    { label: "New",       value: counts.new || 0,       icon: "✨", accent: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
    { label: "Contacted", value: counts.contacted || 0, icon: "💬", accent: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
    { label: "Converted", value: counts.converted || 0, icon: "🎯", accent: "#4ade80", bg: "rgba(74,222,128,0.1)"  },
    { label: "Lost",      value: counts.lost || 0,      icon: "📉", accent: "#f87171", bg: "rgba(248,113,113,0.1)" },
  ];

  const statCards = STATS.map((s, i) => (
    <div className="db-stat-card" key={s.label} style={{ animationDelay: (i * 0.06) + "s" }}>
      <div className="db-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
      <div>
        <div className="db-stat-value" style={{ color: s.accent }}>{s.value}</div>
        <div className="db-stat-label">{s.label}</div>
      </div>
    </div>
  ));

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Topbar ── */}
      <div className="db-topbar">
        <div>
          <h1>Good {getTimeOfDay()}, {firstName} 👋</h1>
          {/* Date sits below the greeting, back where it belongs */}
          <div className="db-topbar-sub">
            📅 {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="db-topbar-right">
          <button className="db-add-btn" onClick={() => setShowForm(true)}>+ Add Lead</button>
        </div>
      </div>

      {/* ── Search bar (sticky below topbar) ── */}
      <div className="db-search-bar">
        <div className="db-search-inner">
          <span className="db-search-icon">🔍</span>
          <input
            className="db-search-input"
            type="text"
            placeholder="Search leads by name or handle…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="db-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

      <div className="db-content">

        {/* ── Overview label (no duplicate count) ── */}
        <div className="db-section-header">
          <span className="db-section-title">Overview</span>
        </div>

        {/* Desktop stats grid */}
        <div className="db-stats-row">{statCards}</div>

        {/* Mobile stats compact row */}
        <div className="db-stats-mobile">
          <div className="db-stats-mobile-row">
            {STATS.map((s, i) => (
              <div className="db-stat-mini" key={s.label} style={{ animationDelay: (i * 0.05) + "s" }}>
                <span className="db-stat-mini-icon">{s.icon}</span>
                <span className="db-stat-mini-value" style={{ color: s.accent }}>{s.value}</span>
                <span className="db-stat-mini-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leads list ── */}
        <div className="db-leads-header">
          <span className="db-section-title">Recent Leads</span>
          <div className="db-filters">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                className={"db-filter-btn" + (statusFilter === s ? " active" : "")}
                onClick={() => setStatusFilter(s)}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="db-leads-count">
          Showing {filtered.length} of {leads.length} leads
        </div>

        {filtered.length > 0 && (
          <div className="db-table-head">
            <span>Lead</span>
            <span>Platform</span>
            <span>Follow-up</span>
            <span>Status</span>
          </div>
        )}

        {loading ? (
          <div className="db-empty"><p>⏳ Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="db-empty">
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📭</p>
            <p>{leads.length === 0 ? "No leads yet — add your first one!" : "No leads match your filter."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} />)}
          </div>
        )}
      </div>

      {showForm && (
        <div className="db-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <LeadForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const pages = {
    dashboard: <DashboardHome />,
    leads:     <LeadsPage />,
    followups: <FollowUpsPage />,
    reports:   <ReportsPage />,
    profile:   <ProfilePage />,
  };
  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {pages[activePage] || <DashboardHome />}
    </Layout>
  );
}