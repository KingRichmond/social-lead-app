import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-root { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; background: #0f0e0c; }
        .auth-left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 4rem; background: #0f0e0c; position: relative; overflow: hidden; }
        .auth-left::before { content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; }
        .auth-logo { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #fb923c; letter-spacing: -0.01em; margin-bottom: 3rem; display: flex; align-items: center; gap: 0.5rem; }
        .auth-logo span { color: #fff; }
        .auth-heading { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
        .auth-heading em { font-style: italic; color: #fb923c; }
        .auth-subheading { font-size: 0.95rem; color: #6b6860; margin-bottom: 2rem; font-weight: 300; line-height: 1.6; }
        .auth-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.25rem; }
        .field-group { margin-bottom: 1rem; }
        .field-label { display: block; font-size: 0.75rem; font-weight: 600; color: #6b6860; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .field-input { width: 100%; padding: 0.85rem 1rem; background: #1a1916; border: 1px solid #2a2926; border-radius: 10px; color: #f5f3f0; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .field-input::placeholder { color: #3a3835; }
        .field-input:focus { border-color: #fb923c; box-shadow: 0 0 0 3px rgba(251,146,60,0.1); }
        .field-input-wrap { position: relative; }
        .field-eye { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6b6860; cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; }
        .field-eye:hover { color: #fb923c; }
        .auth-btn { width: 100%; padding: 0.9rem; background: #fb923c; color: #0f0e0c; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s, transform 0.15s; }
        .auth-btn:hover:not(:disabled) { background: #f97316; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { text-align: center; font-size: 0.875rem; color: #6b6860; margin-top: 1.75rem; }
        .auth-footer a { color: #fb923c; text-decoration: none; font-weight: 600; }
        .auth-footer a:hover { text-decoration: underline; }
        .strength-bar { height: 3px; border-radius: 99px; margin-top: 6px; background: #2a2926; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 99px; transition: width 0.3s, background 0.3s; }
        .auth-right { flex: 1; background: #161512; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; position: relative; overflow: hidden; border-left: 1px solid #1f1e1b; }
        .auth-right-tag { position: absolute; top: 2rem; right: 2rem; background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.2); color: #fb923c; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35rem 0.85rem; border-radius: 999px; }
        .auth-right-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #f5f3f0; text-align: center; margin-top: 2rem; margin-bottom: 0.5rem; font-weight: 600; }
        .auth-right-sub { font-size: 0.85rem; color: #6b6860; text-align: center; line-height: 1.6; max-width: 280px; }
        .feature-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.85rem; width: 100%; max-width: 280px; }
        .feature-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem 1rem; background: #1a1916; border: 1px solid #2a2926; border-radius: 10px; }
        .feature-icon { font-size: 1.1rem; flex-shrink: 0; }
        .feature-text { font-size: 0.82rem; color: #a8a49e; line-height: 1.4; }
        .feature-text strong { color: #f5f3f0; display: block; font-size: 0.87rem; margin-bottom: 1px; }
        @media (max-width: 768px) { .auth-right { display: none; } .auth-left { padding: 2rem 1.75rem; } .auth-heading { font-size: 2rem; } }
      `}</style>

      <div className="auth-root">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-logo">◈ <span>SocialLead</span></div>

          <h1 className="auth-heading">Start for<br /><em>free.</em></h1>
          <p className="auth-subheading">Create your account and start tracking leads across every platform.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input className="field-input" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="field-eye" onClick={() => setShowPass(p => !p)}>{showPass ? "🙈" : "👁"}</button>
              </div>
              {password && (
                <div className="strength-bar">
                  <div className="strength-fill" style={{
                    width: password.length >= 10 ? "100%" : password.length >= 6 ? "55%" : "25%",
                    background: password.length >= 10 ? "#4ade80" : password.length >= 6 ? "#fbbf24" : "#f87171",
                  }}/>
                </div>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <input className="field-input" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <span className="auth-right-tag">Free forever</span>

          <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="160" height="120" rx="14" fill="#1a1916" stroke="#2a2926" strokeWidth="1.5"/>
            <rect x="20" y="30" width="160" height="36" rx="14" fill="#1f1e1b"/>
            <rect x="20" y="54" width="160" height="12" fill="#1f1e1b"/>
            <circle cx="44" cy="48" r="8" fill="#fb923c" opacity="0.9"/>
            <text x="44" y="52" textAnchor="middle" fill="#0f0e0c" fontSize="9" fontWeight="800">◈</text>
            <text x="62" y="52" fill="#f5f3f0" fontSize="10" fontWeight="600">SocialLead</text>

            <rect x="34" y="80" width="60" height="8" rx="4" fill="#2a2926"/>
            <rect x="34" y="95" width="42" height="8" rx="4" fill="#fb923c" opacity="0.6"/>
            <rect x="34" y="110" width="52" height="8" rx="4" fill="#2a2926"/>
            <rect x="34" y="125" width="36" height="8" rx="4" fill="#2a2926"/>

            <rect x="116" y="76" width="48" height="22" rx="8" fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
            <text x="140" y="91" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="700">CONVERTED</text>

            <rect x="116" y="106" width="40" height="22" rx="8" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
            <text x="136" y="121" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="700">NEW</text>

            <circle cx="170" cy="35" r="12" fill="#fb923c">
              <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="170" y="39" textAnchor="middle" fill="#0f0e0c" fontSize="11" fontWeight="800">+</text>
          </svg>

          <h2 className="auth-right-title">Built for creators &amp; businesses</h2>
          <p className="auth-right-sub">Everything you need to turn social connections into real customers.</p>

          <div className="feature-list">
            {[
              { icon: "📊", title: "Lead Dashboard", desc: "See all leads at a glance with live status" },
              { icon: "📅", title: "Follow-up Reminders", desc: "Never let a warm lead go cold" },
              { icon: "📱", title: "Multi-platform", desc: "Instagram, TikTok, LinkedIn and more" },
            ].map(f => (
              <div className="feature-item" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-text"><strong>{f.title}</strong>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}