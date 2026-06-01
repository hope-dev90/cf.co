import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { restaurantAPI, waiterAPI } from "../../services/api";

const NAV = [
  { icon: "⊞", label: "Dashboard", path: "/restaurateur" },
  { icon: "🍽", label: "Menu", path: "/restaurateur/menu" },
  { icon: "📋", label: "Orders", path: "/restaurateur/orders" },
  { icon: "👥", label: "Staff", path: "/restaurateur/staff", active: true },
];

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    restaurantAPI.getMine().then((res) => {
      if (res.data?.length > 0) {
        const id = res.data[0].id;
        setRestaurantId(id);
        return waiterAPI.getWaiters(id);
      }
    }).then((res) => {
      if (res?.data) setStaff(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    try {
      const res = await waiterAPI.addWaiter(restaurantId, form);
      setStaff((p) => [...p, res.data]);
      setShowModal(false);
      setForm({ name: "", role: "", email: "", phone: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await waiterAPI.deleteWaiter(id);
      setStaff((p) => p.filter((s) => s.id !== id));
    } catch {
      alert("Failed to remove staff member");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sb { width: 188px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
        .sb-logo { padding: 0 18px 28px; cursor: pointer; }
        .sb-logo img { width: 54px; height: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13.5px; color: #6b5e52; cursor: pointer; border: none; background: none; font-family: 'Lato', sans-serif; font-weight: 400; transition: background 0.12s; border-radius: 6px; margin: 1px 8px; width: calc(100% - 16px); text-align: left; }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #2a0d0d; color: #fff; font-weight: 700; }
        .nav-icon { font-size: 14px; width: 18px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #ede8e2; padding: 0 24px; height: 52px; flex-shrink: 0; }
        .main { flex: 1; overflow-y: auto; padding: 32px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #1a0f08; margin-bottom: 6px; }
        .page-sub { font-size: 12.5px; color: #9b8878; margin-bottom: 24px; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; padding: 16px 18px; }
        .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 6px; }
        .stat-value { font-size: 26px; font-weight: 800; color: #1a0f08; }
        .add-btn { display: flex; align-items: center; gap: 8px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .add-btn:hover { opacity: 0.85; }
        .staff-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #ede8e2; }
        .staff-table th { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; padding: 12px 16px; text-align: left; border-bottom: 1px solid #ede8e2; background: #faf8f5; }
        .staff-table td { font-size: 13px; color: #1a0f08; padding: 14px 16px; border-bottom: 1px solid #f7f3ef; }
        .staff-table tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .badge-on { background: #e8f5e9; color: #2e7d32; }
        .badge-off { background: #fff0f0; color: #8b1a1a; }
        .del-btn { background: none; border: none; color: #c0281a; cursor: pointer; font-size: 14px; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9b8878; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; border-radius: 16px; padding: 32px; width: 420px; max-width: 95vw; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #1a0f08; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 6px; }
        .form-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e0d8ce; padding: 0 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: #1a0f08; outline: none; }
        .form-input:focus { border-color: #8b1a1a; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .modal-save { flex: 1; height: 44px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .modal-cancel { flex: 1; height: 44px; background: #fff; color: #6b5e52; border: 1px solid #e0d8ce; border-radius: 8px; font-size: 13px; font-family: 'Lato', sans-serif; cursor: pointer; }
      `}</style>

      <aside className="sb">
        <div className="sb-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="C&F" />
        </div>
        {NAV.map((n) => (
          <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`} onClick={() => navigate(n.path)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </aside>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="topbar">
          <span style={{ fontSize: "14px", color: "#1a0f08" }}>Staff Management</span>
          <button className="add-btn" onClick={() => setShowModal(true)}>⊕ Add Staff</button>
        </div>

        <main className="main">
          <h1 className="page-title">Staff Management</h1>
          <p className="page-sub">Manage your team, roles, and schedules.</p>

          <div className="stats-row">
            <div className="stat-card"><p className="stat-label">Total Staff</p><p className="stat-value">{staff.length}</p></div>
            <div className="stat-card"><p className="stat-label">On Duty</p><p className="stat-value">{staff.filter(s => s.status === "on_duty").length}</p></div>
            <div className="stat-card"><p className="stat-label">Off Duty</p><p className="stat-value">{staff.filter(s => s.status !== "on_duty").length}</p></div>
          </div>

          {loading ? (
            <div className="empty-state">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>👥</p>
              <p>No staff members yet. Add your first team member!</p>
            </div>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: "700" }}>{s.name}</td>
                    <td>{s.role}</td>
                    <td style={{ color: "#9b8878" }}>{s.email}</td>
                    <td style={{ color: "#9b8878" }}>{s.phone}</td>
                    <td>
                      <span className={`badge ${s.status === "on_duty" ? "badge-on" : "badge-off"}`}>
                        {s.status === "on_duty" ? "On Duty" : "Off Duty"}
                      </span>
                    </td>
                    <td><button className="del-btn" onClick={() => handleDelete(s.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Add Staff Member</p>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" placeholder="e.g. Head Waiter" value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="staff@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1 000 000 0000" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-save" disabled={saving}>{saving ? "Saving..." : "Add Member"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
