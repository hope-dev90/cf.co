import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../src/assets/logo.png";
import { restaurantAPI, menuAPI } from "../../services/api";

const FILTERS = ["All Dishes", "Pasta", "Main Course", "Desserts", "Drinks"];

const NAV = [
  { icon: "⊞", label: "Dashboard", path: "/restaurateur" },
  { icon: "🍽", label: "Menu", path: "/restaurateur/menu", active: true },
  { icon: "📋", label: "Orders", path: "/restaurateur/orders" },
  { icon: "👥", label: "Staff", path: "/restaurateur/staff" },
];

export default function MenuManagement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Dishes");
  const [viewGrid, setViewGrid] = useState(true);
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "", image_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    restaurantAPI.getMine().then((res) => {
      if (res.data?.length > 0) {
        const id = res.data[0].id;
        setRestaurantId(id);
        return menuAPI.getItems(id);
      }
    }).then((res) => {
      if (res?.data) setItems(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    try {
      const res = await menuAPI.addItem(restaurantId, { ...form, price: Number(form.price) });
      setItems((p) => [...p, res.data]);
      setShowModal(false);
      setForm({ name: "", price: "", category: "", description: "", image_url: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await menuAPI.deleteItem(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch {
      alert("Failed to delete item");
    }
  };

  const filtered = activeFilter === "All Dishes" ? items : items.filter((i) => i.category?.toLowerCase() === activeFilter.toLowerCase());

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
        .page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a0f08; margin-bottom: 6px; }
        .page-sub { font-size: 12.5px; color: #9b8878; margin-bottom: 24px; }
        .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-btn { border: 1px solid #e0d8ce; background: #fff; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-family: 'Lato', sans-serif; color: #6b5e52; cursor: pointer; }
        .filter-btn.active { background: #2a0d0d; color: #fff; border-color: #2a0d0d; font-weight: 700; }
        .add-btn { display: flex; align-items: center; gap: 8px; background: #2a0d0d; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-family: 'Lato', sans-serif; font-weight: 700; cursor: pointer; }
        .add-btn:hover { opacity: 0.85; }
        .view-toggle { display: flex; border: 1px solid #e0d8ce; border-radius: 6px; overflow: hidden; }
        .view-btn { padding: 7px 10px; background: #fff; border: none; cursor: pointer; font-size: 14px; color: #9b8878; }
        .view-btn.active { background: #2a0d0d; color: #fff; }
        .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .menu-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #ede8e2; }
        .menu-card-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
        .menu-card-body { padding: 10px 12px 12px; display: flex; align-items: center; justify-content: space-between; }
        .menu-card-info { flex: 1; }
        .menu-card-name { font-size: 13px; font-weight: 700; color: #1a0f08; }
        .menu-card-price { font-size: 13px; font-weight: 800; color: #8b1a1a; }
        .menu-card-more { background: none; border: none; font-size: 18px; color: #9b8878; cursor: pointer; }
        .menu-list { display: flex; flex-direction: column; gap: 10px; }
        .menu-list-item { background: #fff; border: 1px solid #ede8e2; border-radius: 10px; display: flex; align-items: center; gap: 14px; padding: 10px 16px; }
        .menu-list-img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f0ebe4; }
        .menu-list-name { font-size: 13.5px; font-weight: 700; color: #1a0f08; flex: 1; }
        .menu-list-price { font-size: 14px; font-weight: 800; color: #1a0f08; }
        .del-btn { background: none; border: none; color: #c0281a; cursor: pointer; font-size: 14px; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9b8878; }
        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; border-radius: 16px; padding: 32px; width: 440px; max-width: 95vw; }
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
        <div style={{ background: "#fff", borderBottom: "1px solid #ede8e2", textAlign: "center", padding: "12px" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#1a0f08", textDecoration: "underline", textUnderlineOffset: "4px" }}>Your Menu</span>
        </div>

        <main className="main">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
            <div>
              <h1 className="page-title">Menu Management</h1>
              <p className="page-sub">Manage your culinary offerings, pricing, and categories.</p>
            </div>
            <button className="add-btn" onClick={() => setShowModal(true)}>⊕ Add New Item</button>
          </div>

          <div className="toolbar">
            <div className="filters">
              {FILTERS.map((f) => (
                <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${viewGrid ? "active" : ""}`} onClick={() => setViewGrid(true)}>⊞</button>
              <button className={`view-btn ${!viewGrid ? "active" : ""}`} onClick={() => setViewGrid(false)}>☰</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading menu...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🍽</p>
              <p>No menu items yet. Add your first dish!</p>
            </div>
          ) : viewGrid ? (
            <div className="menu-grid">
              {filtered.map((item) => (
                <div key={item.id} className="menu-card">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="menu-card-img" />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "1", background: "#f0ebe4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🍽</div>
                  )}
                  <div className="menu-card-body">
                    <div className="menu-card-info">
                      <p className="menu-card-name">{item.name}</p>
                      <p className="menu-card-price">${item.price}</p>
                    </div>
                    <button className="del-btn" onClick={() => handleDelete(item.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-list">
              {filtered.map((item) => (
                <div key={item.id} className="menu-list-item">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="menu-list-img" /> : <div className="menu-list-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🍽</div>}
                  <span className="menu-list-name">{item.name}</span>
                  <span style={{ fontSize: "12px", color: "#9b8878", marginRight: "12px" }}>{item.category}</span>
                  <span className="menu-list-price">${item.price}</span>
                  <button className="del-btn" onClick={() => handleDelete(item.id)}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Add Menu Item</p>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="e.g. Truffle Pasta" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input type="number" className="form-input" placeholder="0.00" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" placeholder="e.g. Pasta" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input className="form-input" placeholder="https://..." value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-save" disabled={saving}>{saving ? "Saving..." : "Add Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
