// src/components/ReportsPage.jsx
import { useLeads } from "../hooks/useLeads";

const PLATFORM_ICONS = {
  instagram: "📸", twitter: "🐦", tiktok: "🎵",
  linkedin: "💼", facebook: "📘", other: "🔗",
};
const STATUS_COLORS = {
  new: "#fb923c", contacted: "#fbbf24",
  converted: "#4ade80", lost: "#f87171",
};
const PLATFORM_COLORS = {
  instagram: "#fb923c", twitter: "#38bdf8", tiktok: "#f472b6",
  linkedin: "#60a5fa", facebook: "#818cf8", other: "#a8a49e",
};

export default function ReportsPage() {
  const { leads, loading } = useLeads();

  const statusCounts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1; return acc;
  }, {});
  const platformCounts = leads.reduce((acc, l) => {
    acc[l.platform] = (acc[l.platform] || 0) + 1; return acc;
  }, {});

  const total = leads.length || 1;
  const conversionRate = leads.length
    ? Math.round(((statusCounts.converted || 0) / leads.length) * 100)
    : 0;

  const statusEntries = Object.entries(statusCounts).sort((a,b) => b[1]-a[1]);
  const platformEntries = Object.entries(platformCounts).sort((a,b) => b[1]-a[1]);

  // Last 7 days activity
  const now = new Date();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = leads.filter(l => l.createdAt?.toDate &&
      l.createdAt.toDate().toDateString() === d.toDateString()).length;
    return { label, count, key };
  });
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "#a8a49e", fontFamily: "'DM Sans', sans-serif" }}>
      Loading reports…
    </div>
  );

  return (
    <>
      <style>{`
        .rp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem; background: #faf9f7;
          border-bottom: 1px solid #ede9e3;
          position: sticky; top: 0; z-index: 50;
          font-family: 'DM Sans', sans-serif;
        }
        .rp-topbar h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          color: #1a1916; margin: 0; letter-spacing: -0.02em;
        }
        .rp-topbar p { font-size: 0.82rem; color: #a8a49e; margin: 2px 0 0; }
        .rp-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 800px) { .rp-row { grid-template-columns: 1fr; } }
        .rp-card {
          background: #fff; border: 1px solid #ede9e3;
          border-radius: 16px; padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }
        .rp-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700;
          color: #1a1916; margin-bottom: 1.25rem;
        }

        /* KPI row */
        .rp-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .rp-kpi {
          background: #fff; border: 1px solid #ede9e3;
          border-radius: 14px; padding: 1.25rem;
          text-align: center; font-family: 'DM Sans', sans-serif;
        }
        .rp-kpi-val { font-size: 2rem; font-weight: 800; color: #1a1916; }
        .rp-kpi-label { font-size: 0.75rem; color: #a8a49e; font-weight: 500; margin-top: 4px; }

        /* Bar chart */
        .rp-bar-row {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .rp-bar-label { font-size: 0.82rem; color: #6b6860; width: 80px; text-align: right; flex-shrink: 0; text-transform: capitalize; }
        .rp-bar-track { flex: 1; height: 10px; background: #f5f0ea; border-radius: 99px; overflow: hidden; }
        .rp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .rp-bar-count { font-size: 0.78rem; color: #a8a49e; width: 24px; text-align: right; flex-shrink: 0; }

        /* Activity chart */
        .rp-activity { display: flex; align-items: flex-end; gap: 0.5rem; height: 100px; }
        .rp-day-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
        .rp-day-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
        .rp-day-bar {
          width: 100%; border-radius: 6px 6px 0 0;
          background: rgba(251,146,60,0.15);
          transition: height 0.5s ease;
          min-height: 4px;
        }
        .rp-day-bar.has-data { background: #fb923c; }
        .rp-day-label { font-size: 0.65rem; color: #c4bfb9; font-weight: 600; }
        .rp-day-count { font-size: 0.65rem; color: #a8a49e; }
      `}</style>

      <div className="rp-topbar">
        <div>
          <h1>Reports</h1>
          <p>Overview of your lead pipeline</p>
        </div>
      </div>

      <div className="rp-body">
        {/* KPIs */}
        <div className="rp-kpis">
          {[
            { label: "Total Leads",      val: leads.length,                    color: "#fb923c" },
            { label: "Conversion Rate",  val: `${conversionRate}%`,            color: "#4ade80" },
            { label: "Platforms Used",   val: Object.keys(platformCounts).length, color: "#60a5fa" },
          ].map(k => (
            <div className="rp-kpi" key={k.label}>
              <div className="rp-kpi-val" style={{ color: k.color }}>{k.val}</div>
              <div className="rp-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="rp-row">
          {/* Status breakdown */}
          <div className="rp-card">
            <div className="rp-card-title">Leads by Status</div>
            {statusEntries.length === 0
              ? <p style={{ color: "#c4bfb9", fontSize: "0.875rem" }}>No data yet.</p>
              : statusEntries.map(([status, count]) => (
                <div className="rp-bar-row" key={status}>
                  <span className="rp-bar-label">{status}</span>
                  <div className="rp-bar-track">
                    <div className="rp-bar-fill"
                      style={{ width: `${(count/total)*100}%`, background: STATUS_COLORS[status] || "#a8a49e" }} />
                  </div>
                  <span className="rp-bar-count">{count}</span>
                </div>
              ))
            }
          </div>

          {/* Platform breakdown */}
          <div className="rp-card">
            <div className="rp-card-title">Leads by Platform</div>
            {platformEntries.length === 0
              ? <p style={{ color: "#c4bfb9", fontSize: "0.875rem" }}>No data yet.</p>
              : platformEntries.map(([platform, count]) => (
                <div className="rp-bar-row" key={platform}>
                  <span className="rp-bar-label">{PLATFORM_ICONS[platform]} {platform}</span>
                  <div className="rp-bar-track">
                    <div className="rp-bar-fill"
                      style={{ width: `${(count/total)*100}%`, background: PLATFORM_COLORS[platform] || "#a8a49e" }} />
                  </div>
                  <span className="rp-bar-count">{count}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Activity */}
        <div className="rp-card">
          <div className="rp-card-title">Leads Added — Last 7 Days</div>
          <div className="rp-activity">
            {last7.map(day => (
              <div className="rp-day-col" key={day.key}>
                <div className="rp-day-bar-wrap">
                  <div
                    className={`rp-day-bar${day.count > 0 ? " has-data" : ""}`}
                    style={{ height: `${Math.max((day.count / maxDay) * 80, 4)}px` }}
                  />
                </div>
                <span className="rp-day-label">{day.label}</span>
                <span className="rp-day-count">{day.count > 0 ? day.count : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}