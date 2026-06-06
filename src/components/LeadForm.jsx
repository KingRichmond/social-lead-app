// src/components/LeadForm.jsx
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

// ── Random User API helper ──────────────────────────────────────────────────
async function fetchRandomUser() {
  const res = await fetch("https://randomuser.me/api/?nat=us,gb,ca,au");
  if (!res.ok) throw new Error("Failed to fetch random user");
  const data = await res.json();
  const u = data.results[0];
  return {
    name: `${u.name.first} ${u.name.last}`,
    handle: `@${u.login.username}`,
    avatarUrl: u.picture.medium,
    email: u.email,        // stored in Firestore but not shown in form
    location: `${u.location.city}, ${u.location.country}`,
  };
}

export default function LeadForm({ onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "", platform: "instagram", handle: "",
    status: "new", notes: "", followUpDate: "",
    avatarUrl: "", email: "", location: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // ── Auto-fill handler ───────────────────────────────────────────────────
  async function handleAutoFill() {
    setAutoFilling(true);
    setError("");
    try {
      const randomUser = await fetchRandomUser();
      setFormData(prev => ({
        ...prev,
        name: randomUser.name,
        handle: randomUser.handle,
        avatarUrl: randomUser.avatarUrl,
        email: randomUser.email,
        location: randomUser.location,
      }));
      setAvatarPreview(randomUser.avatarUrl);
    } catch (err) {
      setError("Could not fetch a random user. Check your connection and try again.");
    }
    setAutoFilling(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addDoc(collection(db, "leads"), {
        ...formData, userId: user.uid, createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // ── Styles ──────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box",
    background: "#faf9f7", border: "1px solid #ede9e3",
    borderRadius: "10px", color: "#1a1916",
    fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    color: "#a8a49e", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: "0.4rem",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1a1916", margin: 0 }}>
            Add New Lead
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#a8a49e", margin: "4px 0 0" }}>Fill in the details below</p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#a8a49e", cursor: "pointer" }}>✕</button>
      </div>

      {/* ── Auto-fill button ── */}
      <button
        type="button"
        onClick={handleAutoFill}
        disabled={autoFilling}
        style={{
          width: "100%", padding: "0.7rem 1rem", marginBottom: "0.75rem",
          background: autoFilling ? "#fdf3ee" : "#fff7f3",
          border: "1.5px dashed #fb923c", borderRadius: "10px",
          color: autoFilling ? "#f97316" : "#fb923c",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
          fontWeight: 600, cursor: autoFilling ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: "1rem" }}>{autoFilling ? "⏳" : "✨"}</span>
        {autoFilling ? "Fetching profile…" : "Auto-fill with random user profile"}
      </button>

      {/* ── Avatar preview (shown after auto-fill) ── */}
      {avatarPreview && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.65rem 1rem", marginBottom: "1rem",
          background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)",
          borderRadius: "10px",
        }}>
          <img
            src={avatarPreview} alt="Lead avatar"
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #fb923c" }}
          />
          <div>
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#1a1916" }}>{formData.name}</p>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#a8a49e" }}>
              Profile auto-filled · edit any field below
            </p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, height: "1px", background: "#ede9e3" }} />
        <span style={{ fontSize: "0.72rem", color: "#c4bfb9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          or fill manually
        </span>
        <div style={{ flex: 1, height: "1px", background: "#ede9e3" }} />
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name" />
          </div>
          <div>
            <label style={labelStyle}>Handle</label>
            <input style={inputStyle} type="text" name="handle" value={formData.handle} onChange={handleChange} placeholder="@username" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Platform</label>
            <select style={inputStyle} name="platform" value={formData.platform} onChange={handleChange}>
              {["instagram","twitter","tiktok","linkedin","facebook","other"].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} name="status" value={formData.status} onChange={handleChange}>
              {["new","contacted","converted","lost"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Follow-up Date</label>
          <input style={inputStyle} type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "90px" }} name="notes" value={formData.notes} onChange={handleChange} placeholder="Any context about this lead…" />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={loading} style={{
            flex: 1, padding: "0.85rem",
            background: "#fb923c", color: "#fff",
            border: "none", borderRadius: "10px",
            fontWeight: 700, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {loading ? "Saving…" : "Add Lead →"}
          </button>
          <button type="button" onClick={onClose} style={{
            padding: "0.85rem 1.5rem",
            background: "#faf9f7", color: "#6b6860",
            border: "1px solid #ede9e3", borderRadius: "10px",
            fontWeight: 600, fontSize: "0.9rem",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}