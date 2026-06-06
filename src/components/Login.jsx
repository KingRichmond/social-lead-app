import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0f0e0c;
        }

        /* LEFT PANEL */
        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 4rem;
          background: #0f0e0c;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%);
          bottom: -80px; right: 20px;
          pointer-events: none;
        }

        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: #fb923c;
          letter-spacing: -0.01em;
          margin-bottom: 3.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auth-logo span { color: #fff; }

        .auth-heading {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .auth-heading em {
          font-style: italic;
          color: #fb923c;
        }

        .auth-subheading {
          font-size: 0.95rem;
          color: #6b6860;
          margin-bottom: 2.5rem;
          font-weight: 300;
          line-height: 1.6;
        }

        .auth-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .field-group {
          margin-bottom: 1.1rem;
          position: relative;
        }
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b6860;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }
        .field-input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: #1a1916;
          border: 1px solid #2a2926;
          border-radius: 10px;
          color: #f5f3f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #3a3835; }
        .field-input:focus {
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
        }
        .field-input-wrap { position: relative; }
        .field-eye {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b6860;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
        }
        .field-eye:hover { color: #fb923c; }

        .auth-btn {
          width: 100%;
          padding: 0.9rem;
          background: #fb923c;
          color: #0f0e0c;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .auth-btn:hover:not(:disabled) {
          background: #f97316;
          transform: translateY(-1px);
        }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #2a2926;
          font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #2a2926;
        }
        .auth-divider span { color: #6b6860; white-space: nowrap; }

        .auth-footer {
          text-align: center;
          font-size: 0.875rem;
          color: #6b6860;
          margin-top: 1.75rem;
        }
        .auth-footer a {
          color: #fb923c;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-footer a:hover { text-decoration: underline; }

        /* RIGHT PANEL */
        .auth-right {
          flex: 1;
          background: #161512;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
          border-left: 1px solid #1f1e1b;
        }

        .auth-right-tag {
          position: absolute;
          top: 2rem; right: 2rem;
          background: rgba(251,146,60,0.12);
          border: 1px solid rgba(251,146,60,0.2);
          color: #fb923c;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
        }

        .auth-right-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #f5f3f0;
          text-align: center;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .auth-right-sub {
          font-size: 0.85rem;
          color: #6b6860;
          text-align: center;
          line-height: 1.6;
          max-width: 280px;
        }

        .auth-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
        }
        .auth-pill {
          background: #1f1e1b;
          border: 1px solid #2a2926;
          color: #a8a49e;
          font-size: 0.78rem;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-weight: 500;
        }
        .auth-pill.active {
          background: rgba(251,146,60,0.12);
          border-color: rgba(251,146,60,0.3);
          color: #fb923c;
        }

        @media (max-width: 768px) {
          .auth-right { display: none; }
          .auth-left { padding: 2rem 1.75rem; }
          .auth-heading { font-size: 2rem; }
        }
      `}</style>

      <div className="auth-root">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-logo">◈ <span>SocialLead</span>
          </div>

          <h1 className="auth-heading">Welcome<br /><em>back.</em></h1>
          <p className="auth-subheading">Track your leads, close more deals.<br />Sign in to your workspace.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="field-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="auth-divider"><span>don't have an account?</span></div>

          <p className="auth-footer">
            <Link to="/register">Create a free account</Link>
          </p>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <span className="auth-right-tag">Social CRM</span>

          <svg width="280" height="260" viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Central node */}
            <circle cx="140" cy="130" r="28" fill="#1f1e1b" stroke="#fb923c" strokeWidth="2"/>
            <text x="140" y="135" textAnchor="middle" fill="#fb923c" fontSize="18">◈</text>

            {/* Orbit ring */}
            <circle cx="140" cy="130" r="75" stroke="#2a2926" strokeWidth="1" strokeDasharray="4 6"/>

            {/* Satellite nodes */}
            <circle cx="140" cy="55" r="18" fill="#1f1e1b" stroke="#2a2926" strokeWidth="1.5"/>
            <text x="140" y="60" textAnchor="middle" fill="#6b6860" fontSize="14">📸</text>

            <circle cx="208" cy="168" r="18" fill="#1f1e1b" stroke="#2a2926" strokeWidth="1.5"/>
            <text x="208" y="173" textAnchor="middle" fill="#6b6860" fontSize="14">💼</text>

            <circle cx="72" cy="168" r="18" fill="#1f1e1b" stroke="#2a2926" strokeWidth="1.5"/>
            <text x="72" y="173" textAnchor="middle" fill="#6b6860" fontSize="14">🐦</text>

            <circle cx="72" cy="92" r="14" fill="#1f1e1b" stroke="#2a2926" strokeWidth="1.5"/>
            <text x="72" y="97" textAnchor="middle" fill="#6b6860" fontSize="11">🎵</text>

            <circle cx="208" cy="92" r="14" fill="#1f1e1b" stroke="#2a2926" strokeWidth="1.5"/>
            <text x="208" y="97" textAnchor="middle" fill="#6b6860" fontSize="11">📘</text>

            {/* Connection lines */}
            <line x1="140" y1="102" x2="140" y2="73" stroke="#2a2926" strokeWidth="1"/>
            <line x1="163" y1="147" x2="193" y2="153" stroke="#2a2926" strokeWidth="1"/>
            <line x1="117" y1="147" x2="87" y2="153" stroke="#2a2926" strokeWidth="1"/>
            <line x1="120" y1="112" x2="84" y2="99" stroke="#1f1e1b" strokeWidth="1"/>
            <line x1="160" y1="112" x2="196" y2="99" stroke="#1f1e1b" strokeWidth="1"/>

            {/* Status badges floating */}
            <rect x="155" y="42" width="52" height="20" rx="10" fill="rgba(251,146,60,0.15)" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
            <text x="181" y="56" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">CONVERTED</text>

            <rect x="218" y="178" width="40" height="20" rx="10" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" strokeWidth="1"/>
            <text x="238" y="192" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">NEW</text>

            <rect x="14" y="178" width="46" height="20" rx="10" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
            <text x="37" y="192" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">CONTACTED</text>

            {/* Animated pulse on center */}
            <circle cx="140" cy="130" r="35" stroke="#fb923c" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="35;50;35" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
            </circle>
          </svg>

          <h2 className="auth-right-title">All your leads, one place</h2>
          <p className="auth-right-sub">Track across Instagram, LinkedIn, TikTok and more. Never miss a follow-up.</p>

          <div className="auth-pills">
            <span className="auth-pill active">📊 Lead Tracking</span>
            <span className="auth-pill">📅 Follow-ups</span>
            <span className="auth-pill">🔁 Status Flow</span>
            <span className="auth-pill">📱 Multi-platform</span>
          </div>
        </div>
      </div>
    </>
  );
}