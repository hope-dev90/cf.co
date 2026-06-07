import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Star,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { authApi, restaurantApi, adminApi } from "../lib/api";
import type { ApiUser, ApiRestaurant, ApiOrder } from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminOrder extends ApiOrder {
  restaurant_name?: string;
  user_name?: string;
}

interface AdminRestaurant extends ApiRestaurant {
  is_active?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string }> = {
    pending:   { bg: "bg-amber-100",  text: "text-amber-800"  },
    confirmed: { bg: "bg-blue-100",   text: "text-blue-800"   },
    preparing: { bg: "bg-orange-100", text: "text-orange-800" },
    ready:     { bg: "bg-green-100",  text: "text-green-800"  },
    served:    { bg: "bg-teal-100",   text: "text-teal-800"   },
    delivered: { bg: "bg-slate-100",  text: "text-slate-800"  },
    completed: { bg: "bg-slate-100",  text: "text-slate-800"  },
    cancelled: { bg: "bg-red-100",    text: "text-red-800"    },
    active:    { bg: "bg-green-100",  text: "text-green-800"  },
    inactive:  { bg: "bg-gray-100",   text: "text-gray-800"   },
  };
  const style = styles[status] || styles.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
    <AlertCircle size={16} />
    <span className="text-sm">{message}</span>
  </div>
);

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="animate-spin text-[#e8722a]" size={32} />
  </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<{
    total_users: number;
    total_restaurants: number;
    total_orders: number;
    total_revenue: number;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
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
