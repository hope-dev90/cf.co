import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.register(form);
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#f4efeb", fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        .auth-card { display: flex; width: 860px; max-width: 95vw; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(42,13,13,0.15); }
        .auth-img { width: 40%; object-fit: cover; display: block; }
        .auth-form-side { width: 60%; background: #fff; padding: 48px 40px; display: flex; flex-direction: column; justify-content: center; }
        .auth-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a0f08; margin-bottom: 8px; }
        .auth-sub { font-size: 13px; color: #9b8878; margin-bottom: 32px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 8px; }
        .form-input { width: 100%; height: 48px; border-radius: 10px; border: 1.5px solid #e0d8ce; padding: 0 16px; font-size: 14px; font-family: 'Lato', sans-serif; color: #1a0f08; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #8b1a1a; }
        .form-input::placeholder { color: #c0b0a0; }
        .form-select { width: 100%; height: 48px; border-radius: 10px; border: 1.5px solid #e0d8ce; padding: 0 16px; font-size: 14px; font-family: 'Lato', sans-serif; color: #1a0f08; outline: none; background: #fff; cursor: pointer; }
        .submit-btn { width: 100%; height: 50px; background: #2a0d0d; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; transition: opacity 0.15s; margin-top: 8px; }
        .submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { background: #fff0f0; border: 1px solid #e8c0c0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #8b1a1a; margin-bottom: 16px; }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 13px; color: #9b8878; }
        .auth-footer a { color: #8b1a1a; font-weight: 700; text-decoration: none; }
        @media (max-width: 640px) { .auth-img { display: none; } .auth-form-side { width: 100%; padding: 32px 24px; } }
      `}</style>

      <div className="auth-card">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Food" className="auth-img" />
        <div className="auth-form-side">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join C&F — smart dining, seamless service</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
            </div>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <select className="form-select" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="client">Customer</option>
                <option value="restaurateur">Restaurant Owner</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
