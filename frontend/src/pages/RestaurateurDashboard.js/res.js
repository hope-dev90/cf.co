import { useState } from "react";
import logo from "../../../src/assets/logo.png";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const ordersData = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 80 },
  { day: "Sun", value: 65 },
];

const staffData = [
  { day: "Mon", value: 80 },
  { day: "Tue", value: 60 },
  { day: "Wed", value: 20 },
  { day: "Thu", value: 10 },
  { day: "Fri", value: 30 },
  { day: "Sat", value: 70 },
  { day: "Sun", value: 55 },
];

const PAST_NOTIFICATIONS = [
  { title: "Kitchen closing early at 9 PM", meta: "Sent to 412 customers · Today, 2:15 PM" },
  { title: "Special: Fresh White Truffle Menu", meta: "Sent to 850 customers · Yesterday, 10:00 AM" },
  { title: "Out of Stock: Wagyu Ribeye", meta: "Sent to active orders · Oct 24, 8:45 PM" },
];

const NAV = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "🍽", label: "Menu", active: false },
  { icon: "📋", label: "Orders", active: false },
  { icon: "🔔", label: "Notifications", active: false },
];

export default function Dashboard() {
  const [message, setMessage] = useState("");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sb { width: 188px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
        .sb-logo { padding: 0 18px 28px; }
        .sb-logo img { width: 54px; height: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13.5px; color: #6b5e52; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: 'Lato', sans-serif; font-weight: 400; transition: background 0.12s; border-radius: 6px; margin: 1px 8px; width: calc(100% - 16px); }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #2a0d0d; color: #fff; font-weight: 700; }
        .nav-icon { font-size: 14px; width: 18px; }

        .sys-status { margin: auto 12px 0; background: #2a0d0d; border-radius: 10px; padding: 14px; }
        .sys-label { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .sys-value { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .new-alert-btn { width: 100%; background: #fff; color: #2a0d0d; border: none; border-radius: 6px; padding: 8px; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .new-alert-btn:hover { opacity: 0.9; }

        .topbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #ede8e2; padding: 0 24px; height: 52px; flex-shrink: 0; }
        .topbar-title { font-size: 14px; color: #1a0f08; font-weight: 400; }
        .topbar-icons { display: flex; gap: 14px; align-items: center; font-size: 18px; color: #6b5e52; }
        .topbar-icon { cursor: pointer; }

        .shell { display: flex; flex: 1; overflow: hidden; }
        .main { flex: 1; overflow-y: auto; padding: 28px 24px; }
        .right { width: 240px; background: #2a0d0d; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }

        .welcome { font-family: 'Lato', sans-serif; font-size: 16px; font-weight: 400; color: #1a0f08; margin-bottom: 20px; }

        .chart-card { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
        .chart-title { font-size: 12.5px; font-weight: 700; color: #1a0f08; margin-bottom: 14px; }

        /* Right panel */
        .broadcast-header { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .broadcast-title { display: flex; align-items: center; gap: 8px; font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 16px; }
        .broadcast-icon { font-size: 20px; }
        .broadcast-label { font-size: 10px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
        .broadcast-textarea { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 12px; font-size: 13px; font-family: 'Lato', sans-serif; color: rgba(255,255,255,0.8); resize: none; min-height: 90px; outline: none; }
        .broadcast-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .broadcast-textarea:focus { border-color: rgba(255,255,255,0.25); }
        .send-btn { width: 100%; background: #c9b9a8; color: #2a0d0d; border: none; border-radius: 8px; padding: 13px; font-size: 13.5px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; margin-top: 14px; transition: background 0.15s; }
        .send-btn:hover { background: #d5c8b8; }
        .send-note { font-size: 10.5px; color: rgba(255,255,255,0.35); margin-top: 10px; line-height: 1.5; text-align: center; }

        .past-section { background: #fff; margin: 0 12px 12px; border-radius: 10px; padding: 16px; }
        .past-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .past-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #1a0f08; }
        .past-period { font-size: 10px; color: #9b8878; font-weight: 400; }
        .notif-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
        .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #4caf50; flex-shrink: 0; margin-top: 4px; }
        .notif-text { font-size: 12.5px; font-weight: 700; color: #1a0f08; margin-bottom: 2px; }
        .notif-meta { font-size: 11px; color: #9b8878; }
        .view-all { text-align: center; font-size: 12px; color: #8b1a1a; font-weight: 700; cursor: pointer; margin-top: 4px; }
        .view-all:hover { opacity: 0.7; }
      `}</style>

      {/* Sidebar */}
      <aside className="sb">
        <div className="sb-logo">
          <img src={logo} alt="C&F" />
        </div>
        {NAV.map((n) => (
          <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
        <div className="sys-status">
          <p className="sys-label">System Status</p>
          <p className="sys-value">Kitchen is Online</p>
          <button className="new-alert-btn">New Alert</button>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">La Paris Management System</span>
          <div className="topbar-icons">
            <span className="topbar-icon">🔔</span>
            <span className="topbar-icon">⚙️</span>
          </div>
        </div>

        <div className="shell">
          {/* Main */}
          <main className="main">
            <p className="welcome">Welcome La Paris owner,</p>

            <div className="chart-card">
              <p className="chart-title">Overview of Orders this Week</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={ordersData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9b8878" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b8878" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #ede8e2" }} />
                  <Line type="monotone" dataKey="value" stroke="#8b1a1a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <p className="chart-title">Over View of Staff's delay</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={staffData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9b8878" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b8878" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #ede8e2" }} />
                  <Line type="monotone" dataKey="value" stroke="#2a0d0d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </main>

          {/* Right panel */}
          <aside className="right">
            <div className="broadcast-header">
              <p className="broadcast-title">
                <span className="broadcast-icon">📢</span>
                Broadcast Alert
              </p>
              <p className="broadcast-label">Message to Customers</p>
              <textarea
                className="broadcast-textarea"
                placeholder="E.g. Kitchen closing early today due to private event..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <button className="send-btn">Send Notification</button>
              <p className="send-note">This alert will be sent to all active diners and app users.</p>
            </div>

            <div style={{ padding: "16px 12px 8px" }}>
              <div className="past-section">
                <div className="past-header">
                  <span className="past-title">🕐 Past Notifications</span>
                  <span className="past-period">Last 30 days</span>
                </div>
                {PAST_NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="notif-item">
                    <div className="notif-dot" />
                    <div>
                      <p className="notif-text">{n.title}</p>
                      <p className="notif-meta">{n.meta}</p>
                    </div>
                  </div>
                ))}
                <p className="view-all">View All History</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}