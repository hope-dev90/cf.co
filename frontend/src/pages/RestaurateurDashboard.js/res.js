import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { restaurantAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ordersData = [
  { day: "Mon", value: 40 }, { day: "Tue", value: 55 }, { day: "Wed", value: 45 },
  { day: "Thu", value: 70 }, { day: "Fri", value: 60 }, { day: "Sat", value: 80 }, { day: "Sun", value: 65 },
];
const staffData = [
  { day: "Mon", value: 80 }, { day: "Tue", value: 60 }, { day: "Wed", value: 20 },
  { day: "Thu", value: 10 }, { day: "Fri", value: 30 }, { day: "Sat", value: 70 }, { day: "Sun", value: 55 },
];

function LineChart({ data, color }) {
  const W = 320, H = 120, padX = 24, padY = 12;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = padY + (1 - (d.value - min) / range) * (H - padY * 2);
    return [x, y];
  });
  const polyline = pts.map(p => p.join(",")).join(" ");
  const areaPath = `M${pts[0][0]},${H - padY} ` +
    pts.map(p => `L${p[0]},${p[1]}`).join(" ") +
    ` L${pts[pts.length - 1][0]},${H - padY} Z`;

  const yLabels = [max, Math.round((max + min) / 2), min];

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map(i => {
          const y = padY + (i / 2) * (H - padY * 2);
          return <line key={i} x1={padX} y1={y} x2={W - padX} y2={y} stroke="#ede8e2" strokeWidth="1" />;
        })}
        <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={pts[i][0]} y={H} fontSize="9" fill="#9b8878" textAnchor="middle">{d.day}</text>
        ))}
        {yLabels.map((v, i) => (
          <text key={i} x={padX - 4} y={padY + (i / 2) * (H - padY * 2) + 3} fontSize="9" fill="#9b8878" textAnchor="end">{v}</text>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [notifications, setNotifications] = useState([
    { title: "Kitchen closing early at 9 PM", meta: "Sent to 412 customers · Today, 2:15 PM", active: true },
    { title: "Special: Fresh White Truffle Menu", meta: "Sent to 850 customers · Yesterday, 10:00 AM", active: true },
    { title: "Out of Stock: Wagyu Ribeye", meta: "Sent to active orders · Oct 24, 8:45 PM", active: false },
  ]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    restaurantAPI.getMine().then((res) => {
      if (res.data?.length > 0) setRestaurant(res.data[0]);
    }).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setNotifications((p) => [{ title: message, meta: `Sent · Just now`, active: true }, ...p]);
    setMessage("");
    setSending(false);
  };

  const NAV = [
    { icon: "⊞", label: "Dashboard", path: "/restaurateur", active: true },
    { icon: "🍽", label: "Menu", path: "/restaurateur/menu", active: false },
    { icon: "📋", label: "Orders", path: "/restaurateur/orders", active: false },
    { icon: "🔔", label: "Notifications", path: "/restaurateur/notifications", active: false },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sb { width: 188px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
        .sb-logo { padding: 0 18px 28px; cursor: pointer; }
        .sb-logo img { width: 54px; height: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13.5px; color: #6b5e52; cursor: pointer; border: none; background: none; width: calc(100% - 16px); text-align: left; font-family: 'Lato', sans-serif; font-weight: 400; transition: background 0.12s; border-radius: 6px; margin: 1px 8px; }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #2a0d0d; color: #fff; font-weight: 700; }
        .nav-icon { font-size: 14px; width: 18px; }
        .sys-status { margin: auto 12px 0; background: #2a0d0d; border-radius: 10px; padding: 14px; }
        .sys-label { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .sys-value { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .new-alert-btn { width: 100%; background: #fff; color: #2a0d0d; border: none; border-radius: 6px; padding: 8px; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .topbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #ede8e2; padding: 0 24px; height: 52px; flex-shrink: 0; }
        .topbar-title { font-size: 14px; color: #1a0f08; font-weight: 400; }
        .topbar-icons { display: flex; gap: 14px; align-items: center; }
        .topbar-icon-btn { background: none; border: none; cursor: pointer; font-size: 20px; color: #6b5e52; padding: 4px; line-height: 1; }
        .shell { display: flex; flex: 1; overflow: hidden; }
        .main { flex: 1; overflow-y: auto; padding: 28px 24px; }
        .right { width: 248px; background: #2a0d0d; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
        .chart-card { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
        .chart-title { font-size: 12.5px; font-weight: 700; color: #1a0f08; margin-bottom: 14px; }
        .broadcast-header { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .broadcast-title { display: flex; align-items: center; gap: 8px; font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 16px; }
        .broadcast-label { font-size: 9px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
        .broadcast-textarea { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: rgba(255,255,255,0.8); resize: none; min-height: 90px; outline: none; }
        .broadcast-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .broadcast-hint { font-size: 10.5px; color: rgba(255,255,255,0.3); margin-top: 10px; line-height: 1.4; }
        .send-btn { width: 100%; background: #c9b9a8; color: #2a0d0d; border: none; border-radius: 8px; padding: 13px; font-size: 13.5px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; margin-top: 14px; transition: background 0.15s; }
        .send-btn:hover:not(:disabled) { background: #d5c8b8; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .past-section { background: #fff; margin: 0 12px 12px; border-radius: 10px; padding: 16px; }
        .past-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .past-title { font-size: 13px; font-weight: 700; color: #1a0f08; }
        .past-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; }
        .notif-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
        .notif-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .notif-dot.active { background: #4caf50; }
        .notif-dot.inactive { background: #c8bfb5; }
        .notif-text { font-size: 12.5px; font-weight: 700; color: #1a0f08; margin-bottom: 2px; }
        .notif-meta { font-size: 11px; color: #9b8878; }
        .view-all { width: 100%; background: none; border: none; color: #8b5e3c; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; text-align: center; padding: 6px 0 2px; }
        .view-all:hover { color: #6b3e22; }
        .logout-btn { background: none; border: none; color: #9b8878; font-size: 12px; font-family: 'Lato', sans-serif; cursor: pointer; padding: 8px 18px; text-align: left; width: 100%; }
        .logout-btn:hover { color: #8b1a1a; }
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
        <button className="logout-btn" onClick={logout}>⬅ Logout</button>
        <div className="sys-status">
          <p className="sys-label">System Status</p>
          <p className="sys-value">Kitchen is Online</p>
          <button className="new-alert-btn">New Alert</button>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="topbar">
          <span className="topbar-title">{restaurant?.name ? `${restaurant.name} Management System` : "Restaurant Management System"}</span>
          <div className="topbar-icons">
            <button className="topbar-icon-btn" aria-label="Notifications">🔔</button>
            <button className="topbar-icon-btn" aria-label="Settings">⚙️</button>
          </div>
        </div>

        <div className="shell">
          <main className="main">
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "16px", color: "#1a0f08", marginBottom: "20px" }}>
              Welcome {restaurant ? `${restaurant.name} owner,` : "👋"}
            </p>

            <div className="chart-card">
              <p className="chart-title">Overview of Orders this Week</p>
              <LineChart data={ordersData} color="#8b1a1a" />
            </div>

            <div className="chart-card">
              <p className="chart-title">Over View of Staff's delay</p>
              <LineChart data={staffData} color="#2a0d0d" />
            </div>
          </main>

          <aside className="right">
            <div className="broadcast-header">
              <p className="broadcast-title"><span>📢</span> Broadcast Alert</p>
              <p className="broadcast-label">Message to Customers</p>
              <textarea
                className="broadcast-textarea"
                placeholder="E.g. Kitchen closing early today due to private event..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <button className="send-btn" onClick={handleSend} disabled={sending || !message.trim()}>
                {sending ? "Sending..." : "Send Notification"}
              </button>
              <p className="broadcast-hint">This alert will be sent to all active diners and app users.</p>
            </div>

            <div style={{ padding: "16px 12px 8px" }}>
              <div className="past-section">
                <div className="past-header">
                  <p className="past-title">🕐 Past Notifications</p>
                  <span className="past-badge">Last 30 days</span>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} className="notif-item">
                    <div className={`notif-dot ${n.active ? "active" : "inactive"}`} />
                    <div>
                      <p className="notif-text">{n.title}</p>
                      <p className="notif-meta">{n.meta}</p>
                    </div>
                  </div>
                ))}
                <button className="view-all">View All History</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}