import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { orderAPI } from "../../services/api";

const NAV = [
  { icon: "⊞", label: "Dashboard", path: "/restaurateur" },
  { icon: "🍽", label: "Menu", path: "/restaurateur/menu" },
  { icon: "📋", label: "Orders", path: "/restaurateur/orders", active: true },
  { icon: "👥", label: "Staff", path: "/restaurateur/staff" },
];

const STATUS_COLORS = { pending: "#f59e0b", preparing: "#3b82f6", ready: "#10b981", completed: "#6b7280" };
const FILTERS = ["All Orders", "Pending", "Preparing", "Ready", "Completed"];

export default function OrdersDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Orders");

  useEffect(() => {
    orderAPI.getAll().then((res) => {
      setOrders(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "All Orders"
    ? orders
    : orders.filter(o => o.status?.toLowerCase() === activeFilter.toLowerCase());

  const active = orders.filter(o => ["pending", "preparing"].includes(o.status)).length;
  const completed = orders.filter(o => o.status === "completed").length;
  const rate = orders.length ? Math.round((completed / orders.length) * 100) : 0;

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
        .main { flex: 1; overflow-y: auto; padding: 32px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #ede8e2; padding: 0 24px; height: 52px; flex-shrink: 0; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #1a0f08; margin-bottom: 20px; }
        .filter-row { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .filter-btn { border: 1px solid #e0d8ce; background: #fff; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-family: 'Lato', sans-serif; color: #6b5e52; cursor: pointer; }
        .filter-btn.active { background: #2a0d0d; color: #fff; border-color: #2a0d0d; font-weight: 700; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .order-card { background: #fff; border: 1px solid #ede8e2; border-radius: 12px; padding: 18px; }
        .order-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .order-type { font-size: 15px; font-weight: 700; color: #1a0f08; }
        .order-id { font-size: 11px; color: #9b8878; }
        .status-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .order-items { list-style: none; margin-bottom: 14px; }
        .order-items li { font-size: 12.5px; color: #6b5e52; padding: 3px 0; border-bottom: 1px solid #f7f3ef; }
        .order-total { font-size: 15px; font-weight: 800; color: #1a0f08; margin-bottom: 14px; }
        .action-btn { width: 100%; padding: 10px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .action-btn:hover { opacity: 0.85; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; padding: 16px 18px; }
        .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 6px; }
        .stat-value { font-size: 26px; font-weight: 800; color: #1a0f08; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9b8878; }
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
          <span style={{ fontSize: "14px", color: "#1a0f08" }}>Orders Management</span>
        </div>

        <main className="main">
          <h1 className="page-title">Orders Overview</h1>

          <div className="stats-row">
            <div className="stat-card"><p className="stat-label">Active Orders</p><p className="stat-value">{active}</p></div>
            <div className="stat-card"><p className="stat-label">Completion Rate</p><p className="stat-value">{rate}%</p></div>
            <div className="stat-card"><p className="stat-label">Total Orders</p><p className="stat-value">{orders.length}</p></div>
          </div>

          <div className="filter-row">
            {FILTERS.map((f) => (
              <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>📋</p>
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filtered.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <p className="order-type">{order.location || "Takeaway"}</p>
                      <p className="order-id">Order #{order.id}</p>
                    </div>
                    <span className="status-badge" style={{ background: (STATUS_COLORS[order.status] || "#999") + "20", color: STATUS_COLORS[order.status] || "#999" }}>
                      {order.status || "pending"}
                    </span>
                  </div>
                  <ul className="order-items">
                    <li>{order.name} — {order.kgs}kg</li>
                    {order.notes && <li style={{ color: "#9b8878", fontStyle: "italic" }}>{order.notes}</li>}
                  </ul>
                  <p className="order-total">{order.clientcategory}</p>
                  <button className="action-btn">Mark as Ready</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
