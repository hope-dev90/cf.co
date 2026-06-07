import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi, orderApi } from "../lib/api";

const formatNumber = (num: number): string => {
  return `$${num.toFixed(2)}`;
};

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
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
    | "waiters"
    | "tables"
    | "categories"
    | "availability"
    | "promotions"
  >("dashboard");
  const [loading, setLoading] = useState(true);
  const [todayOrders, setTodayOrders] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await restaurantApi.getMy();
        if (
          restaurantData.restaurants &&
          restaurantData.restaurants.length > 0
        ) {
          const rest = restaurantData.restaurants[0];
          const ordersData = await orderApi.getByRestaurant(rest.id);
          const formattedOrders: Order[] = (ordersData.orders || []).map(
            (order: any) => ({
              id: order.id.toString(),
              orderNumber: `#ORD-${String(order.id).padStart(3, "0")}`,
              customerName: order.customer_name || "Customer",
              totalAmount: parseFloat(order.total_amount) || 0,
              status: order.status,
              createdAt: order.created_at || new Date().toISOString(),
            }),
          );

          setOrders(formattedOrders);

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
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-orange-100 text-orange-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-base text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#1a1a2e] text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden md:relative md:w-72`}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center gap-3 mb-7">
            <img src="/logo.png" alt="CF Company" className="h-8 w-auto" />
            <h1 className="text-lg font-bold">CF Company</h1>
          </div>

          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-[#16213e] transition-all text-sm"
            >
              <span className="material-symbols-outlined">home</span>
              <span>Back Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 mb-6 p-3 bg-[#16213e] rounded-lg">
            <span className="material-symbols-outlined text-[#e8722a]">
              store
            </span>
            <div>
              <p className="text-[11px] text-gray-400">Owner Panel</p>
              <p className="text-sm font-semibold">
                {authProfile?.name || "Owner"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: "dashboard" },
              { id: "menu", label: "Menu", icon: "menu_book" },
              { id: "orders", label: "Orders", icon: "shopping_bag" },
              { id: "waiters", label: "Waiters", icon: "person" },
              { id: "tables", label: "Tables", icon: "table_restaurant" },
              { id: "analytics", label: "Analytics", icon: "bar_chart" },
              { id: "settings", label: "Settings", icon: "settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
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
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-500 hover:bg-opacity-20 hover:text-red-400 transition-all text-sm"
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
        <header className="flex justify-between items-center h-14 px-8 sticky top-0 z-40 bg-surface-container-lowest shadow-sm max-w-screen-2xl mx-auto">
          <div className="flex items-center">
            <span className="font-headline-md text-lg font-bold text-primary mr-10">
              Menu Manager
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

          <div className="flex items-center space-x-5">
            <div className="relative flex items-center bg-surface-container-low rounded-full px-3.5 py-2 w-56 border border-outline-variant focus-within:border-primary transition-all">
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
                className="w-7 h-7 rounded-full border border-primary/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPnF8e340DfgCvtDXtsMxCDY7I6Mkx2xV0aP6BifNyYvfeDA2-UXbstrLoJe38AtR2HW8B8emyNPiUcpeC9YQIbK1t9bEpbDbwAMkvECp76iHVzQYeEvDxuo9jouwQzNQH-Wdb8_ZBmVBrPfCbquWWVQzyhZfwuwyXpR3rPKTHXaFWvTx1jazWCe_oz9hUvjUYM8jrAszO3bXe8xGexQ3riQFkBj4ur1kDUfw7WZ5zr-5hXFs349dbsGR4CVmZu4YMguDbRDUylYg"
              />
              <span className="material-symbols-outlined text-secondary">
                account_circle
              </span>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Welcome back, {authProfile?.name || "Owner"}!
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
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

            <div className="bg-white rounded-xl custom-shadow overflow-hidden mb-7">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant font-body-md text-sm">
                    {orders.slice(0, 5).map((order, index) => (
                      <tr
                        key={order.id}
                        className="hover:bg-surface-container-lowest transition-colors"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  setActiveTab("menu");
                }}
                className="bg-primary-container text-on-primary hover:opacity-90 active:scale-95 px-6 py-3 rounded-xl font-headline-sm text-sm transition-all flex items-center shadow-md"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Menu Item
              </button>
              <button
                onClick={() => {
                  setActiveTab("orders");
                }}
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
                  className="text-white font-label-bold text-xs underline underline-offset-4"
                  href="#"
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
                      style={{ fontVariationSettings: "'FILL' 1;" }}
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
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Menu Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Create and manage your restaurant menu items
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Menu management interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Orders Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Track and manage all incoming orders
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Orders management interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Analytics & Insights
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Monitor your restaurant performance
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Analytics interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Settings
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
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

        {activeTab === "waiters" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Waiter Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Manage your restaurant waiters and staff
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Waiter management interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "tables" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Table Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Manage your restaurant tables and floor plan
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Table management interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "categories" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Menu Categories
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Manage your menu categories
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Menu categories interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "availability" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Availability Management
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Manage your menu item availability
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Availability management interface will go here
              </p>
            </div>
          </section>
        )}

        {activeTab === "promotions" && (
          <section className="px-8 mt-7 max-w-screen-2xl mx-auto">
            <div className="mb-7">
              <h2 className="font-display-lg text-2xl text-on-surface tracking-tight">
                Promotions
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mt-1">
                Manage your restaurant promotions
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 custom-shadow">
              <p className="text-on-surface-variant text-sm">
                Promotions interface will go here
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
