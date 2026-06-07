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
    </div>
  </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getAllOrders(), restaurantApi.getAll()])
      .then(([s, o, r]) => {
        setStats(s.stats);
        setRecentOrders((o.orders || []).slice(0, 5));
        setRestaurants((r.restaurants || []).slice(0, 5));
      })
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-gutter">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard icon="group" label="Total Users" value={(stats?.total_users ?? 0).toLocaleString()} />
        <StatCard icon="store" label="Restaurants" value={(stats?.total_restaurants ?? 0).toLocaleString()} accent="text-tertiary" />
        <StatCard icon="receipt_long" label="Total Orders" value={(stats?.total_orders ?? 0).toLocaleString()} accent="text-secondary" />
        <StatCard icon="payments" label="Revenue" value={`$${(stats?.total_revenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Recent orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-sm font-bold text-on-surface">Recent Orders</h3>
            <span className="text-label-bold text-on-surface-variant">{recentOrders.length} latest</span>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState icon="receipt_long" label="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    {["Order","Customer","Restaurant","Total","Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-label-bold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id} className="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">#{o.id}</td>
                      <td className="px-4 py-3 text-body-sm text-on-surface">{o.user_name || o.customer_name}</td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">{o.restaurant_name || "—"}</td>
                      <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">${Number(o.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top restaurants */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h3 className="text-headline-sm font-bold text-on-surface">Restaurants</h3>
          </div>
          {restaurants.length === 0 ? (
            <EmptyState icon="store" label="No restaurants yet" />
          ) : (
            <ul className="divide-y divide-outline-variant">
              {restaurants.map(r => (
                <li key={r.id} className="px-6 py-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-container font-bold text-body-sm flex-shrink-0">
                    {r.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-on-surface truncate">{r.name}</p>
                    <p className="text-label-bold text-on-surface-variant">{r.cuisine_type || "—"}</p>
                  </div>
                  <StatusBadge status={(r as any).is_active === false ? "inactive" : "active"} />
                </li>
              ))}
            </ul>
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    authApi.getUsers()
      .then(r => setUsers(r.users || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const total = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-base">
      {/* Search */}
      <div className="card flex items-center gap-3 px-4 py-3">
        <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-transparent text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              {["User","Email","Role","Verified","Joined"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-label-bold text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-body-sm text-on-surface-variant">No users found.</td></tr>
            ) : paged.map(u => (
              <tr key={u.id} className="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container font-bold text-body-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-body-sm font-semibold text-on-surface">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">{u.email}</td>
                <td className="px-6 py-4"><StatusBadge status={u.role} /></td>
                <td className="px-6 py-4">
                  {(u as any).is_verified
                    ? <span className="flex items-center gap-1 text-body-sm text-green-700"><span className="material-symbols-outlined text-base">check_circle</span> Yes</span>
                    : <span className="flex items-center gap-1 text-body-sm text-error"><span className="material-symbols-outlined text-base">cancel</span> No</span>
                  }
                </td>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                  {(u as any).created_at ? new Date((u as any).created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-body-sm text-on-surface-variant">
          {filtered.length === 0 ? "0" : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} users
        </p>
        <div className="flex gap-xs">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
            className="px-4 py-2 rounded-xl border border-outline-variant text-body-sm text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Restaurant Modal ─────────────────────────────────────────────────────

interface RestaurantForm {
  name: string;
  cuisine_type: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
}

const EMPTY_FORM: RestaurantForm = {
  name: "", cuisine_type: "", description: "",
  phone: "", email: "", website: "", address: "", city: "",
};

const AddRestaurantModal: React.FC<{
  onClose: () => void;
  onCreated: (r: AdminRestaurant) => void;
}> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<RestaurantForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof RestaurantForm, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Restaurant name is required."); return; }
    setSaving(true); setError("");
    try {
      const res = await restaurantApi.create({
        name: form.name,
        cuisine_type: form.cuisine_type || null,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
      });
      if (res.restaurant) {
        // add location if provided
        if (form.address || form.city) {
          try {
            await restaurantApi.addLocation(res.restaurant.id, {
              address: form.address || null,
              city: form.city || null,
              state: null, postal_code: null, latitude: null, longitude: null,
            });
          } catch { /* location is optional */ }
        }
        onCreated(res.restaurant as AdminRestaurant);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create restaurant");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-all";
  const labelCls = "block text-label-bold text-on-surface-variant mb-1.5";

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3 className="text-headline-sm font-bold text-on-surface">Add Restaurant</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && <ErrorBanner message={error} />}

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Restaurant Name <span className="text-error">*</span></label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="e.g. The Bistro Hub" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Cuisine Type</label>
              <input type="text" value={form.cuisine_type} onChange={e => set("cuisine_type", e.target.value)}
                placeholder="Italian, Japanese…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+1 555 000 0000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="info@restaurant.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" value={form.website} onChange={e => set("website", e.target.value)}
                placeholder="https://…" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={3} placeholder="Tell customers about this restaurant…"
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Location */}
          <div className="pt-2 border-t border-outline-variant">
            <p className="text-label-bold text-on-surface-variant mb-3">Location (optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Address</label>
                <input type="text" value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="123 Main Street" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={form.city} onChange={e => set("city", e.target.value)}
                  placeholder="New York" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving
                ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Saving…</>
                : <><span className="material-symbols-outlined text-base">add</span> Add Restaurant</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Restaurants Tab ──────────────────────────────────────────────────────────

const RestaurantsTab: React.FC = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    restaurantApi.getAll()
      .then(r => setRestaurants(r.restaurants || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (r: AdminRestaurant) => {
    const next = !(r.is_active ?? true);
    try {
      await adminApi.toggleRestaurantStatus(r.id, next);
      setRestaurants(prev => prev.map(x => x.id === r.id ? { ...x, is_active: next } : x));
    } catch { /* silent — state unchanged */ }
  };

  const filtered = restaurants.filter(r => {
    const isActive = r.is_active ?? true;
    return r.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || (filter === "active" ? isActive : !isActive));
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-base">
      <div className="flex flex-col sm:flex-row gap-base">
        <div className="flex-1 card flex items-center gap-3 px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
          <input type="text" placeholder="Search restaurants…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant" />
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">filter_list</span>
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="bg-transparent text-body-sm text-on-surface outline-none cursor-pointer">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="store" label="No restaurants found" />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-base">
            {filtered.map(r => {
              const isActive = r.is_active ?? true;
              return (
                <div key={r.id} className="card overflow-hidden hover:shadow-lg transition-all group">
                  <div className="h-20 bg-gradient-to-br from-primary-fixed to-primary-fixed-dim flex items-center justify-center">
                    <span className="text-2xl font-bold text-on-primary-container">
                      {r.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-body-md font-semibold text-on-surface">{r.name}</h3>
                        <p className="text-label-bold text-on-surface-variant mt-0.5">{r.cuisine_type || "—"}</p>
                      </div>
                      <StatusBadge status={isActive ? "active" : "inactive"} />
                    </div>
                    {r.email && <p className="text-label-bold text-on-surface-variant mt-2">{r.email}</p>}
                    <p className="text-label-bold text-on-surface-variant mt-1">
                      Added {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between">
                      <span className="text-body-sm text-on-surface-variant">
                        {isActive ? "Restaurant is live" : "Disabled"}
                      </span>
                      <button
                        onClick={() => handleToggle(r)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? "bg-primary-container" : "bg-surface-variant"}`}
                        role="switch" aria-checked={isActive}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed" | "cancelled">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    adminApi.getAllOrders()
      .then(r => setOrders(r.orders || []))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "pending") return o.status === "pending";
    if (filter === "active") return ["preparing", "ready", "served"].includes(o.status);
    if (filter === "completed") return ["completed", "delivered"].includes(o.status);
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-base">
      {/* Filter pills */}
      <div className="flex gap-xs overflow-x-auto pb-1">
        {(["all","pending","active","completed","cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-body-sm font-semibold whitespace-nowrap transition-all ${
              filter === f
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon="receipt_long" label="No orders match this filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low">
                  {["ID","Customer","Restaurant","Total","Type","Status","Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-label-bold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <React.Fragment key={o.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      className="border-t border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">#{o.id}</td>
                      <td className="px-4 py-3 text-body-sm text-on-surface">{o.user_name || o.customer_name}</td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">{o.restaurant_name || "—"}</td>
                      <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">${Number(o.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant capitalize">{o.order_type}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                    {expandedId === o.id && (
                      <tr className="bg-surface-container-low">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="flex flex-wrap gap-x-8 gap-y-1 text-body-sm text-on-surface-variant">
                            <span><span className="font-semibold text-on-surface">Phone:</span> {o.customer_phone}</span>
                            {o.payment_method && <span><span className="font-semibold text-on-surface">Payment:</span> {o.payment_method}</span>}
                            {o.notes && <span><span className="font-semibold text-on-surface">Notes:</span> {o.notes}</span>}
                            {o.delivery_address && <span><span className="font-semibold text-on-surface">Delivery:</span> {o.delivery_address}</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-label-bold text-on-surface-variant px-1">{filtered.length} orders</p>
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const SettingsTab: React.FC = () => {
  const [form, setForm] = useState({ platformName: "CF Company", supportEmail: "support@cfcompany.com" });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSave} className="card p-6 space-y-md">
        <h3 className="text-headline-sm font-bold text-on-surface">Platform Settings</h3>

        {saved && (
          <div className="flex items-center gap-2 bg-surface-container text-on-surface rounded-xl px-4 py-3 text-body-sm border border-outline-variant">
            <span className="material-symbols-outlined text-base text-primary-container">check_circle</span>
            Settings saved
          </div>
        )}

        <div>
          <label className="block text-label-bold text-on-surface-variant mb-1.5">Platform Name</label>
          <input type="text" value={form.platformName}
            onChange={e => setForm(p => ({ ...p, platformName: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" />
        </div>
        <div>
          <label className="block text-label-bold text-on-surface-variant mb-1.5">Support Email</label>
          <input type="email" value={form.supportEmail}
            onChange={e => setForm(p => ({ ...p, supportEmail: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" />
        </div>

        <button type="submit" className="btn-primary w-full py-3">
          Save Changes
        </button>
      </form>
    </div>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "restaurants" | "orders" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",     label: "Overview",     icon: "dashboard" },
  { id: "users",        label: "Users",        icon: "group" },
  { id: "restaurants",  label: "Restaurants",  icon: "store" },
  { id: "orders",       label: "Orders",       icon: "receipt_long" },
  { id: "settings",     label: "Settings",     icon: "settings" },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">

      {/* ── Sidebar ── */}
      <aside
        className={`sticky top-0 self-start h-screen bg-[#1a1a2e] text-white transition-all duration-300 z-40 flex-shrink-0 overflow-hidden flex flex-col ${
          sidebarOpen ? "w-72" : "w-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/10">
          <img src="/logo.png" alt="CF Company" className="h-9 w-auto" />
          <h1 className="text-body-lg font-bold">CF Company</h1>
        </div>

        {/* Back home */}
        <div className="px-4 pt-4">
          <Link to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all text-body-sm">
            <span className="material-symbols-outlined text-xl">home</span>
            <span>Back Home</span>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container text-2xl">admin_panel_settings</span>
          <div>
            <p className="text-label-bold text-white/50">Admin Panel</p>
            <p className="text-body-sm font-semibold text-white truncate">{user?.email?.split("@")[0] || "Admin"}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-body-sm font-medium ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary-fixed border-r-4 border-primary-container"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all text-body-sm"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center gap-4">
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              {sidebarOpen ? "menu_open" : "menu"}
            </span>
          </button>

          {/* Title */}
          <h2 className="text-headline-sm font-bold text-on-surface hidden sm:block">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label}
          </h2>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 w-56 border border-outline-variant focus-within:border-primary-container transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Quick search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-body-sm text-on-surface outline-none w-full placeholder:text-on-surface-variant"
            />
          </div>

          {/* Notification */}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container font-bold text-body-sm flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {/* Quick actions bar */}
          {activeTab === "overview" && (
            <div className="flex flex-wrap gap-xs mb-gutter">
              <button onClick={() => setActiveTab("orders")} className="btn-secondary py-2 px-4 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">receipt_long</span>
                View Orders
              </button>
              <button onClick={() => setActiveTab("restaurants")} className="btn-secondary py-2 px-4 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">store</span>
                Manage Restaurants
              </button>
              <button onClick={() => setActiveTab("users")} className="btn-secondary py-2 px-4 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">group</span>
                Manage Users
              </button>
            </div>
          )}

          {activeTab === "overview"    && <OverviewTab />}
          {activeTab === "users"       && <UsersTab />}
          {activeTab === "restaurants" && <RestaurantsTab />}
          {activeTab === "orders"      && <OrdersTab />}
          {activeTab === "settings"    && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
