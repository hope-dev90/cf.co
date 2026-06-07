import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  restaurantApi,
  orderApi,
  ApiRestaurant,
  ApiOrder,
  ApiMenuItem,
  ApiTable,
  ApiWaiter,
  ApiAnalytics,
  ApiTopMenuItem,
  ApiOrderStatusCount,
} from "../lib/api";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "served"
    | "delivered"
    | "cancelled"
    | "completed";
  createdAt: string;
}

const SettingsPanel: React.FC<{
  restaurant: ApiRestaurant | null;
  onSaved: (r: ApiRestaurant) => void;
}> = ({ restaurant, onSaved }) => {
  const [form, setForm] = React.useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    cuisine_type: restaurant?.cuisine_type || "",
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    website: restaurant?.website || "",
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || "",
        description: restaurant.description || "",
        cuisine_type: restaurant.cuisine_type || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || "",
      });
    }
  }, [restaurant]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const data = await restaurantApi.update(restaurant.id, form);
      if (data.restaurant) {
        onSaved(data.restaurant);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Failed to save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          ✓ Changes saved successfully.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 custom-shadow">
        <h3 className="font-bold text-on-surface mb-5 text-sm uppercase tracking-wide">Restaurant Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Restaurant Name</label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="My Restaurant" />
          </div>
          <div>
            <label className={labelCls}>Cuisine Type</label>
            <input className={inputCls} value={form.cuisine_type} onChange={(e) => set("cuisine_type", e.target.value)} placeholder="Italian, Japanese…" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell customers about your restaurant…"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 custom-shadow">
        <h3 className="font-bold text-on-surface mb-5 text-sm uppercase tracking-wide">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@restaurant.com" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Website</label>
            <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://myrestaurant.com" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
};

