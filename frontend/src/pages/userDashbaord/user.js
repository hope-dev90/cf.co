import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { tableAPI, menuAPI, orderAPI, restaurantAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BOOKING_FEE = 10;

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", path: "/user" },
  { icon: "🍽", label: "Order & Book", path: "/user/order", active: true },
  { icon: "📅", label: "My Bookings", path: "/user/bookings" },
  { icon: "👤", label: "Profile", path: "/user/profile" },
];

export default function OrderBook() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    restaurantAPI.getAll()
      .then((res) => {
        const list = res.data || [];
        setRestaurants(list);
        if (list.length > 0) setSelectedRestaurant(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    Promise.all([
      tableAPI.getTables(selectedRestaurant.id).catch(() => ({ data: [] })),
      menuAPI.getItems(selectedRestaurant.id).catch(() => ({ data: [] })),
    ]).then(([tRes, mRes]) => {
      setTables(tRes.data || []);
      setMenuItems(mRes.data || []);
      setOrderItems({});
      setSelectedTable(null);
    }).finally(() => setLoading(false));
  }, [selectedRestaurant]);

  const selectedItems = menuItems.filter((m) => (orderItems[m.id] || 0) > 0);
  const subtotal = selectedItems.reduce((sum, m) => sum + m.price * (orderItems[m.id] || 0), 0);
  const grandTotal = subtotal + (subtotal > 0 ? BOOKING_FEE : 0);
  const tableInfo = tables.find((t) => t.id === selectedTable);

  const increment = (id) => setOrderItems((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const decrement = (id) => setOrderItems((p) => ({ ...p, [id]: Math.max(0, (p[id] || 0) - 1) }));

  const handleConfirm = async () => {
    if (!selectedTable || selectedItems.length === 0) return;
    setSubmitting(true);
    try {
      await orderAPI.create({
        restaurant_id: selectedRestaurant.id,
        table_id: selectedTable,
        items: selectedItems.map((m) => ({ menu_item_id: m.id, quantity: orderItems[m.id] })),
        total: grandTotal,
      });
      setSuccess(true);
      setOrderItems({});
      setSelectedTable(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        .main { flex: 1; overflow-y: auto; padding: 28px 32px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .topbar-title { font-size: 15px; color: #6b5e52; }
        .location-select { display: flex; align-items: center; gap: 8px; border: 1.5px solid #c9b9a8; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-family: 'Lato', sans-serif; color: #2a0d0d; background: #fff; cursor: pointer; }
        .section-label { font-size: 15px; font-weight: 700; color: #8b1a1a; margin-bottom: 16px; }
        .tables-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }
        .table-card { background: #fff; border: 1.5px solid #e8e0d8; border-radius: 10px; padding: 14px; cursor: pointer; transition: border-color 0.15s; position: relative; }
        .table-card.selected { border-color: #2a0d0d; box-shadow: 0 2px 12px rgba(42,13,13,0.10); }
        .table-card:hover { border-color: #c9b9a8; }
        .table-tag { position: absolute; top: 10px; right: 10px; font-size: 9px; font-weight: 700; background: #f7f3ef; color: #8b1a1a; padding: 2px 7px; border-radius: 20px; border: 1px solid #e8d5c8; }
        .table-tag.selected-tag { background: #2a0d0d; color: #fff; border-color: #2a0d0d; }
        .table-name { font-size: 14px; font-weight: 700; color: #1a0f08; margin-bottom: 3px; }
        .table-sub { font-size: 11px; color: #9b8878; margin-bottom: 12px; }
        .table-btn { width: 100%; padding: 8px; border-radius: 6px; border: none; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .select-btn { background: #2a0d0d; color: #fff; }
        .deselect-btn { background: #fff; color: #2a0d0d; border: 1.5px solid #2a0d0d; }
        .menu-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1a0f08; margin-bottom: 16px; }
        .menu-item { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; display: flex; gap: 14px; padding: 14px; margin-bottom: 12px; align-items: flex-start; }
        .menu-img { width: 90px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f0ebe4; }
        .menu-info { flex: 1; }
        .menu-name { font-size: 14px; font-weight: 700; color: #8b1a1a; margin-bottom: 4px; }
        .menu-desc { font-size: 12px; color: #9b8878; line-height: 1.5; margin-bottom: 10px; }
        .menu-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 8px; }
        .menu-price { font-size: 14px; font-weight: 700; color: #1a0f08; white-space: nowrap; }
        .add-btn { background: none; border: none; color: #8b1a1a; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .qty-control { display: flex; align-items: center; gap: 10px; }
        .qty-btn { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #2a0d0d; background: #fff; color: #2a0d0d; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .qty-btn.plus { background: #2a0d0d; color: #fff; }
        .qty-num { font-size: 14px; font-weight: 700; color: #1a0f08; min-width: 16px; text-align: center; }
        .summary { width: 240px; background: #fff; border-left: 1px solid #ede8e2; padding: 28px 20px; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
        .summary-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #8b1a1a; margin-bottom: 20px; }
        .summary-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #9b8878; text-transform: uppercase; margin-bottom: 8px; }
        .summary-table-card { background: #f7f3ef; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
        .summary-table-name { font-size: 13px; font-weight: 700; color: #1a0f08; }
        .summary-table-sub { font-size: 11px; color: #9b8878; margin-top: 2px; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; gap: 8px; }
        .summary-item-name { font-size: 12px; font-weight: 700; color: #1a0f08; }
        .summary-item-sub { font-size: 11px; color: #9b8878; }
        .summary-item-price { font-size: 12px; font-weight: 700; color: #1a0f08; white-space: nowrap; }
        .summary-divider { border: none; border-top: 1px solid #ede8e2; margin: 16px 0; }
        .summary-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #6b5e52; margin-bottom: 6px; }
        .summary-row.total { font-weight: 700; color: #1a0f08; font-size: 14px; }
        .confirm-btn { margin-top: 20px; width: 100%; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; padding: 14px; font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; }
        .confirm-btn:hover:not(:disabled) { opacity: 0.85; }
        .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .confirm-note { font-size: 10px; color: #9b8878; text-align: center; margin-top: 10px; line-height: 1.4; }
        .success-banner { background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #2e7d32; font-weight: 700; margin-bottom: 20px; text-align: center; }
        .empty-state { text-align: center; padding: 40px 20px; color: #9b8878; }
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
        <div className="topbar">
          <span className="topbar-title">Reservations and Dining · {user?.name || user?.email}</span>
          {restaurants.length > 0 && (
            <select
              className="location-select"
              value={selectedRestaurant?.id || ""}
              onChange={(e) => setSelectedRestaurant(restaurants.find(r => r.id === Number(e.target.value)))}
            >
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
        </div>

        {success && <div className="success-banner">✓ Order placed successfully! Check My Bookings for details.</div>}

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <>
            <p className="section-label">Select your table</p>
            {tables.length === 0 ? (
              <div className="empty-state" style={{ marginBottom: "32px" }}>No tables available at this restaurant.</div>
            ) : (
              <div className="tables-grid">
                {tables.map((table) => (
                  <div key={table.id} className={`table-card ${selectedTable === table.id ? "selected" : ""}`} onClick={() => setSelectedTable(table.id)}>
                    <span className={`table-tag ${selectedTable === table.id ? "selected-tag" : ""}`}>
                      {selectedTable === table.id ? "SELECTED" : `${table.capacity} seats`}
                    </span>
                    <p className="table-name">Table {table.table_number}</p>
                    <p className="table-sub">{table.location || "Main Hall"}</p>
                    <button
                      className={`table-btn ${selectedTable === table.id ? "deselect-btn" : "select-btn"}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedTable(selectedTable === table.id ? null : table.id); }}
                    >
                      {selectedTable === table.id ? "Deselect" : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="menu-title">Current Menu</p>
            {menuItems.length === 0 ? (
              <div className="empty-state">No menu items available.</div>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="menu-item">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="menu-img" />
                    : <div className="menu-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🍽</div>
                  }
                  <div className="menu-info">
                    <p className="menu-name">{item.name}</p>
                    <p className="menu-desc">{item.description}</p>
                  </div>
                  <div className="menu-right">
                    <span className="menu-price">${item.price}.00</span>
                    {(orderItems[item.id] || 0) === 0 ? (
                      <button className="add-btn" onClick={() => increment(item.id)}>+ Add to Order</button>
                    ) : (
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => decrement(item.id)}>−</button>
                        <span className="qty-num">{orderItems[item.id]}</span>
                        <button className="qty-btn plus" onClick={() => increment(item.id)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      <aside className="summary">
        <p className="summary-title">Reservation Summary</p>

        {tableInfo && (
          <>
            <p className="summary-section-label">Selected Table</p>
            <div className="summary-table-card">
              <p className="summary-table-name">Table {tableInfo.table_number}</p>
              <p className="summary-table-sub">{tableInfo.location || "Main Hall"} · {tableInfo.capacity} seats</p>
            </div>
          </>
        )}

        {selectedItems.length > 0 && (
          <>
            <p className="summary-section-label">Selected Items</p>
            {selectedItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div>
                  <p className="summary-item-name">{orderItems[item.id]}× {item.name}</p>
                  <p className="summary-item-sub">${item.price} each</p>
                </div>
                <span className="summary-item-price">${item.price * orderItems[item.id]}.00</span>
              </div>
            ))}
          </>
        )}

        <div style={{ flexGrow: 1 }} />
        <hr className="summary-divider" />
        <div className="summary-row"><span>Subtotal</span><span>${subtotal}.00</span></div>
        <div className="summary-row"><span>Booking Fee</span><span>${subtotal > 0 ? BOOKING_FEE : 0}.00</span></div>
        <div className="summary-row total"><span>Grand Total</span><span>${grandTotal}.00</span></div>

        <button
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={submitting || !selectedTable || selectedItems.length === 0}
        >
          {submitting ? "Placing Order..." : "Confirm Order & Booking"}
        </button>
        <p className="confirm-note">By confirming, you agree to our 24h cancellation policy.</p>
      </aside>
    </div>
  );
}
