// src/components/LeadsPage.jsx
import { useState } from "react";
import { useLeads } from "../hooks/useLeads";
import LeadCard from "./LeadCard";
import LeadForm from "./LeadForm";

const STATUS_FILTERS = ["all", "new", "contacted", "converted", "lost"];

const STYLES = `
  .lp-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 2rem; background: #fff;
    border-bottom: 1px solid #ede9e3;
    position: sticky; top: 0; z-index: 50;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-topbar h1 {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700;
    color: #1a1916; margin: 0; letter-spacing: -0.02em;
  }
  .lp-topbar p { font-size: 0.78rem; color: #a8a49e; margin: 2px 0 0; }
  .lp-topbar-right { display: flex; align-items: center; gap: 0.6rem; }
  .lp-add-btn {
    padding: 0.5rem 1.1rem; background: #fb923c; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
    font-weight: 700; cursor: pointer; white-space: nowrap;
    transition: background 0.15s, transform 0.15s;
    box-shadow: 0 2px 8px rgba(251,146,60,0.25);
  }
  .lp-add-btn:hover { background: #f97316; transform: translateY(-1px); }

  /* Search bar below topbar */
  .lp-search-bar {
    padding: 0.6rem 2rem; background: #fff;
    border-bottom: 1px solid #ede9e3;
    position: sticky; top: 57px; z-index: 49;
  }
  .lp-search-inner {
    display: flex; align-items: center; gap: 0.75rem;
    background: #faf9f7; border: 1px solid #ede9e3;
    border-radius: 12px; padding: 0.5rem 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-search-inner:focus-within {
    border-color: #fb923c;
    box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
  }
  .lp-search-icon { font-size: 0.9rem; color: #c4bfb9; flex-shrink: 0; }
  .lp-search-input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1a1916;
  }
  .lp-search-input::placeholder { color: #c4bfb9; }
  .lp-search-clear {
    background: none; border: none; color: #c4bfb9;
    cursor: pointer; font-size: 0.8rem; padding: 0; transition: color 0.15s;
  }
  .lp-search-clear:hover { color: #fb923c; }

  .lp-content { padding: 1.5rem 2rem; }
  .lp-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;
  }
  .lp-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; }
  .lp-filter-btn {
    padding: 0.3rem 0.75rem; border-radius: 20px;
    border: 1px solid #ede9e3; background: #fff;
    color: #6b6860; font-size: 0.73rem; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    text-transform: capitalize; transition: all 0.15s;
  }
  .lp-filter-btn:hover { border-color: #fb923c; color: #fb923c; }
  .lp-filter-btn.active { background: #fb923c; border-color: #fb923c; color: #fff; }
  .lp-count { font-size: 0.73rem; color: #c4bfb9; font-family: 'DM Sans', sans-serif; }
  .lp-table-head {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 0.5rem 1.25rem; gap: 1rem; margin-bottom: 0.4rem;
    background: #faf9f7; border-radius: 8px;
  }
  .lp-table-head span {
    font-size: 0.65rem; font-weight: 700; color: #c4bfb9;
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-empty {
    text-align: center; padding: 5rem 2rem; color: #c4bfb9;
    background: #fff; border: 1px solid #ede9e3; border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
  .lp-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,25,22,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
  }
  .lp-modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 80px rgba(0,0,0,0.15); animation: modalIn 0.2s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.97) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @media (max-width: 640px) {
    .lp-topbar { padding: 0.85rem 1.25rem; top: 52px; }
    .lp-search-bar { padding: 0.5rem 1.25rem; top: calc(52px + 53px); }
    .lp-content { padding: 1rem 1.25rem; }
    .lp-table-head { display: none; }
  }
`;

export default function LeadsPage() {
  const { leads, loading } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.handle || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <style>{STYLES}</style>

      {/* Topbar */}
      <div className="lp-topbar">
        <div>
          <h1>All Leads</h1>
          <p>{leads.length} total lead{leads.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="lp-topbar-right">
          <button className="lp-add-btn" onClick={() => setShowForm(true)}>+ Add Lead</button>
        </div>
      </div>

      {/* Search bar below topbar */}
      <div className="lp-search-bar">
        <div className="lp-search-inner">
          <span className="lp-search-icon">🔍</span>
          <input
            className="lp-search-input"
            type="text"
            placeholder="Search by name or handle…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="lp-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="lp-content">
        <div className="lp-toolbar">
          <div className="lp-filters">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                className={"lp-filter-btn" + (statusFilter === s ? " active" : "")}
                onClick={() => setStatusFilter(s)}
              >{s}</button>
            ))}
          </div>
          <span className="lp-count">
            {filtered.length} of {leads.length} leads
          </span>
        </div>

        {filtered.length > 0 && (
          <div className="lp-table-head">
            <span>Lead</span>
            <span>Platform</span>
            <span>Follow-up</span>
            <span>Status</span>
          </div>
        )}

        {loading ? (
          <div className="lp-empty"><div className="lp-empty-icon">⏳</div><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="lp-empty">
            <div className="lp-empty-icon">📭</div>
            <p>{leads.length === 0 ? "No leads yet — add your first one!" : "No leads match your filter."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} />)}
          </div>
        )}
      </div>

      {showForm && (
        <div className="lp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <LeadForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}