const OwnerDashboard: React.FC = () => {
  const { logout, profile: authProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "menu"
    | "orders"
    | "analytics"
    | "settings"
    | "tables"
    | "waiters"
    | "categories"
    | "availability"
    | "promotions"
  >("dashboard");
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [todayOrders, setTodayOrders] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [waiters, setWaiters] = useState<ApiWaiter[]>([]);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [topItems, setTopItems] = useState<ApiTopMenuItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<ApiOrderStatusCount[]>([]);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddWaiterModal, setShowAddWaiterModal] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [editingTable, setEditingTable] = useState<ApiTable | null>(null);
  const [editingWaiter, setEditingWaiter] = useState<ApiWaiter | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<ApiMenuItem | null>(
    null,
  );

  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [activeStaffRole, setActiveStaffRole] = useState("all");

  const handleViewOrder = async (id: string) => {
    setLoadingOrderDetail(true);
    try {
      const data = await orderApi.getById(id);
      setSelectedOrder(data.order || null);
    } catch (e) {
      console.error("Error fetching order detail:", e);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Form states
  const [tableForm, setTableForm] = useState({
    table_number: "",
    capacity: 2,
    location_description: "",
    position_x: 0,
    position_y: 0,
    is_active: true,
  });
  const [waiterForm, setWaiterForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    staff_role: "waiter",
    task: "",
    photo_url: "",
    status: "active",
  });
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    is_available: true,
    image_url: "",
  });

  const formatNumber = (num: number): string => {
    return `$${num.toFixed(2)}`;
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-orange-100 text-orange-700";
      case "ready":
        return "bg-blue-100 text-blue-700";
      case "served":
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await restaurantApi.getMy();
        console.log("restaurantData:", restaurantData);
        if (
          restaurantData.restaurants &&
          restaurantData.restaurants.length > 0
        ) {
          const rest = restaurantData.restaurants[0];
          console.log("rest.id:", rest.id);
          setRestaurant(rest);

          const [
            ordersData,
            menuData,
            tablesData,
            waitersData,
            analyticsData,
            topItemsData,
            statusCountsData,
          ] = await Promise.all([
            orderApi.getByRestaurant(rest.id),
            restaurantApi.getMenu(rest.id),
            restaurantApi.getTables(rest.id),
            restaurantApi.getWaiters(rest.id),
            restaurantApi.getAnalytics(rest.id),
            restaurantApi.getTopMenuItems(rest.id, 5),
            restaurantApi.getOrdersByStatus(rest.id),
          ]);

          console.log("menuData:", menuData);

          const formattedOrders: Order[] = (ordersData.orders || []).map(
            (order: ApiOrder) => ({
              id: order.id.toString(),
              orderNumber: `#ORD-${String(order.id).padStart(3, "0")}`,
              customerName: order.customer_name,
              totalAmount: parseFloat(order.total_amount.toString()) || 0,
              status: order.status,
              createdAt: order.created_at,
            }),
          );

          setOrders(formattedOrders);
          setMenuItems(menuData.menuItems || []);
          setTables(tablesData.tables || []);
          setWaiters(waitersData.waiters || []);
          setAnalytics(analyticsData.analytics || null);
          setTopItems(topItemsData.topItems || []);
          setStatusCounts(statusCountsData.statusCounts || []);

          const today = new Date().toDateString();
          const todayOrderList = formattedOrders.filter(
            (o) => new Date(o.createdAt).toDateString() === today,
          );
          setTodayOrders(todayOrderList.length);
          setRevenueToday(
            todayOrderList.reduce((sum, o) => sum + o.totalAmount, 0),
          );
          setPendingOrders(
            formattedOrders.filter((o) => o.status === "pending").length,
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus as any } : order,
        ),
      );

      // Refresh analytics and status counts
      if (restaurant) {
        const [analyticsData, statusCountsData] = await Promise.all([
          restaurantApi.getAnalytics(restaurant.id),
          restaurantApi.getOrdersByStatus(restaurant.id),
        ]);
        setAnalytics(analyticsData.analytics || null);
        setStatusCounts(statusCountsData.statusCounts || []);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleAddOrUpdateTable = async (): Promise<void> => {
    if (!restaurant) return;
    try {
      if (editingTable) {
        const data = await restaurantApi.updateTable(
          editingTable.id,
          tableForm,
        );
        if (data.table) {
          setTables((prev) =>
            prev.map((t) => (t.id === editingTable.id ? data.table! : t)),
          );
        }
      } else {
        const data = await restaurantApi.addTable(restaurant.id, tableForm);
        if (data.table) {
          setTables((prev) => [...prev, data.table]);
        }
      }
      setShowAddTableModal(false);
      resetTableForm();
    } catch (error) {
      console.error("Error saving table:", error);
    }
  };

  const handleDeleteTable = async (tableId: number): Promise<void> => {
    try {
      await restaurantApi.deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  const handleEditTable = (table: ApiTable): void => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number,
      capacity: table.capacity,
      location_description: table.location_description || "",
      position_x: table.position_x,
      position_y: table.position_y,
      is_active: table.is_active,
    });
    setShowAddTableModal(true);
  };

  const resetTableForm = (): void => {
    setTableForm({
      table_number: "",
      capacity: 2,
      location_description: "",
      position_x: 0,
      position_y: 0,
      is_active: true,
    });
    setEditingTable(null);
  };

  const handleAddOrUpdateWaiter = async (): Promise<void> => {
    if (!restaurant) return;
    try {
      if (editingWaiter) {
        const data = await restaurantApi.updateWaiter(
          editingWaiter.id,
          waiterForm,
        );
        if (data.waiter) {
          setWaiters((prev) =>
            prev.map((w) => (w.id === editingWaiter.id ? data.waiter! : w)),
          );
        }
      } else {
        const data = await restaurantApi.addWaiter(restaurant.id, {
          ...waiterForm,
          user_id: null,
        });
        if (data.waiter) {
          setWaiters((prev) => [...prev, data.waiter]);
        }
      }
      setShowAddWaiterModal(false);
      resetWaiterForm();
    } catch (error) {
      console.error("Error saving waiter:", error);
    }
  };

  const handleDeleteWaiter = async (waiterId: number): Promise<void> => {
    try {
      await restaurantApi.deleteWaiter(waiterId);
      setWaiters((prev) => prev.filter((w) => w.id !== waiterId));
    } catch (error) {
      console.error("Error deleting waiter:", error);
    }
  };

  const handleEditWaiter = (waiter: ApiWaiter): void => {
    setEditingWaiter(waiter);
    setWaiterForm({
      first_name: waiter.first_name,
      last_name: waiter.last_name,
      phone: waiter.phone || "",
      email: waiter.email || "",
      staff_role: waiter.staff_role || "waiter",
      task: waiter.task || "",
      photo_url: waiter.photo_url || "",
      status: waiter.status || "active",
    });
    setShowAddWaiterModal(true);
  };

  const resetWaiterForm = (): void => {
    setWaiterForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      staff_role: "waiter",
      task: "",
      photo_url: "",
      status: "active",
    });
    setEditingWaiter(null);
  };

  const handleAddOrUpdateMenuItem = async (): Promise<void> => {
    if (!restaurant) return;
    try {
      if (editingMenuItem) {
        const data = await restaurantApi.updateMenuItem(
          editingMenuItem.id,
          menuItemForm,
        );
        if (data.menuItem) {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === editingMenuItem.id ? data.menuItem! : item,
            ),
          );
        }
      } else {
        const data = await restaurantApi.addMenuItem(
          restaurant.id,
          menuItemForm,
        );
        if (data.menuItem) {
          setMenuItems((prev) => [...prev, data.menuItem]);
        }
      }
      setShowAddMenuItemModal(false);
      resetMenuItemForm();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDeleteMenuItem = async (menuItemId: number): Promise<void> => {
    try {
      await restaurantApi.deleteMenuItem(menuItemId);
      setMenuItems((prev) => prev.filter((item) => item.id !== menuItemId));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleEditMenuItem = (menuItem: ApiMenuItem): void => {
    setEditingMenuItem(menuItem);
    setMenuItemForm({
      name: menuItem.name,
      description: menuItem.description || "",
      price: Number(menuItem.price),
      category: menuItem.category || "",
      is_available: menuItem.is_available,
      image_url: menuItem.image_url || "",
    });
    setShowAddMenuItemModal(true);
  };

  const resetMenuItemForm = (): void => {
    setMenuItemForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      is_available: true,
      image_url: "",
    });
    setEditingMenuItem(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-base text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* Sidebar */}
      <div
        className={`sticky top-0 self-start h-screen bg-[#1a1a2e] text-white transition-all duration-300 z-40 flex-shrink-0 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-4 mb-8">
            <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
            <h1 className="text-xl font-bold">CF Company</h1>
          </div>

          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#16213e] transition-all text-sm"
            >
              <span className="material-symbols-outlined">home</span>
              <span>Back Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 bg-[#16213e] rounded-lg">
            <span className="material-symbols-outlined text-[#e8722a] text-3xl">
              store
            </span>
            <div>
              <p className="text-xs text-gray-400">Owner Panel</p>
              <p className="text-sm font-semibold">
                {authProfile?.name || restaurant?.name || "Owner"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "dashboard" },
              { id: "menu", label: "Menu", icon: "menu_book" },
              { id: "orders", label: "Orders", icon: "shopping_bag" },
              { id: "tables", label: "Tables", icon: "table_restaurant" },
              { id: "waiters", label: "Waiters", icon: "person" },
              { id: "analytics", label: "Analytics", icon: "bar_chart" },
              { id: "settings", label: "Settings", icon: "settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === item.id
                    ? "bg-[rgba(148,74,0,0.08)] border-r-4 border-[#944a00] text-[#944a00] font-bold"
                    : "text-gray-300 hover:bg-[#16213e]"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500 hover:bg-opacity-20 hover:text-red-400 transition-all text-sm mt-4"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#16213e] text-white rounded-lg"
      >
        <span className="material-symbols-outlined">
          {sidebarOpen ? "close" : "menu"}
        </span>
      </button>

      <div className="flex-1 min-h-screen pb-20">
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40 bg-surface-container-lowest shadow-sm max-w-screen-2xl mx-auto">
          <div className="flex items-center">
            <span className="font-headline-md text-lg font-bold text-primary mr-10">
              {restaurant?.name || "Menu Manager"}
            </span>
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => setActiveTab("menu")}
                className={`font-label-bold text-xs transition-colors ${
                  activeTab === "menu"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`font-label-bold text-xs transition-colors ${
                  activeTab === "categories"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab("availability")}
                className={`font-label-bold text-xs transition-colors ${
                  activeTab === "availability"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Availability
              </button>
              <button
                onClick={() => setActiveTab("promotions")}
                className={`font-label-bold text-xs transition-colors ${
                  activeTab === "promotions"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Promotions
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 border border-outline-variant focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none"
                placeholder="Search orders..."
                type="text"
              />
            </div>
            <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">
              notifications
            </button>
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <img
                alt="Restaurant Owner Profile"
                className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPnF8e340DfgCvtDXtsMxCDY7I6Mkx2xV0aP6BifNyYvfeDA2-UXbstrLoJe38AtR2HW8B8emyNPiUcpeC9YQIbK1t9bEpbDbwAMkvECp76iHVzQYeEvDxuo9jouwQzNQH-Wdb8_ZBmVBrPfCbquWWVQzyhZfwuwyXpR3rPKTHXaFWvTx1jazWCe_oz9hUvjUYM8jrAszO3bXe8xGexQ3riQFkBj4ur1kDUfw7WZ5zr-5hXFs349dbsGR4CVmZu4YMguDbRDUylYg"
              />
              <span className="material-symbols-outlined text-secondary">
                account_circle
              </span>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Welcome back, {authProfile?.name || "Owner"}!
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-2">
                Here's your restaurant performance today
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-5 rounded-xl custom-shadow transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">
                    Today's Orders
                  </p>
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      shopping_bag
                    </span>
                  </div>
                </div>
                <p className="font-display-lg text-2xl text-on-surface mb-2">
                  {todayOrders}
                </p>
                <div className="flex items-center text-green-600 font-label-bold text-xs">
                  <span className="material-symbols-outlined text-sm mr-1">
                    trending_up
                  </span>
                  <span>+0% vs yesterday</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl custom-shadow transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">
                    Revenue Today
                  </p>
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      bar_chart
                    </span>
                  </div>
                </div>
                <p className="font-display-lg text-2xl text-on-surface mb-2">
                  {formatNumber(revenueToday)}
                </p>
                <div className="flex items-center text-green-600 font-label-bold text-xs">
                  <span className="material-symbols-outlined text-sm mr-1">
                    trending_up
                  </span>
                  <span>+0% vs yesterday</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl custom-shadow transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">
                    Pending Orders
                  </p>
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      schedule
                    </span>
                  </div>
                </div>
                <p className="font-display-lg text-2xl text-on-surface mb-2">
                  {pendingOrders}
                </p>
                <div className="flex items-center text-error font-label-bold text-xs">
                  <span className="material-symbols-outlined text-sm mr-1">
                    trending_down
                  </span>
                  <span>-10% vs yesterday</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl custom-shadow transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">
                    Average Rating
                  </p>
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      restaurant
                    </span>
                  </div>
                </div>
                <p className="font-display-lg text-2xl text-on-surface mb-2">
                  4.5
                </p>
                <div className="flex items-center text-green-600 font-label-bold text-xs">
                  <span className="material-symbols-outlined text-sm mr-1">
                    trending_up
                  </span>
                  <span>+0% vs yesterday</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl custom-shadow overflow-hidden mb-8">
              <div className="px-6 py-4.5 border-b border-surface-variant flex justify-between items-center">
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">
                  Recent Orders
                </h3>
                <div className="flex space-x-2">
                  <button className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      filter_list
                    </span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-lowest text-on-surface-variant font-label-bold text-xs border-b border-surface-variant">
                      <th className="px-6 py-3.5">Order ID</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Time</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant font-body-md text-sm">
                    {orders.slice(0, 5).map((order, index) => (
                      <tr
                        key={order.id}
                        className="hover:bg-surface-container-lowest transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-6 py-4 text-on-surface font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4">{order.customerName}</td>
                        <td className="px-6 py-4 text-primary-container font-semibold">
                          {formatNumber(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {formatTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="text-xs px-2 py-1 rounded border border-gray-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="served">Served</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("menu")}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Menu Item
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className="bg-white border-2 border-primary-container text-primary-container hover:bg-primary-container/5 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center"
              >
                <span className="material-symbols-outlined mr-2">
                  receipt_long
                </span>
                View All Orders
              </button>
            </div>

            <div className="mt-10 grid grid-cols-12 gap-6 auto-rows-[180px]">
              <div className="col-span-8 row-span-2 relative rounded-2xl overflow-hidden custom-shadow group">
                <img
                  alt="Gourmet Platter"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHJm_F3nntA30EYDgDzvq18KK4sfLwfR9TjNsPFHBx5r6oHFU_amABWF-IRflapWmZKDOKZ0-UqZekvGn74JRi6K0StcIbvC1OtnWDou8YuZNQtkCAyNkulhMiEVT7WH7UyidQnSgaax7pafb3eHohfRYM8Y9ENEzMioMCv1a-9_xiwqmF178C6Kv6-HXyM_jQ45FwlMtOuF-UljNBiLEC0ALkSC6sUSFK6DG3iBbvzUQiaW3Z731tAg0HHqJ4ul8O2u-ov_gctSYt"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-headline-md text-base">
                    Boost Your Sales
                  </h3>
                  <p className="text-white/80 font-body-md text-sm mt-1.5 max-w-md">
                    Our new AI-driven promotion tool helps you target the right
                    customers at the right time.
                  </p>
                  <button className="mt-3 text-white font-label-bold text-xs flex items-center group-hover:translate-x-2 transition-transform">
                    Learn More{" "}
                    <span className="material-symbols-outlined ml-2">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
              <div className="col-span-4 bg-primary-container p-6 rounded-2xl flex flex-col justify-between custom-shadow">
                <div>
                  <span className="material-symbols-outlined text-white text-3xl">
                    local_fire_department
                  </span>
                  <h3 className="text-white font-headline-sm text-sm mt-3">
                    Trending Now
                  </h3>
                  <p className="text-white/80 font-body-sm text-xs mt-1.5">
                    "Summer Truffle Pasta" is currently your most viewed item
                    this hour.
                  </p>
                </div>
                <a
                  href="#"
                  className="text-white font-label-bold text-xs underline underline-offset-4"
                >
                  Manage Availability
                </a>
              </div>
              <div className="col-span-4 bg-white p-6 rounded-2xl flex flex-col justify-between custom-shadow border border-surface-variant">
                <div>
                  <span className="material-symbols-outlined text-primary text-3xl">
                    reviews
                  </span>
                  <h3 className="text-on-surface font-headline-sm text-sm mt-3">
                    New Review
                  </h3>
                  <p className="text-on-surface-variant font-body-sm text-xs mt-1.5">
                    "Best service in the city! The ambiance is unmatched..."
                  </p>
                </div>
                <div className="flex items-center text-primary-container">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "menu" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                  Menu Management
                </h2>
                <p className="font-body-lg text-base text-on-surface-variant mt-2">
                  Create and manage your restaurant menu items
                </p>
              </div>
              <button
                onClick={() => {
                  resetMenuItemForm();
                  setShowAddMenuItemModal(true);
                }}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Menu Item
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              {menuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <span className="text-primary font-bold">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded-lg my-3"
                        />
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Category: {item.category || "Uncategorized"}
                      </p>
                      <span
                        className={`text-xs mt-1 ${
                          item.is_available ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.is_available ? "Available" : "Not Available"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">
                  No menu items yet. Add your first item!
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Orders Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-2">
                Track and manage all incoming orders
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow overflow-x-auto">
              {orders.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-lowest text-on-surface-variant font-label-bold text-xs border-b border-surface-variant">
                      <th className="px-6 py-3.5">Order ID</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Phone</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Time</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant font-body-md text-sm">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4 text-on-surface font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4">{order.customerName}</td>
                        <td className="px-6 py-4 text-on-surface-variant text-xs">
                          {(order as any).customer_phone || "—"}
                        </td>
                        <td className="px-6 py-4 text-xs capitalize">
                          {(order as any).order_type || "dine-in"}
                        </td>
                        <td className="px-6 py-4 text-primary-container font-semibold">
                          {formatNumber(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{formatTime(order.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* View details */}
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                            >
                              Details
                            </button>
                            {/* Approve — only for pending */}
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                                className="text-xs px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 font-semibold"
                              >
                                Approve
                              </button>
                            )}
                            {/* Reject — for pending or preparing */}
                            {(order.status === "pending" || order.status === "preparing") && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
                              >
                                Reject
                              </button>
                            )}
                            {/* Progress dropdown for non-terminal statuses */}
                            {!["pending", "cancelled", "completed"].includes(order.status) && (
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-gray-300"
                              >
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="served">Served</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-on-surface-variant text-sm">No orders yet.</p>
              )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedOrder(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <h3 className="text-lg font-bold text-on-surface mb-1">
                    Order #{String(selectedOrder.id).padStart(3, "0")}
                  </h3>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Customer</p><p className="font-semibold">{selectedOrder.customer_name}</p></div>
                    <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold">{selectedOrder.customer_phone}</p></div>
                    <div><p className="text-xs text-gray-500">Order Type</p><p className="font-semibold capitalize">{selectedOrder.order_type}</p></div>
                    <div><p className="text-xs text-gray-500">Payment</p><p className="font-semibold">{selectedOrder.payment_method || "—"}</p></div>
                    <div><p className="text-xs text-gray-500">Total</p><p className="font-bold text-primary">${Number(selectedOrder.total_amount).toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">Time</p><p className="font-semibold">{formatTime(selectedOrder.created_at)}</p></div>
                    {selectedOrder.delivery_address && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Delivery Address</p><p className="font-semibold">{selectedOrder.delivery_address}</p></div>
                    )}
                    {selectedOrder.notes && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="font-semibold">{selectedOrder.notes}</p></div>
                    )}
                  </div>

                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                      <div className="border rounded-lg overflow-hidden">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center px-4 py-2.5 border-b last:border-b-0 text-sm">
                            <span>{item.quantity}× {item.menu_item_name}</span>
                            <span className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === "pending" && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => { handleUpdateOrderStatus(String(selectedOrder.id), "preparing"); setSelectedOrder(null); }}
                        className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm"
                      >
                        Approve Order
                      </button>
                      <button
                        onClick={() => { handleUpdateOrderStatus(String(selectedOrder.id), "cancelled"); setSelectedOrder(null); }}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm"
                      >
                        Reject Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "tables" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                  Table Management
                </h2>
                <p className="font-body-lg text-base text-on-surface-variant mt-2">
                  Manage your restaurant tables
                </p>
              </div>
              <button
                onClick={() => {
                  resetTableForm();
                  setShowAddTableModal(true);
                }}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Table
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              {tables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold">
                          Table {table.table_number}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTable(table)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Capacity: {table.capacity} people
                      </p>
                      {table.location_description && (
                        <p className="text-xs text-gray-500 mt-1">
                          Location: {table.location_description}
                        </p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          table.is_active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {table.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">
                  No tables yet. Add your first table!
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "waiters" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto pb-16">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">Staff Management</h2>
                <p className="font-body-lg text-base text-on-surface-variant mt-1">Manage all staff — waiters, managers, security &amp; more</p>
              </div>
              <button
                onClick={() => { resetWaiterForm(); setShowAddWaiterModal(true); }}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">person_add</span>
                Add Staff Member
              </button>
            </div>

            {/* Role filter tabs */}
            {(() => {
              const roles = ["all", "waiter", "manager", "security", "chef", "cashier"];
              const filtered = activeStaffRole === "all" ? waiters : waiters.filter(w => w.staff_role === activeStaffRole);
              const roleColors: Record<string, string> = {
                waiter: "bg-blue-100 text-blue-700",
                manager: "bg-purple-100 text-purple-700",
                security: "bg-red-100 text-red-700",
                chef: "bg-orange-100 text-orange-700",
                cashier: "bg-green-100 text-green-700",
              };
              const statusColors: Record<string, string> = {
                active: "bg-green-100 text-green-700",
                inactive: "bg-gray-100 text-gray-500",
                on_leave: "bg-yellow-100 text-yellow-700",
              };
              return (
                <>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {roles.map(r => (
                      <button
                        key={r}
                        onClick={() => setActiveStaffRole(r)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${activeStaffRole === r ? "bg-primary-container text-on-primary" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}
                      >
                        {r === "all" ? `All (${waiters.length})` : `${r} (${waiters.filter(w => w.staff_role === r).length})`}
                      </button>
                    ))}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-on-surface-variant custom-shadow">
                      <span className="material-symbols-outlined text-4xl mb-3 block text-gray-300">group</span>
                      No staff in this category yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map((waiter) => (
                        <div key={waiter.id} className="bg-white rounded-xl border border-gray-100 p-5 custom-shadow hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            {waiter.photo_url ? (
                              <img src={`http://localhost:5000${waiter.photo_url}`} alt={waiter.first_name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold border-2 border-gray-100">
                                {waiter.first_name[0]}{waiter.last_name[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{waiter.first_name} {waiter.last_name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[waiter.staff_role || "waiter"] || "bg-gray-100 text-gray-600"}`}>
                                {waiter.staff_role || "waiter"}
                              </span>
                            </div>
                          </div>

                          {waiter.task && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Current Task</p>
                              <p className="text-xs text-amber-800">{waiter.task}</p>
                            </div>
                          )}

                          <div className="space-y-1 text-xs text-gray-500 mb-4">
                            {waiter.phone && <p>📞 {waiter.phone}</p>}
                            {waiter.email && <p>✉️ {waiter.email}</p>}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[waiter.status || "active"]}`}>
                              {(waiter.status || "active").replace("_", " ")}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditWaiter(waiter)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button onClick={() => handleDeleteWaiter(waiter.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Analytics & Insights
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-2">
                Monitor your restaurant performance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {analytics && (
                <>
                  <div className="bg-white p-6 rounded-xl custom-shadow">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-bold text-xl">
                          {analytics.total_orders}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-bold text-xl">
                          {formatNumber(Number(analytics.total_revenue))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg. Order Value</span>
                        <span className="font-bold text-xl">
                          {formatNumber(Number(analytics.avg_order_value))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl custom-shadow">
                    <h3 className="text-lg font-bold mb-4">Orders by Status</h3>
                    <div className="space-y-3">
                      {statusCounts.length > 0 ? (
                        statusCounts.map((statusCount) => (
                          <div
                            key={statusCount.status}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-600">
                              {getStatusLabel(statusCount.status)}
                            </span>
                            <span className="font-bold">
                              {statusCount.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No data</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl custom-shadow mb-8">
              <h3 className="text-lg font-bold mb-4">Top Menu Items</h3>
              {topItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Sold: {item.total_sold}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No items sold yet</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto pb-16">
            <div className="mb-8">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">Settings</h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-2">
                Manage your restaurant information and preferences
              </p>
            </div>

            <SettingsPanel
              restaurant={restaurant}
              onSaved={(updated) => setRestaurant(updated)}
            />
          </section>
        )}

        {/* Modals */}
        {showAddTableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-on-surface">
                  {editingTable ? "Edit Table" : "Add New Table"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddTableModal(false);
                    resetTableForm();
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={tableForm.table_number}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        table_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={tableForm.capacity}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        capacity: parseInt(e.target.value) || 2,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Location Description
                  </label>
                  <input
                    type="text"
                    value={tableForm.location_description}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        location_description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Near window"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="table_active"
                    checked={tableForm.is_active}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="table_active"
                    className="text-sm text-on-surface"
                  >
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddTableModal(false);
                    resetTableForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateTable}
                  className="flex-1 px-4 py-2 bg-primary-container text-on-primary rounded-lg hover:opacity-90"
                >
                  {editingTable ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddWaiterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-on-surface">
                  {editingWaiter ? "Edit Staff Member" : "Add Staff Member"}
                </h3>
                <button onClick={() => { setShowAddWaiterModal(false); resetWaiterForm(); }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Photo upload */}
                <div className="flex flex-col items-center gap-3">
                  {waiterForm.photo_url ? (
                    <img src={`http://localhost:5000${waiterForm.photo_url}`} alt="Staff" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </div>
                  )}
                  <label className="cursor-pointer text-xs font-semibold text-primary-container hover:opacity-80 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("photo", file);
                        const res = await fetch("http://localhost:5000/upload/staff-photo", {
                          method: "POST",
                          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
                          body: fd,
                        });
                        const data = await res.json();
                        if (data.url) setWaiterForm(p => ({ ...p, photo_url: data.url }));
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name</label>
                    <input type="text" value={waiterForm.first_name} onChange={(e) => setWaiterForm({ ...waiterForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
                    <input type="text" value={waiterForm.last_name} onChange={(e) => setWaiterForm({ ...waiterForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
                    <select value={waiterForm.staff_role} onChange={(e) => setWaiterForm({ ...waiterForm, staff_role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                      <option value="waiter">Waiter</option>
                      <option value="manager">Manager</option>
                      <option value="security">Security</option>
                      <option value="chef">Chef</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                    <select value={waiterForm.status} onChange={(e) => setWaiterForm({ ...waiterForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assign Task</label>
                  <input type="text" value={waiterForm.task} onChange={(e) => setWaiterForm({ ...waiterForm, task: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="e.g. Cover tables 1-5 tonight" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                    <input type="text" value={waiterForm.phone} onChange={(e) => setWaiterForm({ ...waiterForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="+123456789" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                    <input type="email" value={waiterForm.email} onChange={(e) => setWaiterForm({ ...waiterForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="john@example.com" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => { setShowAddWaiterModal(false); resetWaiterForm(); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button onClick={handleAddOrUpdateWaiter}
                  className="flex-1 px-4 py-2.5 bg-primary-container text-on-primary rounded-lg hover:opacity-90 text-sm font-semibold">
                  {editingWaiter ? "Update" : "Add Staff Member"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddMenuItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-on-surface">
                  {editingMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddMenuItemModal(false);
                    resetMenuItemForm();
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={menuItemForm.name}
                    onChange={(e) =>
                      setMenuItemForm({ ...menuItemForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Pizza Margherita"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Description
                  </label>
                  <textarea
                    value={menuItemForm.description}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Delicious pizza with fresh mozzarella"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={menuItemForm.price}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="15.99"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={menuItemForm.category}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Main Course"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={menuItemForm.image_url}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        image_url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="menu_item_available"
                    checked={menuItemForm.is_available}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        is_available: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="menu_item_available"
                    className="text-sm text-on-surface"
                  >
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddMenuItemModal(false);
                    resetMenuItemForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateMenuItem}
                  className="flex-1 px-4 py-2 bg-primary-container text-on-primary rounded-lg hover:opacity-90"
                >
                  {editingMenuItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
