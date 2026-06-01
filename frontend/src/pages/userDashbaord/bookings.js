import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { orderAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", path: "/user" },
  { icon: "🍽", label: "Order & Book", path: "/user/order" },
  { icon: "📅", label: "My Bookings", path: "/user/bookings", active: true },
  { icon: "👤", label: "Profile", path: "/user/profile" },
];

const STATUS_COLORS = { pending: "#f59e0b", preparing: "#3b82f6", ready: "#10b981", completed: "#6b7280" };

export default function UserBookings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        .booking-card { background: #fff; border: 1px solid #ede8e2; border-radius: 12px; padding: 20px 24px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .status-badge { font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
        .empty-state { text-align: center; padding: 80px 20px; color: #9b8878; }
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#1a0f08", marginBottom: "8px" }}>My Bookings</h1>
        <p style={{ fontSize: "14px", color: "#9b8878", marginBottom: "32px" }}>Your order and reservation history.</p>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "40px", marginBottom: "16px" }}>📅</p>
            <p style={{ fontWeight: "700", marginBottom: "8px" }}>No bookings yet</p>
            <p style={{ fontSize: "13px" }}>Place your first order to see it here.</p>
            <button onClick={() => navigate("/user/order")} style={{ marginTop: "20px", background: "#2a0d0d", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontFamily: "'Lato', sans-serif", fontWeight: "700", cursor: "pointer" }}>
              Order Now
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="booking-card">
              <div>
                <p style={{ fontWeight: "700", fontSize: "15px", color: "#1a0f08", marginBottom: "4px" }}>Order #{order.id}</p>
                <p style={{ fontSize: "12px", color: "#9b8878" }}>Table {order.table_id} · {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: "800", fontSize: "16px", color: "#1a0f08", marginBottom: "6px" }}>${order.total}.00</p>
                <span className="status-badge" style={{ background: (STATUS_COLORS[order.status] || "#999") + "20", color: STATUS_COLORS[order.status] || "#999" }}>
                  {order.status || "pending"}
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
