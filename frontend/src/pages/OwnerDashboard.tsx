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
    });
    setShowAddWaiterModal(true);
  };

  const resetWaiterForm = (): void => {
    setWaiterForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
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
        className={`fixed left-0 top-0 h-full bg-[#1a1a2e] text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden md:relative md:w-80`}
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
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Time</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant font-body-md text-sm">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-surface-container-lowest transition-colors"
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
              ) : (
                <p className="text-on-surface-variant text-sm">
                  No orders yet.
                </p>
              )}
            </div>
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
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                  Waiter Management
                </h2>
                <p className="font-body-lg text-base text-on-surface-variant mt-2">
                  Manage your restaurant staff
                </p>
              </div>
              <button
                onClick={() => {
                  resetWaiterForm();
                  setShowAddWaiterModal(true);
                }}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Waiter
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              {waiters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {waiters.map((waiter) => (
                    <div
                      key={waiter.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          {waiter.first_name} {waiter.last_name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditWaiter(waiter)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteWaiter(waiter.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      {waiter.phone && (
                        <p className="text-sm text-gray-600 mt-1">
                          Phone: {waiter.phone}
                        </p>
                      )}
                      {waiter.email && (
                        <p className="text-sm text-gray-600 mt-1">
                          Email: {waiter.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">
                  No waiters yet. Add your first waiter!
                </p>
              )}
            </div>
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
          <section className="px-8 mt-8 max-w-screen-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Settings
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-2">
                Manage your restaurant information and preferences
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Settings interface will go here
              </p>
            </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-on-surface">
                  {editingWaiter ? "Edit Waiter" : "Add New Waiter"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddWaiterModal(false);
                    resetWaiterForm();
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={waiterForm.first_name}
                    onChange={(e) =>
                      setWaiterForm({
                        ...waiterForm,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={waiterForm.last_name}
                    onChange={(e) =>
                      setWaiterForm({
                        ...waiterForm,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="text"
                    value={waiterForm.phone}
                    onChange={(e) =>
                      setWaiterForm({ ...waiterForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="text"
                    value={waiterForm.email}
                    onChange={(e) =>
                      setWaiterForm({ ...waiterForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddWaiterModal(false);
                    resetWaiterForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateWaiter}
                  className="flex-1 px-4 py-2 bg-primary-container text-on-primary rounded-lg hover:opacity-90"
                >
                  {editingWaiter ? "Update" : "Add"}
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
