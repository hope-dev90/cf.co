import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await authAPI.resendOtp({ email });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError("Could not resend code. Try again.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#f4efeb", fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        .card { background: #fff; border-radius: 20px; padding: 48px 40px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(42,13,13,0.12); }
        .title { font-family: 'Playfair Display', serif; font-size: 30px; color: #1a0f08; margin-bottom: 8px; }
        .sub { font-size: 13px; color: #9b8878; margin-bottom: 32px; line-height: 1.6; }
        .otp-input { width: 100%; height: 72px; border-radius: 12px; border: 2px solid #e0d8ce; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 14px; color: #1a0f08; font-family: 'Lato', sans-serif; outline: none; transition: border-color 0.15s; }
        .otp-input:focus { border-color: #8b1a1a; }
        .otp-input::placeholder { letter-spacing: 4px; font-size: 20px; color: #c0b0a0; }
        .submit-btn { width: 100%; height: 50px; background: #2a0d0d; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; margin-top: 20px; transition: opacity 0.15s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { background: #fff0f0; border: 1px solid #e8c0c0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #8b1a1a; margin-bottom: 16px; }
        .success-msg { background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #2e7d32; margin-bottom: 16px; }
        .footer { text-align: center; margin-top: 24px; font-size: 13px; color: #9b8878; }
        .resend-btn { background: none; border: none; color: #8b1a1a; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Lato', sans-serif; }
        .resend-btn:hover { opacity: 0.7; }
        .email-badge { display: inline-block; background: #f7f3ef; border: 1px solid #e0d8ce; border-radius: 6px; padding: 3px 10px; font-size: 13px; font-weight: 700; color: #1a0f08; margin: 0 2px; }
      `}</style>

      <div className="card">
        <h1 className="title">Check your email</h1>
        <p className="sub">
          We sent a 6-digit code to <span className="email-badge">{email || "your email"}</span>.<br />
          It expires in 10 minutes.
        </p>

        {error && <div className="error-msg">{error}</div>}
        {resent && <div className="success-msg">✓ New code sent to your email.</div>}

        <form onSubmit={handleVerify}>
          <input
            className="otp-input"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
            autoFocus
          />
          <button type="submit" className="submit-btn" disabled={loading || otp.length < 6}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="footer">
          Didn't receive a code?{" "}
          <button className="resend-btn" onClick={handleResend}>Resend code</button>
        </p>
      </div>
    </div>
  );
}
