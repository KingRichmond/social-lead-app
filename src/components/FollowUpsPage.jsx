// src/components/FollowUpsPage.jsx
import { useState } from "react";
import { useLeads } from "../hooks/useLeads";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function FollowUpsPage() {
  const { leads } = useLeads();
  const navigate = useNavigate();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // Map followUpDate strings to leads
  const leadsByDate = {};
  leads.forEach(lead => {
    if (lead.followUpDate) {
      if (!leadsByDate[lead.followUpDate]) leadsByDate[lead.followUpDate] = [];
      leadsByDate[lead.followUpDate].push(lead);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  }

  function dateKey(day) {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // Leads for selected date or all upcoming
  const selectedLeads = selectedDate
    ? (leadsByDate[selectedDate] || [])
    : leads.filter(l => l.followUpDate).sort((a,b) => a.followUpDate.localeCompare(b.followUpDate));

  const totalWithFollowUp = leads.filter(l => l.followUpDate).length;
  const overdueCount = leads.filter(l => l.followUpDate && l.followUpDate < todayKey && l.status !== "converted").length;

  return (
    <>
      <style>{`
        .fu-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem; background: #faf9f7;
          border-bottom: 1px solid #ede9e3;
          position: sticky; top: 0; z-index: 50;
          font-family: 'DM Sans', sans-serif;
        }
        .fu-topbar h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          color: #1a1916; margin: 0; letter-spacing: -0.02em;
        }
        .fu-topbar p { font-size: 0.82rem; color: #a8a49e; margin: 2px 0 0; }
        .fu-body { padding: 1.75rem 2rem; display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
        @media (max-width: 900px) { .fu-body { grid-template-columns: 1fr; } }

        /* CALENDAR */
        .fu-calendar { background: #fff; border: 1px solid #ede9e3; border-radius: 16px; padding: 1.5rem; }
        .fu-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .fu-cal-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1a1916; }
        .fu-cal-nav { display: flex; gap: 0.5rem; }
        .fu-cal-nav button {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid #ede9e3; background: #fff;
          color: #6b6860; cursor: pointer; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .fu-cal-nav button:hover { border-color: #fb923c; color: #fb923c; }

        .fu-cal-days-header {
          display: grid; grid-template-columns: repeat(7, 1fr);
          margin-bottom: 0.5rem;
        }
        .fu-cal-days-header span {
          text-align: center; font-size: 0.7rem; font-weight: 700;
          color: #c4bfb9; text-transform: uppercase; padding: 0.25rem 0;
          font-family: 'DM Sans', sans-serif;
        }
        .fu-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
        .fu-cal-cell {
          aspect-ratio: 1; border-radius: 8px;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; cursor: pointer;
          font-size: 0.82rem; font-weight: 500;
          color: #6b6860; transition: background 0.1s;
          position: relative; font-family: 'DM Sans', sans-serif;
          border: none; background: none;
        }
        .fu-cal-cell:hover { background: #f5f0ea; color: #1a1916; }
        .fu-cal-cell.today { color: #fb923c; font-weight: 700; }
        .fu-cal-cell.today::after {
          content: ''; position: absolute; bottom: 4px;
          width: 4px; height: 4px; border-radius: 50%; background: #fb923c;
        }
        .fu-cal-cell.has-leads { background: rgba(251,146,60,0.08); color: #1a1916; }
        .fu-cal-cell.has-leads:hover { background: rgba(251,146,60,0.15); }
        .fu-cal-cell.overdue { background: rgba(248,113,113,0.08); color: #dc2626; }
        .fu-cal-cell.overdue:hover { background: rgba(248,113,113,0.15); }
        .fu-cal-cell.selected { background: #fb923c !important; color: #fff !important; font-weight: 700; }
        .fu-cal-cell.selected::after { display: none; }
        .fu-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #fb923c; position: absolute; top: 5px; right: 5px;
        }
        .fu-cal-cell.overdue .fu-dot { background: #f87171; }
        .fu-cal-cell.selected .fu-dot { background: #fff; }

        /* SIDEBAR PANEL */
        .fu-panel { display: flex; flex-direction: column; gap: 1rem; }
        .fu-panel-header {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: #1a1916;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #ede9e3;
          font-family: 'DM Sans', sans-serif;
        }
        .fu-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .fu-stat-mini {
          background: #fff; border: 1px solid #ede9e3; border-radius: 12px;
          padding: 0.85rem 1rem;
        }
        .fu-stat-mini-val { font-size: 1.4rem; font-weight: 800; color: #1a1916; }
        .fu-stat-mini-label { font-size: 0.72rem; color: #a8a49e; font-weight: 500; margin-top: 2px; font-family: 'DM Sans', sans-serif; }

        .fu-lead-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 420px; overflow-y: auto; }
        .fu-lead-item {
          background: #fff; border: 1px solid #ede9e3;
          border-radius: 10px; padding: 0.85rem 1rem;
          cursor: pointer; transition: box-shadow 0.15s, transform 0.15s;
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem; font-family: 'DM Sans', sans-serif;
        }
        .fu-lead-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); transform: translateX(3px); }
        .fu-lead-item.overdue { border-left: 3px solid #f87171; }
        .fu-lead-item.today-item { border-left: 3px solid #fb923c; }
        .fu-lead-name { font-weight: 600; font-size: 0.875rem; color: #1a1916; }
        .fu-lead-date { font-size: 0.75rem; color: #a8a49e; margin-top: 2px; }
        .fu-empty-panel {
          text-align: center; padding: 2.5rem 1rem;
          color: #c4bfb9; background: #fff;
          border: 1px solid #ede9e3; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
        }
      `}</style>

      <div className="fu-topbar">
        <div>
          <h1>Follow-ups</h1>
          <p>{totalWithFollowUp} scheduled · {overdueCount} overdue</p>
        </div>
      </div>

      <div className="fu-body">
        {/* CALENDAR */}
        <div className="fu-calendar">
          <div className="fu-cal-header">
            <span className="fu-cal-title">{MONTHS[viewMonth]} {viewYear}</span>
            <div className="fu-cal-nav">
              <button onClick={prevMonth}>‹</button>
              <button onClick={nextMonth}>›</button>
            </div>
          </div>

          <div className="fu-cal-days-header">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="fu-cal-grid">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(day);
              const hasLeads = !!leadsByDate[key];
              const isToday = key === todayKey;
              const isOverdue = hasLeads && key < todayKey;
              const isSelected = selectedDate === key;

              let cls = "fu-cal-cell";
              if (isSelected) cls += " selected";
              else if (isOverdue) cls += " overdue has-leads";
              else if (hasLeads) cls += " has-leads";
              if (isToday && !isSelected) cls += " today";

              return (
                <button key={key} className={cls}
                  onClick={() => setSelectedDate(isSelected ? null : key)}>
                  {day}
                  {hasLeads && <span className="fu-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PANEL */}
        <div className="fu-panel">
          <div className="fu-stats">
            <div className="fu-stat-mini">
              <div className="fu-stat-mini-val" style={{ color: "#fb923c" }}>{totalWithFollowUp}</div>
              <div className="fu-stat-mini-label">Scheduled</div>
            </div>
            <div className="fu-stat-mini">
              <div className="fu-stat-mini-val" style={{ color: "#f87171" }}>{overdueCount}</div>
              <div className="fu-stat-mini-label">Overdue</div>
            </div>
          </div>

          <div>
            <div className="fu-panel-header" style={{ fontFamily: "'Playfair Display', serif" }}>
              {selectedDate
                ? `${selectedDate} · ${selectedLeads.length} lead${selectedLeads.length !== 1 ? "s" : ""}`
                : "All Upcoming"}
            </div>
          </div>

          {selectedLeads.length === 0 ? (
            <div className="fu-empty-panel">
              {selectedDate ? "No follow-ups on this date." : "No follow-ups scheduled yet."}
            </div>
          ) : (
            <div className="fu-lead-list">
              {selectedLeads.map(lead => {
                const isOverdue = lead.followUpDate < todayKey && lead.status !== "converted";
                const isToday = lead.followUpDate === todayKey;
                return (
                  <div
                    key={lead.id}
                    className={`fu-lead-item${isOverdue ? " overdue" : ""}${isToday ? " today-item" : ""}`}
                    onClick={() => navigate(`/lead/${lead.id}`)}
                  >
                    <div>
                      <div className="fu-lead-name">{lead.name}</div>
                      <div className="fu-lead-date">
                        {isOverdue ? "⚠️ Overdue · " : isToday ? "📅 Today · " : "📅 "}
                        {lead.followUpDate}
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}