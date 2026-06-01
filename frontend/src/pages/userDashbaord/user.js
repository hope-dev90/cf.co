import { useState } from "react";
import logo from "../../../src/assets/logo.png";

const TABLES = [
  { id: 4, label: "Table 4", sub: "Window Side, 2 Seats", tag: "POPULAR" },
  { id: 12, label: "Table 12", sub: "Main Hall, 4 Seats", tag: "BEST BET" },
  { id: 8, label: "Table 8", sub: "Booth Seat, 6 Seats", tag: "POPULAR" },
];

const MENU_ITEMS = [
  {
    id: 1,
    name: "Heritage Scallops",
    desc: "Pan-seared scallops, mint pea puree, crispy pancetta, and citrus reduction",
    price: 28,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=80",
  },
  {
    id: 2,
    name: "Truffle Beef Carpaccio",
    desc: "Aged beef, black truffle shavings, parmesan reggiano, and wild arugula",
    price: 34,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=120&q=80",
  },
  {
    id: 3,
    name: "Hot Sweet Burger",
    desc: "Order now and enjoy your life more than you think",
    price: 89,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&q=80",
  },
];

const BOOKING_FEE = 10;

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", active: false },
  { icon: "✕", label: "Order & Book", active: true },
  { icon: "📅", label: "My Bookings", active: false },
  { icon: "👤", label: "Profile", active: false },
];

