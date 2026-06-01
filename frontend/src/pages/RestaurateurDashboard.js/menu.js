import { useState } from "react";
import logo from "../../../src/assets/logo.png";

const FILTERS = ["All Dishes", "Pasta", "Main Course", "Desserts", "Drinks"];

const MENU_ITEMS = [
  {
    id: 1,
    name: "Spiced Rice Bowl",
    price: 78,
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&q=80",
  },
  {
    id: 2,
    name: "Grilled Platter",
    price: 78,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80",
  },
  {
    id: 3,
    name: "Chocolate Cake",
    price: 78,
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  },
  {
    id: 4,
    name: "Tropical Drink",
    price: 78,
    img: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=300&q=80",
  },
];

const NAV = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "🍽", label: "Menu", active: false },
  { icon: "📋", label: "Orders", active: false },
  { icon: "🔔", label: "Notifications", active: false },
];

export default function MenuManagement() {
  const [activeFilter, setActiveFilter] = useState("All Dishes");
  const [sortBy, setSortBy] = useState("Price: Low to High");
  const [viewGrid, setViewGrid] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", background: "#f7f3ef", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Sidebar */
        .sb { width: 188px; background: #fff; border-right: 1px solid #ede8e2; display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
        .sb-logo { padding: 0 18px 28px; }
        .sb-logo img { width: 54px; height: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13.5px; color: #6b5e52; cursor: pointer; border: none; background: none; font-family: 'Lato', sans-serif; font-weight: 400; transition: background 0.12s; border-radius: 6px; margin: 1px 8px; width: calc(100% - 16px); text-align: left; }
        .nav-item:hover { background: #f7f3ef; }
        .nav-item.active { background: #2a0d0d; color: #fff; font-weight: 700; }
        .nav-icon { font-size: 14px; width: 18px; }
        .sys-status { margin: auto 12px 0; background: #2a0d0d; border-radius: 10px; padding: 14px; }
        .sys-label { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .sys-value { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .new-alert-btn { width: 100%; background: #fff; color: #2a0d0d; border: none; border-radius: 6px; padding: 8px; font-size: 12px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }

        /* Main */
        .main { flex: 1; overflow-y: auto; padding: 32px 32px; }

        /* Page title */
        .page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a0f08; margin-bottom: 6px; }
        .page-sub { font-size: 12.5px; color: #9b8878; line-height: 1.5; max-width: 400px; margin-bottom: 24px; }

        /* Stats row */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; padding: 16px 18px; }
        .stat-card-label { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #9b8878; margin-bottom: 6px; }
        .stat-card-value { font-size: 28px; font-weight: 800; color: #1a0f08; font-family: 'Lato', sans-serif; line-height: 1; }
        .stat-card-sub { font-size: 11px; color: #4caf50; font-weight: 700; margin-top: 4px; }
        .stat-card-plain { font-size: 28px; font-weight: 800; color: #1a0f08; }

        /* Top selling card */
        .top-selling-card { background: #2a0d0d; border-radius: 10px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; }
        .top-selling-label { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
        .top-selling-value { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
        .top-selling-icon { font-size: 22px; color: #c9a87a; }

        /* Toolbar */
        .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .filter-label { font-size: 12px; color: #9b8878; display: flex; align-items: center; gap: 5px; }
        .filter-btn { border: 1px solid #e0d8ce; background: #fff; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-family: 'Lato', sans-serif; color: #6b5e52; cursor: pointer; transition: all 0.12s; font-weight: 400; }
        .filter-btn.active { background: #2a0d0d; color: #fff; border-color: #2a0d0d; font-weight: 700; }
        .filter-btn:hover:not(.active) { border-color: #c9b9a8; }
        .toolbar-right { display: flex; align-items: center; gap: 10px; }
        .sort-select { border: 1px solid #e0d8ce; border-radius: 6px; padding: 7px 12px; font-size: 12px; font-family: 'Lato', sans-serif; color: #1a0f08; background: #fff; outline: none; cursor: pointer; }
        .view-toggle { display: flex; border: 1px solid #e0d8ce; border-radius: 6px; overflow: hidden; }
        .view-btn { padding: 7px 10px; background: #fff; border: none; cursor: pointer; font-size: 14px; color: #9b8878; transition: background 0.12s; }
        .view-btn.active { background: #2a0d0d; color: #fff; }

        /* Add button */
        .add-btn { display: flex; align-items: center; gap: 8px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
        .add-btn:hover { opacity: 0.85; }
        .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; }

        /* Menu grid */
        .menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .menu-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #ede8e2; position: relative; }
        .menu-card-img-wrap { width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 12px 12px 60% 60% / 12px 12px 40% 40%; }
        .menu-card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
        .menu-card:hover .menu-card-img { transform: scale(1.04); }
        .menu-card-body { padding: 10px 12px 12px; display: flex; align-items: center; justify-content: space-between; }
        .menu-card-price { font-size: 15px; font-weight: 800; color: #1a0f08; font-family: 'Lato', sans-serif; }
        .menu-card-more { background: none; border: none; font-size: 18px; color: #9b8878; cursor: pointer; padding: 0 4px; line-height: 1; }
        .menu-card-more:hover { color: #1a0f08; }

        /* List view */
        .menu-list { display: flex; flex-direction: column; gap: 10px; }
        .menu-list-item { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; display: flex; align-items: center; gap: 14px; padding: 10px 16px; }
        .menu-list-img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        .menu-list-name { font-size: 13.5px; font-weight: 700; color: #1a0f08; flex: 1; }
        .menu-list-price { font-size: 14px; font-weight: 800; color: #1a0f08; }
        .menu-list-more { background: none; border: none; font-size: 18px; color: #9b8878; cursor: pointer; }

        /* Centered title above main */
        .centered-title-bar { background: #fff; border-bottom: 1px solid #ede8e2; text-align: center; padding: 12px; }
        .centered-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1a0f08; text-decoration: underline; text-underline-offset: 4px; }
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
        {/* Centered title bar */}
        <div className="centered-title-bar">
          <span className="centered-title">Your Menu</span>
        </div>

        <main className="main">
          {/* Header */}
          <div className="page-header-row" style={{ marginBottom: 6 }}>
            <div>
              <h1 className="page-title">Menu Management</h1>
              <p className="page-sub">Curate your culinary offerings with precision. Manage items, adjust pricing, and organize your seasonal collections.</p>
            </div>
            <button className="add-btn">⊕ Add New Menu Item</button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <p className="stat-card-label">Total Items</p>
              <p className="stat-card-value">124</p>
              <p className="stat-card-sub">+4 this month</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Categories</p>
              <p className="stat-card-value">8</p>
            </div>
            <div className="top-selling-card">
              <div>
                <p className="top-selling-label">Top Selling Collection</p>
                <p className="top-selling-value">Italian Heritage Pastas</p>
              </div>
              <span className="top-selling-icon">📈</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="filters">
              <span className="filter-label">⚙ Filter by:</span>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Most Popular</option>
              </select>
              <div className="view-toggle">
                <button className={`view-btn ${viewGrid ? "active" : ""}`} onClick={() => setViewGrid(true)}>⊞</button>
                <button className={`view-btn ${!viewGrid ? "active" : ""}`} onClick={() => setViewGrid(false)}>☰</button>
              </div>
            </div>
          </div>

          {/* Menu items */}
          {viewGrid ? (
            <div className="menu-grid">
              {MENU_ITEMS.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card-img-wrap">
                    <img src={item.img} alt={item.name} className="menu-card-img" />
                  </div>
                  <div className="menu-card-body">
                    <span className="menu-card-price">${item.price}</span>
                    <button className="menu-card-more">⋮</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-list">
              {MENU_ITEMS.map((item) => (
                <div key={item.id} className="menu-list-item">
                  <img src={item.img} alt={item.name} className="menu-list-img" />
                  <span className="menu-list-name">{item.name}</span>
                  <span className="menu-list-price">${item.price}</span>
                  <button className="menu-list-more">⋮</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}