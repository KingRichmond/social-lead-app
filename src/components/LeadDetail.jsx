// src/components/LeadDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "./Navbar";
import StatusBadge from "./StatusBadge";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchLead() {
      const snap = await getDoc(doc(db, "leads", id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setLead(data);
        setFormData(data);
      }
      setLoading(false);
    }
    fetchLead();
  }, [id]);

  async function handleSave() {
    await updateDoc(doc(db, "leads", id), {
      name: formData.name,
      handle: formData.handle,
      platform: formData.platform,
      status: formData.status,
      notes: formData.notes,
      followUpDate: formData.followUpDate,
    });
    setLead({ ...lead, ...formData });
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this lead?")) return;
    await deleteDoc(doc(db, "leads", id));
    navigate("/");
  }

  if (loading) return <><Navbar /><p style={{ padding: "2rem" }}>Loading…</p></>;
  if (!lead)   return <><Navbar /><p style={{ padding: "2rem" }}>Lead not found.</p></>;

  const field = (label, key, type = "text") => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>{label}</label>
      {editing ? (
        type === "textarea" ? (
          <textarea
            value={formData[key] || ""}
            onChange={e => setFormData({ ...formData, [key]: e.target.value })}
            rows={4}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
          />
        ) : (
          <input
            type={type}
            value={formData[key] || ""}
            onChange={e => setFormData({ ...formData, [key]: e.target.value })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
          />
        )
      ) : (
        <p style={{ margin: 0, color: "#111827" }}>{lead[key] || "—"}</p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", marginBottom: "1rem", fontSize: "0.9rem" }}>
          ← Back to Dashboard
        </button>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0 }}>{lead.name}</h2>
            <StatusBadge status={lead.status} />
          </div>

          {editing ? (
            <>
              {field("Name", "name")}
              {field("Handle", "handle")}
              {field("Follow-up Date", "followUpDate", "date")}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                  {["new","contacted","converted","lost"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {field("Notes", "notes", "textarea")}
            </>
          ) : (
            <>
              {field("Handle", "handle")}
              {field("Platform", "platform")}
              {field("Follow-up Date", "followUpDate")}
              {field("Notes", "notes")}
            </>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {editing ? (
              <>
                <button onClick={handleSave} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600 }}>Save</button>
                <button onClick={() => setEditing(false)} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer" }}>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600 }}>Edit</button>
                <button onClick={handleDelete} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600 }}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}