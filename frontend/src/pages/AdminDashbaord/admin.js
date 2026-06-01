import { useState } from "react";
import logo from "../../../src/assets/logo.png";

const CUISINES = ["Select Cuisine", "Italian", "French", "Japanese", "American", "Mediterranean", "Asian Fusion"];

const DEFAULT_HOURS = [
  { open: "09:00 AM", close: "10:00 PM" },
  { open: "10:00 AM", close: "11:30 PM" },
  { open: "10:00 AM", close: "08:30 PM" },
];

const NAV_MAIN = [
  { icon: "⊞", label: "Dashboard", active: false },
  { icon: "🍽", label: "Restaurants", active: true },
  { icon: "📋", label: "Orders", active: false },
  { icon: "📊", label: "Analytics", active: false },
];

const NAV_ACCOUNT = [
  { icon: "⚙", label: "Settings", active: false },
  { icon: "💬", label: "Support", active: false },
];

export default function RegisterRestaurant() {
  const [form, setForm] = useState({
    name: "", cuisine: "Select Cuisine", email: "", phone: "", description: "",
    address: "", city: "", country: "", postal: "",
  });
  const [hours, setHours] = useState(DEFAULT_HOURS);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Sidebar ── */
        .sb { width: 192px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; overflow-y: auto; }
        .sb-logo { display: flex; align-items: center; gap: 8px; padding: 0 18px 24px; }
        .sb-logo img { width: 36px; height: auto; }
        .sb-logo span { font-family: 'Lato', sans-serif; font-size: 17px; font-weight: 700; color: #1a0f08; }
        .sb-group-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #b0a090; padding: 10px 18px 6px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; font-size: 13px; color: #6b5e52; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: 'Lato', sans-serif; transition: background 0.12s; border-radius: 6px; margin: 1px 8px; width: calc(100% - 16px); }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #f0e8e0; color: #8b1a1a; font-weight: 700; }
        .nav-icon { font-size: 14px; width: 18px; }

        /* ── Topbar ── */
        .topbar { display: flex; align-items: center; gap: 0; background: #fff; border-bottom: 1px solid #ede8e2; padding: 0 28px; height: 52px; flex-shrink: 0; }
        .topbar-logo { display: flex; align-items: center; gap: 8px; margin-right: 28px; }
        .topbar-logo img { width: 28px; }
        .topbar-logo span { font-weight: 700; font-size: 15px; color: #1a0f08; }
        .topbar-nav { display: flex; align-items: center; gap: 4px; flex: 1; }
        .topbar-nav-item { padding: 6px 14px; font-size: 13px; color: #6b5e52; cursor: pointer; border-bottom: 2px solid transparent; font-family: 'Lato', sans-serif; }
        .topbar-nav-item.active { color: #8b1a1a; font-weight: 700; border-bottom-color: #8b1a1a; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .topbar-user { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1a0f08; font-weight: 400; }
        .topbar-avatar { width: 30px; height: 30px; border-radius: 50%; background: #c9b9a8; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
        .order-btn { background: #2a0d0d; color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .order-btn:hover { opacity: 0.85; }

        /* ── Layout ── */
        .shell { display: flex; flex: 1; overflow: hidden; }
        .content { flex: 1; overflow-y: auto; padding: 32px 28px; }
        .right-panel { width: 220px; background: #fff; border-left: 1px solid #ede8e2; padding: 24px 18px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }

        /* ── Page header ── */
        .page-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1a0f08; margin-bottom: 6px; }
        .page-sub { font-size: 12.5px; color: #9b8878; line-height: 1.5; max-width: 360px; margin-bottom: 20px; }
        .header-actions { display: flex; gap: 10px; position: absolute; top: 32px; right: 248px; }
        .cancel-btn { background: none; border: 1px solid #c9b9a8; border-radius: 6px; padding: 8px 18px; font-size: 13px; font-family: 'Lato', sans-serif; color: #6b5e52; cursor: pointer; }
        .cancel-btn:hover { background: #f7f3ef; }
        .quick-save-btn { background: #2a0d0d; color: #fff; border: none; border-radius: 6px; padding: 8px 18px; font-size: 13px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .quick-save-btn:hover { opacity: 0.85; }

        /* ── Cards ── */
        .card { background: #fff; border: 1px solid #ede8e2; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .card-title { display: flex; align-items: center; gap: 8px; font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700; color: #1a0f08; margin-bottom: 18px; }
        .card-icon { font-size: 16px; }

        /* ── Form elements ── */
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-label { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; }
        .form-input { border: 1px solid #e0d8ce; border-radius: 6px; padding: 9px 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: #1a0f08; background: #fff; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #8b1a1a; }
        .form-input::placeholder { color: #c0b0a0; }
        .form-select { border: 1px solid #e0d8ce; border-radius: 6px; padding: 9px 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: #1a0f08; background: #fff; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239b8878' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
        .form-textarea { border: 1px solid #e0d8ce; border-radius: 6px; padding: 9px 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: #1a0f08; background: #fff; outline: none; resize: vertical; min-height: 72px; width: 100%; transition: border-color 0.15s; }
        .form-textarea:focus { border-color: #8b1a1a; }
        .form-textarea::placeholder { color: #c0b0a0; }

        /* ── Two-column card layout ── */
        .cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

        /* ── Operating hours ── */
        .hours-grid { display: flex; flex-direction: column; gap: 10px; }
        .hours-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hours-time { border: 1px solid #e0d8ce; border-radius: 6px; padding: 8px 10px; font-size: 12px; font-family: 'Lato', sans-serif; color: #1a0f08; text-align: center; background: #fff; outline: none; width: 100%; }
        .hours-actions { display: flex; gap: 8px; margin-top: 4px; }
        .hours-action-btn { flex: 1; padding: 7px; font-size: 11px; font-family: 'Lato', sans-serif; font-weight: 700; border-radius: 6px; cursor: pointer; letter-spacing: 0.3px; }
        .copy-btn { background: #f7f3ef; border: 1px solid #e0d8ce; color: #6b5e52; }
        .closed-btn { background: #fff0f0; border: 1px solid #e8c0c0; color: #8b1a1a; }

        /* ── Map placeholder ── */
        .map-placeholder { background: #e8e0d8; border-radius: 8px; height: 110px; display: flex; align-items: center; justify-content: center; margin-top: 14px; position: relative; overflow: hidden; }
        .map-bg { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px); }
        .verify-btn { position: relative; background: #fff; border: none; border-radius: 20px; padding: 8px 18px; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; color: #1a0f08; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 6px; }

        /* ── Right panel ── */
        .finalize-card { background: #2a0d0d; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .finalize-icon { font-size: 22px; text-align: center; }
        .finalize-title { font-family: 'Playfair Display', serif; font-size: 15px; color: #fff; font-weight: 700; text-align: center; }
        .finalize-sub { font-size: 11px; color: rgba(255,255,255,0.6); text-align: center; line-height: 1.5; }
        .register-btn { background: #fff; color: #2a0d0d; border: none; border-radius: 7px; padding: 11px; font-size: 12.5px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; width: 100%; transition: opacity 0.15s; }
        .register-btn:hover { opacity: 0.9; }
        .draft-btn { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 7px; padding: 9px; font-size: 12px; font-family: 'Lato', sans-serif; cursor: pointer; width: 100%; transition: background 0.15s; }
        .draft-btn:hover { background: rgba(255,255,255,0.08); }

        .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
        .page-header-actions { display: flex; gap: 10px; align-items: center; }
      `}</style>

      {/* Sidebar */}
      <aside className="sb">
        <div className="sb-logo">
          <img src={logo} alt="C&F" />
          <span>C&amp;F</span>
        </div>
        <p className="sb-group-label">Management</p>
        {NAV_MAIN.map((n) => (
          <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
        <p className="sb-group-label" style={{ marginTop: 16 }}>Account</p>
        {NAV_ACCOUNT.map((n) => (
          <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </aside>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-logo">
            <img src={logo} alt="C&F" />
            <span>C&amp;F</span>
          </div>
          <div className="topbar-nav">
            {["Dashboard", "Restaurants", "Orders", "Analytics"].map((t) => (
              <span key={t} className={`topbar-nav-item ${t === "Restaurants" ? "active" : ""}`}>{t}</span>
            ))}
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">A</div>
              Admin Pearl
            </div>
            <button className="order-btn">Order Now</button>
          </div>
        </div>

        <div className="shell">
          {/* Main content */}
          <main className="content">
            <div className="page-header-row">
              <div>
                <h1 className="page-title">Register New Restaurant</h1>
                <p className="page-sub">Establish a new culinary destination within the C&amp;F portfolio. Please provide precise details to ensure our heritage standards are maintained.</p>
              </div>
              <div className="page-header-actions">
                <button className="cancel-btn">Cancel</button>
                <button className="quick-save-btn">Quick Save</button>
              </div>
            </div>

            {/* Row 1: Identity + Operating Hours */}
            <div className="cards-row">
              {/* Identity & Contact */}
              <div className="card">
                <p className="card-title"><span className="card-icon">◎</span> Identity &amp; Contact</p>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Restaurant Name</label>
                    <input className="form-input" placeholder="e.g. The Heritage" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cuisine Type</label>
                    <select className="form-select" value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)}>
                      {CUISINES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input className="form-input" placeholder="email@restaurant.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+1 000 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea className="form-textarea" placeholder="Describe your restaurant..." value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="card">
                <p className="card-title"><span className="card-icon">🕐</span> Operating Hours</p>
                <div className="hours-grid">
                  {hours.map((h, i) => (
                    <div key={i} className="hours-row">
                      <input className="hours-time" value={h.open} onChange={(e) => {
                        const next = [...hours]; next[i] = { ...next[i], open: e.target.value }; setHours(next);
                      }} />
                      <input className="hours-time" value={h.close} onChange={(e) => {
                        const next = [...hours]; next[i] = { ...next[i], close: e.target.value }; setHours(next);
                      }} />
                    </div>
                  ))}
                </div>
                <div className="hours-actions" style={{ marginTop: 14 }}>
                  <button className="hours-action-btn copy-btn">COPY TO ALL</button>
                  <button className="hours-action-btn closed-btn">MARK CLOSED</button>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <p className="card-title"><span className="card-icon">📍</span> Location</p>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Full Address</label>
                <input className="form-input" placeholder="Street address here" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" placeholder="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input className="form-input" placeholder="00000" value={form.postal} onChange={(e) => set("postal", e.target.value)} />
                </div>
              </div>
              <div className="map-placeholder">
                <div className="map-bg" />
                <button className="verify-btn">✔ Verify Location</button>
              </div>
            </div>
          </main>

          {/* Right panel */}
          <aside className="right-panel">
            <div className="finalize-card">
              <div className="finalize-icon">🛡</div>
              <p className="finalize-title">Finalize Registration</p>
              <p className="finalize-sub">Review all information before submitting to the Heritage Registry.</p>
              <button className="register-btn">Register Restaurant</button>
              <button className="draft-btn">Save as Draft</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}