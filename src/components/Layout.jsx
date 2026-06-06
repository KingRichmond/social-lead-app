// src/components/Layout.jsx
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { icon: "◈",  label: "Dashboard",  path: "dashboard" },
  { icon: "👥", label: "Leads",      path: "leads"     },
  { icon: "📅", label: "Follow-ups", path: "followups" },
  { icon: "📊", label: "Reports",    path: "reports"   },
];

export default function Layout({ children, activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.displayName || user?.email?.split("@")[0] || "there";
  const initial = firstName[0].toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleNav(path) {
    onNavigate(path);
    setMobileOpen(false); // close sidebar after navigation on mobile
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="layout-logo">
        <div className="layout-logo-icon">◈</div>
        {!collapsed && <span className="layout-logo-text">SocialLead</span>}
      </div>

      {/* Desktop collapse toggle — hidden on mobile */}
      <button className="layout-collapse layout-desktop-only" onClick={() => setCollapsed(c => !c)}>
        {collapsed ? "→" : "←"}
      </button>

      {/* Nav items */}
      <nav className="layout-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`layout-nav-item${activePage === item.path ? " active" : ""}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="layout-nav-icon">{item.icon}</span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="layout-footer">
        <button className="layout-avatar-row" onClick={() => handleNav("profile")}>
          <div className="layout-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" />
              : initial}
          </div>
          {!collapsed && (
            <div>
              <div className="layout-avatar-name">{firstName}</div>
              <div className="layout-avatar-role">Free plan</div>
            </div>
          )}
        </button>
        <button className="layout-logout" onClick={handleLogout}>
          <span style={{ fontSize: "1rem" }}>⬡</span>
          {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .layout-root {
          display: flex; min-height: 100vh;
          background: #faf9f7; font-family: 'DM Sans', sans-serif;
        }

        /* ── Desktop sidebar ── */
        .layout-sidebar {
          width: ${collapsed ? "72px" : "220px"};
          background: #1a1916;
          display: flex; flex-direction: column;
          padding: 1.5rem 0;
          transition: width 0.25s ease;
          flex-shrink: 0;
          position: sticky; top: 0; height: 100vh;
          overflow: hidden; z-index: 100;
        }

        /* ── Mobile top bar ── */
        .layout-mobile-topbar {
          display: none;
          align-items: center; justify-content: space-between;
          padding: 0.85rem 1.25rem;
          background: #1a1916;
          position: sticky; top: 0; z-index: 200;
          flex-shrink: 0;
        }
        .layout-mobile-logo {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .layout-mobile-logo-icon {
          width: 30px; height: 30px; background: #fb923c;
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 0.9rem;
          color: #1a1916; font-weight: 800;
        }
        .layout-mobile-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; color: #f5f3f0; font-weight: 700;
        }
        .layout-hamburger {
          background: none; border: none;
          color: #f5f3f0; font-size: 1.3rem;
          cursor: pointer; padding: 0.25rem 0.5rem;
          border-radius: 6px; line-height: 1;
          transition: background 0.15s;
        }
        .layout-hamburger:hover { background: #2a2926; }

        /* ── Mobile overlay ── */
        .layout-mobile-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 299;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        .layout-mobile-overlay.open { display: block; }

        /* ── Mobile slide-in drawer ── */
        .layout-mobile-drawer {
          position: fixed; top: 0; left: 0;
          width: 260px; height: 100vh;
          background: #1a1916;
          display: flex; flex-direction: column;
          padding: 1.5rem 0;
          z-index: 300;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
          overflow: hidden;
        }
        .layout-mobile-drawer.open { transform: translateX(0); }

        /* ── Shared sidebar content styles ── */
        .layout-logo {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0 1.25rem; margin-bottom: 2rem;
          white-space: nowrap; overflow: hidden;
        }
        .layout-logo-icon {
          width: 34px; height: 34px; background: #fb923c;
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; font-size: 1rem;
          color: #1a1916; font-weight: 800; flex-shrink: 0;
        }
        .layout-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; color: #f5f3f0; font-weight: 700;
        }
        .layout-collapse {
          background: none; border: none; color: #6b6860;
          cursor: pointer; padding: 0.4rem;
          margin: 0 0.75rem 1.5rem;
          border-radius: 8px; font-size: 1rem;
          align-self: ${collapsed ? "center" : "flex-end"};
          transition: color 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .layout-collapse:hover { color: #fb923c; }
        .layout-nav {
          flex: 1; padding: 0 0.75rem;
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .layout-nav-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.7rem 0.85rem; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap; overflow: hidden;
          color: #6b6860; font-size: 0.875rem; font-weight: 500;
          border: none; background: none; width: 100%;
          font-family: 'DM Sans', sans-serif; text-align: left;
        }
        .layout-nav-item:hover { background: #2a2926; color: #f5f3f0; }
        .layout-nav-item.active { background: rgba(251,146,60,0.15); color: #fb923c; }
        .layout-nav-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }
        .layout-footer {
          padding: 0 0.75rem;
          border-top: 1px solid #2a2926;
          padding-top: 1rem; margin-top: 1rem;
        }
        .layout-avatar-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.6rem 0.85rem; border-radius: 10px;
          white-space: nowrap; overflow: hidden;
          cursor: pointer; transition: background 0.15s;
          border: none; background: none; width: 100%;
          font-family: 'DM Sans', sans-serif; text-align: left;
        }
        .layout-avatar-row:hover { background: #2a2926; }
        .layout-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: #fb923c; display: flex; align-items: center;
          justify-content: center; font-size: 0.85rem;
          font-weight: 700; color: #1a1916; flex-shrink: 0; overflow: hidden;
        }
        .layout-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .layout-avatar-name { font-size: 0.82rem; color: #f5f3f0; font-weight: 600; }
        .layout-avatar-role { font-size: 0.72rem; color: #6b6860; }
        .layout-logout {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.6rem 0.85rem; border-radius: 10px;
          cursor: pointer; color: #6b6860;
          font-size: 0.82rem; font-weight: 500;
          background: none; border: none; width: 100%;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap; margin-top: 0.25rem;
          transition: color 0.15s, background 0.15s;
        }
        .layout-logout:hover { color: #f87171; background: rgba(248,113,113,0.08); }

        .layout-main {
          flex: 1; display: flex; flex-direction: column;
          min-width: 0; background: #faf9f7; min-height: 100vh;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── Mobile breakpoint ── */
        @media (max-width: 640px) {
          .layout-sidebar       { display: none; }
          .layout-mobile-topbar { display: flex; }
          .layout-desktop-only  { display: none; }
        }
      `}</style>

      <div className="layout-root" style={{ flexDirection: "column" }}>

        {/* ── Mobile top bar (hamburger) ── */}
        <div className="layout-mobile-topbar">
          <div className="layout-mobile-logo">
            <div className="layout-mobile-logo-icon">◈</div>
            <span className="layout-mobile-logo-text">SocialLead</span>
          </div>
          <button className="layout-hamburger" onClick={() => setMobileOpen(true)}>
            ☰
          </button>
        </div>

        {/* ── Mobile overlay (tap to close) ── */}
        <div
          className={`layout-mobile-overlay${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Mobile slide-in drawer ── */}
        <div className={`layout-mobile-drawer${mobileOpen ? " open" : ""}`}>
          {/* Close button inside drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "#2a2926", border: "none", color: "#a8a49e",
              width: 28, height: 28, borderRadius: "7px",
              cursor: "pointer", fontSize: "0.9rem", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          {sidebarContent}
        </div>

        {/* ── Main content row ── */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Desktop sidebar */}
          <aside className="layout-sidebar">
            {sidebarContent}
          </aside>
          <main className="layout-main">{children}</main>
        </div>

      </div>
    </>
  );
}