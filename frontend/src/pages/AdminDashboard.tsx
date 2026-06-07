import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi, restaurantApi, adminApi } from "../lib/api";
import type { ApiUser, ApiRestaurant, ApiOrder } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminOrder extends ApiOrder {
  restaurant_name?: string;
  user_name?: string;
}
interface AdminRestaurant extends ApiRestaurant {
  is_active?: boolean;
}
interface Stats {
  total_users: number;
  total_restaurants: number;
  total_orders: number;
  total_revenue: number;
}

// ─── Shared UI Atoms ─────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-800",
    preparing: "bg-orange-100 text-orange-800",
    ready:     "bg-blue-100 text-blue-800",
    served:    "bg-teal-100 text-teal-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    active:    "bg-green-100 text-green-800",
    inactive:  "bg-surface-variant text-on-surface-variant",
    client:    "bg-surface-container text-on-surface",
    restaurateur: "bg-primary-fixed text-on-primary-container",
    admin:     "bg-tertiary-container text-on-tertiary-container",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-bold font-semibold capitalize ${map[status] || "bg-surface-variant text-on-surface-variant"}`}>
      {status}
    </span>
  );
};

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <span className="material-symbols-outlined text-primary-container animate-spin text-4xl">progress_activity</span>
  </div>
);

const EmptyState: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
    <span className="material-symbols-outlined text-5xl opacity-30">{icon}</span>
    <p className="text-body-sm">{label}</p>
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-3 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-body-sm">
    <span className="material-symbols-outlined text-base">error</span>
    {message}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}> = ({ icon, label, value, sub, accent = "text-primary-container" }) => (
  <div className="card p-6 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-primary-fixed flex-shrink-0`}>
      <span className={`material-symbols-outlined text-2xl ${accent}`}>{icon}</span>
    </div>
    <div>
      <p className="text-body-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-headline-md font-bold text-on-surface">{value}</p>
      {sub && <p className="text-label-bold text-on-surface-variant mt-1">{sub}</p>}
    </div>oading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, restRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAllOrders(),
          restaurantApi.getAll(),
        ]);
        setStats(statsRes.stats);
        setRecentOrders((ordersRes.orders || []).slice(0, 5));
        setTopRestaurants((restRes.restaurants || []).slice(0, 4));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  const statCards = [
    { title: "Total Users",       value: stats?.total_users       ?? 0, icon: "👥", color: "#3b82f6" },
    { title: "Total Restaurants", value: stats?.total_restaurants ?? 0, icon: "🏪", color: "#e8722a" },
    { title: "Total Orders",      value: stats?.total_orders      ?? 0, icon: "📦", color: "#10b981" },
    { title: "Revenue",           value: stats?.total_revenue     ?? 0, icon: "💰", color: "#14b8a6", isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: s.color }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{s.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(s as any).isCurrency ? `$${s.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : s.value.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl opacity-80">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Order ID","Customer","Restaurant","Amount","Status","Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.user_name || order.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.restaurant_name || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurants</h3>
          {topRestaurants.length === 0 ? (
            <p className="text-gray-500 text-sm">No restaurants yet.</p>
          ) : (
            <div className="space-y-4">
              {topRestaurants.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-600">{r.cuisine_type || "—"}</p>
                  </div>
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    authApi.getUsers()
      .then(res => setUsers(res.users || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const roleBadge = (role: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      client:      { bg: "bg-blue-100",   text: "text-blue-800"   },
      restaurateur:{ bg: "bg-orange-100", text: "text-orange-800" },
      admin:       { bg: "bg-teal-100",   text: "text-teal-800"   },
    };
    return map[role] || map.client;
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["User","Email","Role","Verified","Joined"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
            ) : paginated.map(u => {
              const badge = roleBadge(u.role);
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(u as any).is_verified
                      ? <span className="text-green-600 font-medium">✓ Yes</span>
                      : <span className="text-red-500">✗ No</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(u as any).created_at ? new Date((u as any).created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filtered.length === 0 ? "0" : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)}`} of {filtered.length} users
        </p>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Restaurants Tab ──────────────────────────────────────────────────────────

const RestaurantsTab: React.FC = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    restaurantApi.getAll()
      .then(res => setRestaurants(res.restaurants || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load restaurants"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (r: AdminRestaurant) => {
    const newState = !(r.is_active ?? true);
    try {
      await adminApi.toggleRestaurantStatus(r.id, newState);
      setRestaurants(prev => prev.map(x => x.id === r.id ? { ...x, is_active: newState } : x));
    } catch {
      // silently ignore — button will revert visually since state didn't change
    }
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = r.is_active ?? true;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? isActive : !isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
          <Search size={20} className="text-gray-400" />
          <input type="text" placeholder="Search restaurants..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-gray-700" />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
          <Filter size={20} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="outline-none text-gray-700 cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">No restaurants found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => {
            const isActive = r.is_active ?? true;
            return (
              <div key={r.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                  {r.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-600">{r.cuisine_type || "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.email || "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">Added {new Date(r.created_at).toLocaleDateString()}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input type="checkbox" checked={isActive} onChange={() => handleToggle(r)}
                        className="w-4 h-4 accent-[#e8722a] cursor-pointer" />
                      <span className="text-sm text-gray-700">{isActive ? "Active" : "Inactive"}</span>
                    </label>
                    <StatusBadge status={isActive ? "active" : "inactive"} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "active" | "completed" | "cancelled">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    adminApi.getAllOrders()
      .then(res => setOrders(res.orders || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return o.status === "pending";
    if (activeFilter === "active") return ["confirmed","preparing","ready","served"].includes(o.status);
    if (activeFilter === "completed") return ["delivered","completed"].includes(o.status);
    if (activeFilter === "cancelled") return o.status === "cancelled";
    return true;
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all","pending","active","completed","cancelled"] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === f ? "bg-[#e8722a] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Order ID","Customer","Restaurant","Total","Status","Type","Date"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
            ) : filtered.map(o => (
              <React.Fragment key={o.id}>
                <tr onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{o.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{o.user_name || o.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{o.restaurant_name || "—"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.order_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
                {expandedId === o.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">Phone:</span> {o.customer_phone}</p>
                        {o.notes && <p><span className="font-medium">Notes:</span> {o.notes}</p>}
                        {o.delivery_address && <p><span className="font-medium">Delivery:</span> {o.delivery_address}</p>}
                        {o.payment_method && <p><span className="font-medium">Payment:</span> {o.payment_method}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">{filtered.length} orders shown</p>
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({ platformName: "CF Company", supportEmail: "support@cfcompany.com" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Platform Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
            <input type="text" value={settings.platformName}
              onChange={e => setSettings(s => ({ ...s, platformName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input type="email" value={settings.supportEmail}
              onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a]" />
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button onClick={handleSave}
              className="px-6 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold rounded-lg transition-colors">
              Save Settings
            </button>
            {saved && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
                <CheckCircle size={16} /> Saved successfully
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "restaurants" | "orders" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const navItems = [
    { id: "overview",     label: "Overview",     icon: <LayoutDashboard size={20} /> },
    { id: "users",        label: "Users",        icon: <Users size={20} /> },
    { id: "restaurants",  label: "Restaurants",  icon: <Store size={20} /> },
    { id: "orders",       label: "Orders",       icon: <ShoppingBag size={20} /> },
    { id: "settings",     label: "Settings",     icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#faf5f0]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} bg-[#1a1a2e] text-white transition-all duration-300 flex flex-col fixed md:static h-full z-50 md:z-auto overflow-hidden`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold">CF Company</h1>
          </div>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors mb-4">
            <Home size={20} />
            <span className="font-medium">Back Home</span>
          </Link>
          <div className="flex items-center gap-2 bg-[#e8722a] bg-opacity-20 px-3 py-2 rounded-lg border border-[#e8722a] border-opacity-30">
            <Shield size={16} className="text-[#e8722a]" />
            <span className="text-xs font-semibold text-[#e8722a]">Admin Panel</span>
          </div>
        </div>

        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8722a] to-orange-600 flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.email?.split("@")[0] || "Admin"}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); if (isMobile) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-gray-700 text-[#e8722a] border-l-4 border-[#e8722a]"
                  : "text-gray-300 hover:bg-gray-800"
              }`}>
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 flex-1 ml-4">
            {navItems.find(n => n.id === activeTab)?.label || "Overview"}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {activeTab === "overview"     && <OverviewTab />}
          {activeTab === "users"        && <UsersTab />}
          {activeTab === "restaurants"  && <RestaurantsTab />}
          {activeTab === "orders"       && <OrdersTab />}
          {activeTab === "settings"     && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
