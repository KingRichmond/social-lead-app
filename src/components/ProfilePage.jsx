// src/components/ProfilePage.jsx
import { useState, useRef } from "react";
import { useAuth } from "../AuthContext";
import {
  updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential
} from "firebase/auth";
import { auth } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const { user } = useAuth();
  const firstName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = firstName[0].toUpperCase();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileRef = useRef();

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarError("Image must be under 2MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
  }

  async function handleAvatarSave() {
    if (!avatarFile) return;
    setAvatarLoading(true); setAvatarError(""); setAvatarSuccess("");
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, avatarFile);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      setAvatarSuccess("Avatar updated!");
      setAvatarFile(null);
    } catch (err) {
      setAvatarError("Failed to upload. Make sure Firebase Storage is enabled.");
    }
    setAvatarLoading(false);
  }

  async function handleNameSave(e) {
    e.preventDefault();
    if (!displayName.trim()) { setNameError("Name can't be empty."); return; }
    setNameLoading(true); setNameError(""); setNameSuccess("");
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setNameSuccess("Display name updated!");
    } catch (err) {
      setNameError("Failed to update name.");
    }
    setNameLoading(false);
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPassError("Passwords don't match."); return; }
    if (newPassword.length < 6) { setPassError("Password must be at least 6 characters."); return; }
    setPassLoading(true); setPassError(""); setPassSuccess("");
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPassSuccess("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") setPassError("Current password is incorrect.");
      else setPassError("Failed to update password. Please try again.");
    }
    setPassLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem",
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
  const cardStyle = {
    background: "#fff", border: "1px solid #ede9e3",
    borderRadius: "16px", padding: "1.75rem",
    fontFamily: "'DM Sans', sans-serif",
  };
  const successStyle = {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#166534", padding: "0.65rem 1rem",
    borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem",
  };
  const errorStyle = {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#dc2626", padding: "0.65rem 1rem",
    borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem",
  };
  const saveBtn = (loading, label) => ({
    padding: "0.75rem 1.5rem", background: "#fb923c",
    color: "#fff", border: "none", borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem",
    fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1, transition: "background 0.15s",
  });

  return (
    <>
      <style>{`
        .pp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem; background: #faf9f7;
          border-bottom: 1px solid #ede9e3;
          position: sticky; top: 0; z-index: 50;
          font-family: 'DM Sans', sans-serif;
        }
        .pp-topbar h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          color: #1a1916; margin: 0; letter-spacing: -0.02em;
        }
        .pp-topbar p { font-size: 0.82rem; color: #a8a49e; margin: 2px 0 0; }
        .pp-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px; }
        .pp-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: #1a1916;
          margin-bottom: 1.25rem;
        }
        .pp-field { margin-bottom: 1rem; }
        .pp-avatar-wrap {
          display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem;
        }
        .pp-avatar-img {
          width: 72px; height: 72px; border-radius: 16px;
          object-fit: cover; border: 2px solid #ede9e3;
        }
        .pp-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 16px;
          background: #fb923c; display: flex; align-items: center;
          justify-content: center; font-size: 1.75rem;
          font-weight: 700; color: #1a1916; flex-shrink: 0;
        }
        .pp-upload-btn {
          padding: 0.55rem 1.1rem; background: #faf9f7;
          border: 1px solid #ede9e3; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
          font-weight: 600; color: #6b6860; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .pp-upload-btn:hover { border-color: #fb923c; color: #fb923c; }
      `}</style>

      <div className="pp-topbar">
        <div>
          <h1>Profile</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="pp-body">

        {/* AVATAR */}
        <div style={cardStyle}>
          <div className="pp-card-title">Profile Photo</div>
          {avatarSuccess && <div style={successStyle}>{avatarSuccess}</div>}
          {avatarError && <div style={errorStyle}>{avatarError}</div>}
          <div className="pp-avatar-wrap">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="pp-avatar-img" />
              : <div className="pp-avatar-placeholder">{initial}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button className="pp-upload-btn" onClick={() => fileRef.current.click()}>
                📷 Choose Photo
              </button>
              <span style={{ fontSize: "0.72rem", color: "#c4bfb9" }}>Max 2MB · JPG or PNG</span>
            </div>
          </div>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleAvatarChange} />
          {avatarFile && (
            <button style={saveBtn(avatarLoading)} onClick={handleAvatarSave} disabled={avatarLoading}>
              {avatarLoading ? "Uploading…" : "Save Photo →"}
            </button>
          )}
        </div>

        {/* DISPLAY NAME */}
        <div style={cardStyle}>
          <div className="pp-card-title">Display Name</div>
          {nameSuccess && <div style={successStyle}>{nameSuccess}</div>}
          {nameError && <div style={errorStyle}>{nameError}</div>}
          <form onSubmit={handleNameSave}>
            <div className="pp-field">
              <label style={labelStyle}>Display Name</label>
              <input style={inputStyle} type="text" value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name" />
            </div>
            <button type="submit" style={saveBtn(nameLoading)} disabled={nameLoading}>
              {nameLoading ? "Saving…" : "Save Name →"}
            </button>
          </form>
        </div>

        {/* PASSWORD */}
        <div style={cardStyle}>
          <div className="pp-card-title">Change Password</div>
          {passSuccess && <div style={successStyle}>{passSuccess}</div>}
          {passError && <div style={errorStyle}>{passError}</div>}
          <form onSubmit={handlePasswordSave}>
            <div className="pp-field">
              <label style={labelStyle}>Current Password</label>
              <input style={inputStyle} type="password" value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <div className="pp-field">
              <label style={labelStyle}>New Password</label>
              <input style={inputStyle} type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" required />
            </div>
            <div className="pp-field">
              <label style={labelStyle}>Confirm New Password</label>
              <input style={inputStyle} type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" required />
            </div>
            <button type="submit" style={saveBtn(passLoading)} disabled={passLoading}>
              {passLoading ? "Updating…" : "Update Password →"}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}