import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email | reset
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: form.otp, newPassword: form.newPassword });
      navigate("/login", { state: { reset: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#f4efeb", fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        .card { background: #fff; border-radius: 20px; padding: 48px 40px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(42,13,13,0.12); }
        .auth-title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a0f08; margin-bottom: 8px; }
        .auth-sub { font-size: 13px; color: #9b8878; margin-bottom: 32px; line-height: 1.5; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 8px; }
        .form-input { width: 100%; height: 48px; border-radius: 10px; border: 1.5px solid #e0d8ce; padding: 0 16px; font-size: 14px; font-family: 'Lato', sans-serif; color: #1a0f08; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #8b1a1a; }
        .otp-input { width: 100%; height: 64px; border-radius: 12px; border: 2px solid #e0d8ce; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 12px; color: #1a0f08; font-family: 'Lato', sans-serif; outline: none; }
        .otp-input:focus { border-color: #8b1a1a; }
        .submit-btn { width: 100%; height: 50px; background: #2a0d0d; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; transition: opacity 0.15s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { background: #fff0f0; border: 1px solid #e8c0c0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #8b1a1a; margin-bottom: 16px; }
        .back-link { display: block; text-align: center; margin-top: 20px; font-size: 13px; color: #8b1a1a; font-weight: 700; text-decoration: none; }
        .back-link:hover { opacity: 0.7; }
      `}</style>

      <div className="card">
        {step === "email" ? (
          <>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-sub">Enter your email and we'll send you a 6-digit reset code.</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Enter new password</h1>
            <p className="auth-sub">Enter the code sent to <strong>{email}</strong> and your new password.</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input className="otp-input" placeholder="000000" value={form.otp} onChange={(e) => setForm((p) => ({ ...p, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }))} maxLength={6} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
              </div>
              <button type="submit" className="submit-btn" disabled={loading || form.otp.length < 6}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
        <Link to="/login" className="back-link">← Back to login</Link>
      </div>
    </div>
  );
}
