// src/components/Navbar.jsx
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      height: "60px",
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", letterSpacing: "-0.02em" }}>
        📊 SocialLead
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{user?.email}</span>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "0.4rem 1rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "#374151",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}