export default function OrderBook() {
  const [selectedTable, setSelectedTable] = useState(12);
  const [orderItems, setOrderItems] = useState({
    1: 0,
    2: 1,
    3: 0,
  });

  const selectedItems = MENU_ITEMS.filter((m) => orderItems[m.id] > 0);
  const subtotal = selectedItems.reduce((sum, m) => sum + m.price * orderItems[m.id], 0);
  const grandTotal = subtotal + (subtotal > 0 ? BOOKING_FEE : 0);
  const tableInfo = TABLES.find((t) => t.id === selectedTable);

  const increment = (id) => setOrderItems((p) => ({ ...p, [id]: p[id] + 1 }));
  const decrement = (id) => setOrderItems((p) => ({ ...p, [id]: Math.max(0, p[id] - 1) }));
  const addToOrder = (id) => increment(id);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Sidebar */
        .sidebar {
          width: 200px;
          background: #fff;
          border-right: 1px solid #ede8e2;
          display: flex;
          flex-direction: column;
          padding: 28px 0;
          flex-shrink: 0;
        }
        .sidebar-logo {
          padding: 0 20px 28px;
        }
        .sidebar-logo img { width: 52px; height: auto; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          font-size: 13.5px;
          color: #6b5e52;
          cursor: pointer;
          border-radius: 0;
          transition: background 0.15s;
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active {
          background: #2a0d0d;
          color: #fff;
          font-weight: 700;
          border-radius: 0;
        }
        .nav-icon { font-size: 15px; width: 20px; }

        /* Main */
        .main {
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px;
        }

        /* Top bar */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .topbar-title {
          font-family: 'Lato', sans-serif;
          font-size: 15px;
          color: #6b5e52;
          font-weight: 400;
        }
        .location-select {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #c9b9a8;
          border-radius: 20px;
          padding: 7px 16px;
          font-size: 13px;
          font-family: 'Lato', sans-serif;
          color: #2a0d0d;
          background: #fff;
          cursor: pointer;
          font-weight: 400;
        }

        /* Table select */
        .section-label {
          font-family: 'Lato', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #8b1a1a;
          margin-bottom: 16px;
        }
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 32px;
        }
        .table-card {
          background: #fff;
          border: 1.5px solid #e8e0d8;
          border-radius: 10px;
          padding: 14px 14px 12px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          position: relative;
        }
        .table-card.selected {
          border-color: #2a0d0d;
          box-shadow: 0 2px 12px rgba(42,13,13,0.10);
        }
        .table-card:hover { border-color: #c9b9a8; }
        .table-tag {
          position: absolute;
          top: 10px; right: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: #f7f3ef;
          color: #8b1a1a;
          padding: 2px 7px;
          border-radius: 20px;
          border: 1px solid #e8d5c8;
        }
        .table-tag.selected-tag {
          background: #2a0d0d;
          color: #fff;
          border-color: #2a0d0d;
        }
        .table-name {
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1a0f08;
          margin-bottom: 3px;
        }
        .table-sub {
          font-size: 11px;
          color: #9b8878;
          margin-bottom: 12px;
        }
        .table-btn {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: none;
          font-size: 12px;
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .table-btn.select-btn {
          background: #2a0d0d;
          color: #fff;
        }
        .table-btn.deselect-btn {
          background: #fff;
          color: #2a0d0d;
          border: 1.5px solid #2a0d0d;
        }
        .table-btn:hover { opacity: 0.85; }

        /* Menu */
        .menu-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a0f08;
          margin-bottom: 16px;
        }
        .menu-item {
          background: #fff;
          border: 1px solid #ede8e2;
          border-radius: 10px;
          display: flex;
          gap: 14px;
          padding: 14px;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .menu-img {
          width: 90px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .menu-info { flex: 1; }
        .menu-name {
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #8b1a1a;
          margin-bottom: 4px;
        }
        .menu-desc {
          font-size: 12px;
          color: #9b8878;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .menu-price {
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1a0f08;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .menu-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
        }
        .add-btn {
          background: none;
          border: none;
          color: #8b1a1a;
          font-size: 12px;
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
        }
        .add-btn:hover { opacity: 0.7; }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .qty-btn {
          width: 24px; height: 24px;
          border-radius: 50%;
          border: 1.5px solid #2a0d0d;
          background: #fff;
          color: #2a0d0d;
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          line-height: 1;
          transition: background 0.12s;
        }
        .qty-btn.plus { background: #2a0d0d; color: #fff; }
        .qty-btn:hover { opacity: 0.8; }
        .qty-num {
          font-size: 14px;
          font-weight: 700;
          color: #1a0f08;
          min-width: 16px;
          text-align: center;
        }

        /* Summary panel */
        .summary {
          width: 240px;
          background: #fff;
          border-left: 1px solid #ede8e2;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .summary-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #8b1a1a;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        .summary-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #9b8878;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .summary-table-card {
          background: #f7f3ef;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .summary-table-info { flex: 1; }
        .summary-table-name {
          font-size: 13px;
          font-weight: 700;
          color: #1a0f08;
        }
        .summary-table-sub {
          font-size: 11px;
          color: #9b8878;
          margin-top: 2px;
        }
        .summary-table-icon { font-size: 18px; }
        .summary-items { margin-bottom: 20px; }
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          gap: 8px;
        }
        .summary-item-info { flex: 1; }
        .summary-item-name {
          font-size: 12px;
          font-weight: 700;
          color: #1a0f08;
        }
        .summary-item-sub {
          font-size: 11px;
          color: #9b8878;
        }
        .summary-item-price {
          font-size: 12px;
          font-weight: 700;
          color: #1a0f08;
          white-space: nowrap;
        }
        .summary-divider {
          border: none;
          border-top: 1px solid #ede8e2;
          margin: 16px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: #6b5e52;
          margin-bottom: 6px;
        }
        .summary-row.total {
          font-weight: 700;
          color: #1a0f08;
          font-size: 14px;
          margin-top: 4px;
        }
        .confirm-btn {
          margin-top: 20px;
          width: 100%;
          background: #2a0d0d;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .confirm-btn:hover { opacity: 0.85; }
        .confirm-note {
          font-size: 10px;
          color: #9b8878;
          text-align: center;
          margin-top: 10px;
          line-height: 1.4;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="C&F logo" />
        </div>
        {NAV_ITEMS.map((item) => (
          <button key={item.label} className={`nav-item ${item.active ? "active" : ""}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Top bar */}
        <div className="topbar">
          <span className="topbar-title">Reservations and Dining</span>
          <div className="location-select">La Paris ▾</div>
        </div>

        {/* Table selection */}
        <p className="section-label">Select your table,</p>
        <div className="tables-grid">
          {TABLES.map((table) => (
            <div
              key={table.id}
              className={`table-card ${selectedTable === table.id ? "selected" : ""}`}
              onClick={() => setSelectedTable(table.id)}
            >
              <span className={`table-tag ${selectedTable === table.id ? "selected-tag" : ""}`}>
                {selectedTable === table.id ? "SELECTED" : table.tag}
              </span>
              <p className="table-name">{table.label}</p>
              <p className="table-sub">{table.sub}</p>
              <button
                className={`table-btn ${selectedTable === table.id ? "deselect-btn" : "select-btn"}`}
                onClick={(e) => { e.stopPropagation(); setSelectedTable(selectedTable === table.id ? null : table.id); }}
              >
                {selectedTable === table.id ? "Deselect" : "Select"}
              </button>
            </div>
          ))}
        </div>

        {/* Menu */}
        <p className="menu-title">Current Menu</p>
        {MENU_ITEMS.map((item) => (
          <div key={item.id} className="menu-item">
            <img src={item.img} alt={item.name} className="menu-img" />
            <div className="menu-info">
              <p className="menu-name">{item.name}</p>
              <p className="menu-desc">{item.desc}</p>
            </div>
            <div className="menu-right">
              <span className="menu-price">${item.price}.00</span>
              {orderItems[item.id] === 0 ? (
                <button className="add-btn" onClick={() => addToOrder(item.id)}>+ Add to Order</button>
              ) : (
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => decrement(item.id)}>−</button>
                  <span className="qty-num">{orderItems[item.id]}</span>
                  <button className="qty-btn plus" onClick={() => increment(item.id)}>+</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Summary panel */}
      <aside className="summary">
        <p className="summary-title">Reservation Summary</p>

        {tableInfo && (
          <>
            <p className="summary-section-label">Selected Table</p>
            <div className="summary-table-card">
              <div className="summary-table-info">
                <p className="summary-table-name">Table {tableInfo.id} — {tableInfo.sub.split(",")[1]?.trim() || "4 Seats"}</p>
                <p className="summary-table-sub">Heritage Grille · 19:30 Today</p>
              </div>
              <span className="summary-table-icon">🪑</span>
            </div>
          </>
        )}

        {selectedItems.length > 0 && (
          <>
            <p className="summary-section-label">Selected Items</p>
            <div className="summary-items">
              {selectedItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-info">
                    <p className="summary-item-name">{orderItems[item.id]}× {item.name}</p>
                    <p className="summary-item-sub">{item.desc.split(",")[0]}</p>
                  </div>
                  <span className="summary-item-price">${item.price * orderItems[item.id]}.00</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ flexGrow: 1 }} />

        <hr className="summary-divider" />
        <div className="summary-row"><span>Subtotal</span><span>${subtotal}.00</span></div>
        <div className="summary-row"><span>Booking Fee</span><span>${subtotal > 0 ? BOOKING_FEE : 0}.00</span></div>
        <div className="summary-row total"><span>Grand Total</span><span>${grandTotal}.00</span></div>

        <button className="confirm-btn">Confirm Order &amp; Booking</button>
        <p className="confirm-note">By confirming, you agree to our 24h cancellation policy.</p>
      </aside>
    </div>
  );
}