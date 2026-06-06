// src/components/StatusBadge.jsx
export default function StatusBadge({ status }) {
    const styles = {
      new:       { bg: "rgba(251,146,60,0.12)", color: "#c2410c", border: "rgba(251,146,60,0.3)" },
      contacted: { bg: "rgba(251,191,36,0.12)", color: "#92400e", border: "rgba(251,191,36,0.3)" },
      converted: { bg: "rgba(34,197,94,0.1)",  color: "#166534", border: "rgba(34,197,94,0.25)" },
      lost:      { bg: "rgba(239,68,68,0.1)",  color: "#991b1b", border: "rgba(239,68,68,0.25)" },
    };
    const s = styles[status] || { bg: "#f3f0eb", color: "#6b6860", border: "#ede9e3" };
    return (
      <span style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        padding: "3px 10px", borderRadius: "999px",
        fontSize: "0.72rem", fontWeight: 700,
        textTransform: "capitalize", letterSpacing: "0.04em",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {status}
      </span>
    );
  }