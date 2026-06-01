import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", path: "/user" },
  { icon: "🍽", label: "Order & Book", path: "/user/order" },
  { icon: "📅", label: "My Bookings", path: "/user/bookings" },
  { icon: "👤", label: "Profile", path: "/user/profile", active: true },
];

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [step, setStep] = useState("idle"); // idle | otp_sent | done
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true); setError("");
    try {
      await authAPI.forgotPassword({ email: user?.email });
      setStep("otp_sent");
      setMessage("OTP sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await authAPI.resetPassword({ email: user?.email, otp: form.otp, newPassword: form.newPassword });
      setStep("done");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sidebar { width: 200px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 28px 0; flex-shrink: 0; }
        .sidebar-logo { padding: 0 20px 28px; cursor: pointer; }
        .sidebar-logo img { width: 52px; height: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; font-size: 13.5px; color: #6b5e52; cursor: pointer; transition: background 0.15s; font-family: 'Lato', sans-serif; font-weight: 400; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #2a0d0d; color: #fff; font-weight: 700; }
        .nav-icon { font-size: 15px; width: 20px; }
        .logout-btn { background: none; border: none; color: #9b8878; font-size: 12px; font-family: 'Lato', sans-serif; cursor: pointer; padding: 12px 20px; text-align: left; width: 100%; margin-top: auto; }
        .logout-btn:hover { color: #8b1a1a; }
        .main { flex: 1; overflow-y: auto; padding: 40px 48px; }
        .card { background: #fff; border: 1px solid #ede8e2; border-radius: 16px; padding: 28px; max-width: 480px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 6px; }
        .form-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e0d8ce; padding: 0 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: #1a0f08; outline: none; }
        .form-input:focus { border-color: #8b1a1a; }
        .submit-btn { width: 100%; height: 46px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .msg.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
        .msg.error { background: #fff0f0; color: #8b1a1a; border: 1px solid #e8c0c0; }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="C&F logo" />
        </div>
        {NAV_ITEMS.map((item) => (
          <button key={item.label} className={`nav-item ${item.active ? "active" : ""}`} onClick={() => navigate(item.path)}>
            <span className="nav-icon">{item.icon}</span>{item.label}
          </button>
        ))}
        <button className="logout-btn" onClick={logout}>⬅ Logout</button>
      </aside>

      <main className="main">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#1a0f08", marginBottom: "8px" }}>Profile</h1>
        <p style={{ fontSize: "14px", color: "#9b8878", marginBottom: "32px" }}>Manage your account settings.</p>

        <div className="card" style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "15px", color: "#1a0f08", marginBottom: "16px" }}>Account Info</p>
          <p style={{ fontSize: "13px", color: "#6b5e52", marginBottom: "6px" }}>Name: <strong>{user?.name || "—"}</strong></p>
          <p style={{ fontSize: "13px", color: "#6b5e52", marginBottom: "6px" }}>Email: <strong>{user?.email}</strong></p>
          <p style={{ fontSize: "13px", color: "#6b5e52" }}>Role: <strong style={{ textTransform: "capitalize" }}>{user?.role}</strong></p>
        </div>

        <div className="card">
          <p style={{ fontWeight: "700", fontSize: "15px", color: "#1a0f08", marginBottom: "16px" }}>Change Password</p>

          {message && <div className="msg success">{message}</div>}
          {error && <div className="msg error">{error}</div>}

          {step === "idle" && (
            <button className="submit-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP to Email"}
            </button>
          )}

          {step === "otp_sent" && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input className="form-input" placeholder="6-digit code" value={form.otp} onChange={(e) => setForm(p => ({ ...p, otp: e.target.value }))} required maxLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.newPassword} onChange={(e) => setForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {step === "done" && (
            <button className="submit-btn" onClick={() => setStep("idle")}>Change Password Again</button>
          )}
        </div>
      </main>
    </div>
  );
}
