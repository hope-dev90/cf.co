import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", path: "/user", active: true },
  { icon: "🍽", label: "Order & Book", path: "/user/order" },
  { icon: "📅", label: "My Bookings", path: "/user/bookings" },
  { icon: "👤", label: "Profile", path: "/user/profile" },
];

export default function UserHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        .action-card { background: #fff; border: 1px solid #ede8e2; border-radius: 16px; padding: 28px; cursor: pointer; transition: box-shadow 0.15s; }
        .action-card:hover { box-shadow: 0 4px 20px rgba(42,13,13,0.10); }
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#1a0f08", marginBottom: "8px" }}>
          Welcome back, {user?.name || user?.email} 👋
        </h1>
        <p style={{ fontSize: "14px", color: "#9b8878", marginBottom: "40px" }}>What would you like to do today?</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div className="action-card" onClick={() => navigate("/user/order")}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🍽</div>
            <p style={{ fontWeight: "700", fontSize: "16px", color: "#1a0f08", marginBottom: "6px" }}>Order & Book</p>
            <p style={{ fontSize: "13px", color: "#9b8878" }}>Browse the menu and reserve a table</p>
          </div>
          <div className="action-card" onClick={() => navigate("/user/bookings")}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>📅</div>
            <p style={{ fontWeight: "700", fontSize: "16px", color: "#1a0f08", marginBottom: "6px" }}>My Bookings</p>
            <p style={{ fontSize: "13px", color: "#9b8878" }}>View and manage your reservations</p>
          </div>
          <div className="action-card" onClick={() => navigate("/user/profile")}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>👤</div>
            <p style={{ fontWeight: "700", fontSize: "16px", color: "#1a0f08", marginBottom: "6px" }}>Profile</p>
            <p style={{ fontSize: "13px", color: "#9b8878" }}>Update your account details</p>
          </div>
        </div>
      </main>
    </div>
  );
}
