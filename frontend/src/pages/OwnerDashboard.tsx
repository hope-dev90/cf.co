import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  Search,
  ChefHat,
  Clock,
  MapPin,
  Phone,
  Image as ImageIcon,
  Check,
  AlertCircle,
  XCircle,
  Loader2,
  User,
  Table,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi, orderApi } from "../lib/api";

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toFixed(2)}`;
};

const formatCount = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Types
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  prepTime: number;
  available: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  notes: string;
  createdAt: string;
  estimatedDeliveryTime: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface RestaurantInfo {
  name: string;
  description: string;
  cuisineType: string;
  phone: string;
  address: string;
  imageUrl: string;
  active: boolean;
}

interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface DeliverySettings {
  deliveryRadius: number;
  minimumOrderAmount: number;
  deliveryFee: number;
}

interface Waiter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface RestaurantTable {
  id: string;
  tableNumber: string;
  capacity: number;
  locationDescription?: string;
  isActive: boolean;
  positionX: number;
  positionY: number;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
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
  >("dashboard");
  const [loading, setLoading] = useState(true);

  // Restaurant state
  const [restaurant, setRestaurant] = useState<any>(null);

  // Dashboard state
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayOrdersTrend] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueTrend] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [avgRating] = useState(4.5);
  const [ratingTrend] = useState(0);

  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState([
    "All",
    "Appetizers",
    "Main Course",
    "Desserts",
    "Drinks",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newMenuItemForm, setNewMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    imageUrl: "",
    prepTime: "",
    available: true,
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<
    | "all"
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled"
  >("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Waiters and Tables state
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newWaiterForm, setNewWaiterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [newTableForm, setNewTableForm] = useState({
    tableNumber: "",
    capacity: "",
    locationDescription: "",
    positionX: "12",
    positionY: "12",
  });

  // Analytics state
  const [analyticsDateRange, setAnalyticsDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("today");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [previousPeriodRevenue, setPreviousPeriodRevenue] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [topSellingItems, setTopSellingItems] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [peakHours, setPeakHours] = useState({
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  });
  const [customerInsights, setCustomerInsights] = useState({
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValueByType: { new: 0, returning: 0 },
  });

  // Settings state
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>({
    name: "",
    description: "",
    cuisineType: "",
    phone: "",
    address: "",
    imageUrl: "",
    active: true,
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([
    { day: "Monday", openTime: "11:00", closeTime: "22:00", isOpen: true },
    { day: "Tuesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
    { day: "Wednesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
    { day: "Thursday", openTime: "11:00", closeTime: "23:00", isOpen: true },
    { day: "Friday", openTime: "11:00", closeTime: "23:30", isOpen: true },
    { day: "Saturday", openTime: "10:00", closeTime: "23:30", isOpen: true },
    { day: "Sunday", openTime: "10:00", closeTime: "21:00", isOpen: true },
  ]);

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    deliveryRadius: 5,
    minimumOrderAmount: 20,
    deliveryFee: 3.99,
  });

  const [settingsForm, setSettingsForm] =
    useState<RestaurantInfo>(restaurantInfo);
  const [deliveryForm, setDeliveryForm] =
    useState<DeliverySettings>(deliverySettings);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch restaurant data
      const restaurantData = await restaurantApi.getMy();
      if (restaurantData.restaurants && restaurantData.restaurants.length > 0) {
        const rest = restaurantData.restaurants[0];
        setRestaurant(rest);
        setRestaurantInfo({
          name: rest.name || "",
          description: rest.description || "",
          cuisineType: rest.cuisine_type || "",
          phone: rest.phone || "",
          address: "",
          imageUrl: "",
          active: true,
        });

        // Fetch menu items
        const menuData = await restaurantApi.getMenu(rest.id);
        setMenuItems(
          (menuData.menuItems || []).map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || "",
            price: parseFloat(item.price),
            category: item.category || "Main Course",
            imageUrl: item.image_url || "",
            prepTime: 15,
            available: item.is_available,
          })),
        );

        // Fetch orders
        let ordersData = await orderApi.getByRestaurant(rest.id);
        if (orderFilterStatus !== "all") {
          ordersData = await orderApi.getByRestaurant(
            rest.id,
            orderFilterStatus,
          );
        }

        const formattedOrders = (ordersData.orders || []).map((order: any) => ({
          id: order.id.toString(),
          orderNumber: `#ORD-${String(order.id).padStart(3, "0")}`,
          customerName: order.customer_name || "Customer",
          customerEmail: "",
          customerAddress: order.delivery_address || "",
          customerPhone: order.customer_phone || "",
          items: (order.items || []).map((item: any) => ({
            menuItemId: item.menu_item_id?.toString() || "",
            name: item.menu_item_name || "Item",
            quantity: item.quantity || 0,
            price: parseFloat(item.unit_price) || 0,
          })),
          totalAmount: parseFloat(order.total_amount) || 0,
          status: order.status as any,
          notes: order.notes || "",
          createdAt: order.created_at || new Date().toISOString(),
          estimatedDeliveryTime: "30 min",
        }));

        setOrders(formattedOrders);

        // Calculate dashboard stats
        const today = new Date().toDateString();
        const todayOrderList = formattedOrders.filter(
          (o: any) => new Date(o.createdAt).toDateString() === today,
        );
        const todayRevenueTotal = todayOrderList.reduce(
          (sum: number, o: any) => sum + o.totalAmount,
          0,
        );
        const pendingCount = formattedOrders.filter(
          (o: any) => o.status === "pending",
        ).length;

        setTodayOrders(todayOrderList.length);
        setRevenueToday(todayRevenueTotal);
        setPendingOrders(pendingCount);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Menu handlers
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddMenuItem = async () => {
    if (restaurant && newMenuItemForm.name && newMenuItemForm.price) {
      try {
        await restaurantApi.addMenuItem(restaurant.id, {
          name: newMenuItemForm.name,
          description: newMenuItemForm.description,
          price: parseFloat(newMenuItemForm.price),
          category: newMenuItemForm.category,
          is_available: newMenuItemForm.available,
          image_url: newMenuItemForm.imageUrl,
        });

        // Refresh the list
        await fetchData();
        setNewMenuItemForm({
          name: "",
          description: "",
          price: "",
          category: "Main Course",
          imageUrl: "",
          prepTime: "",
          available: true,
        });
        setShowAddMenuItem(false);
      } catch (error) {
        console.error("Error adding menu item:", error);
      }
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await restaurantApi.deleteMenuItem(parseInt(id));
      await fetchData();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const item = menuItems.find((i) => i.id === id);
      if (item) {
        await restaurantApi.updateMenuItem(parseInt(id), {
          is_available: !item.available,
        });
        await fetchData();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
      setShowAddCategory(false);

      // Uncomment to save to Supabase:
      /*
      const saveCategory = async () => {
        try {
          const { error } = await supabase
            .from('menu_categories')
            .insert([{ name: newCategory, restaurant_id: restaurantInfo.id }]);

          if (error) throw error;
        } catch (error) {
          console.error('Error saving category:', error);
        }
      };
      saveCategory();
      */
    }
  };

  // Orders handlers
  const filteredOrders = orders.filter((order) => {
    if (orderFilterStatus === "all") return true;
    return order.status === orderFilterStatus;
  });

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await orderApi.updateStatus(parseInt(orderId), newStatus);
      await fetchData();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, "cancelled");
  };

  // Settings handlers
  const handleSaveRestaurantInfo = async () => {
    setSavingSettings(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRestaurantInfo(settingsForm);

      // Uncomment to save to Supabase:
      /*
      const { error } = await supabase
        .from('restaurants')
        .update(settingsForm)
        .eq('owner_id', user?.id);

      if (error) throw error;
      */
    } catch (error) {
      console.error("Error saving restaurant info:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveDeliverySettings = async () => {
    setSavingSettings(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDeliverySettings(deliveryForm);

      // Uncomment to save to Supabase:
      /*
      const { error } = await supabase
        .from('delivery_settings')
        .update(deliveryForm)
        .eq('restaurant_id', restaurantInfo.id);

      if (error) throw error;
      */
    } catch (error) {
      console.error("Error saving delivery settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateOperatingHours = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBgColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "preparing":
        return "bg-purple-500";
      case "ready":
        return "bg-green-500";
      case "delivered":
        return "bg-emerald-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf5f0]">
        <Loader2 className="w-12 h-12 text-[#e8722a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf5f0]">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#1a1a2e] text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden md:relative md:w-64`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold">CF Company</h1>
          </div>

          {/* Owner Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-[#16213e] rounded-lg">
            <Store className="w-5 h-5 text-[#e8722a]" />
            <div>
              <p className="text-xs text-gray-400">Owner Panel</p>
              <p className="text-sm font-semibold">{restaurantInfo.name}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "menu", label: "Menu", icon: BookOpen },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "waiters", label: "Waiters", icon: User },
              { id: "tables", label: "Tables", icon: Table },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-[#16213e] text-[#e8722a] border-l-4 border-[#e8722a]"
                    : "text-gray-300 hover:bg-[#16213e] hover:bg-opacity-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500 hover:bg-opacity-20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#16213e] text-white rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Welcome back, {authProfile?.name || "Owner"}!
                </h1>
                <p className="text-gray-600">
                  Here's your restaurant performance today
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Today's Orders",
                    value: formatCount(todayOrders),
                    trend: todayOrdersTrend,
                    icon: ShoppingBag,
                  },
                  {
                    label: "Revenue Today",
                    value: formatNumber(revenueToday),
                    trend: revenueTrend,
                    icon: BarChart3,
                  },
                  {
                    label: "Pending Orders",
                    value: formatCount(pendingOrders),
                    trend: -10,
                    icon: Clock,
                  },
                  {
                    label: "Average Rating",
                    value: avgRating,
                    trend: ratingTrend,
                    icon: UtensilsCrossed,
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-[#1a1a2e]">
                          {stat.value}
                        </p>
                      </div>
                      <div className="p-3 bg-[#faf5f0] rounded-lg">
                        <stat.icon className="w-6 h-6 text-[#e8722a]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4">
                      {stat.trend >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          stat.trend >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.trend >= 0 ? "+" : ""}
                        {stat.trend}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs yesterday
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">
                  Recent Orders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-mono text-gray-600">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {order.customerName}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#e8722a]">
                            ${order.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab("menu");
                    setShowAddMenuItem(true);
                  }}
                  className="px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="px-6 py-3 bg-white text-[#e8722a] border-2 border-[#e8722a] rounded-lg font-semibold hover:bg-[#faf5f0] transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  View All Orders
                </button>
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Menu Management
                </h1>
                <p className="text-gray-600">
                  Create and manage your restaurant menu items
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-3 items-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      selectedCategory === category
                        ? "bg-[#e8722a] text-white"
                        : "bg-white text-[#1a1a2e] border-2 border-gray-200 hover:border-[#e8722a]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {!showAddCategory && (
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="px-4 py-2 rounded-full font-semibold bg-white text-[#e8722a] border-2 border-dashed border-[#e8722a] hover:bg-[#faf5f0] transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Category
                  </button>
                )}
              </div>

              {/* Add Category Form */}
              {showAddCategory && (
                <div className="bg-white rounded-lg p-4 border-2 border-[#e8722a] space-y-3">
                  <label className="block text-sm font-semibold text-[#1a1a2e]">
                    New Category Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g., Soups, Salads"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategory("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                />
              </div>

              {/* Add Menu Item Button */}
              {!showAddMenuItem && (
                <button
                  onClick={() => setShowAddMenuItem(true)}
                  className="w-full px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </button>
              )}

              {/* Add Menu Item Form */}
              {showAddMenuItem && (
                <div className="bg-white rounded-lg p-6 border-2 border-[#e8722a] space-y-4">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Add New Menu Item
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={newMenuItemForm.name}
                      onChange={(e) =>
                        setNewMenuItemForm({
                          ...newMenuItemForm,
                          name: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <select
                      value={newMenuItemForm.category}
                      onChange={(e) =>
                        setNewMenuItemForm({
                          ...newMenuItemForm,
                          category: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    >
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Price"
                      step="0.01"
                      value={newMenuItemForm.price}
                      onChange={(e) =>
                        setNewMenuItemForm({
                          ...newMenuItemForm,
                          price: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="number"
                      placeholder="Prep Time (minutes)"
                      value={newMenuItemForm.prepTime}
                      onChange={(e) =>
                        setNewMenuItemForm({
                          ...newMenuItemForm,
                          prepTime: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={newMenuItemForm.description}
                    onChange={(e) =>
                      setNewMenuItemForm({
                        ...newMenuItemForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    rows={3}
                  />
                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={newMenuItemForm.imageUrl}
                    onChange={(e) =>
                      setNewMenuItemForm({
                        ...newMenuItemForm,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newMenuItemForm.available}
                      onChange={(e) =>
                        setNewMenuItemForm({
                          ...newMenuItemForm,
                          available: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      Available Now
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddMenuItem}
                      className="flex-1 px-4 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenuItem(false);
                        setNewMenuItemForm({
                          name: "",
                          description: "",
                          price: "",
                          category: "Main Course",
                          imageUrl: "",
                          prepTime: "",
                          available: true,
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items Grid */}
              {filteredMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      <div className="w-full h-40 bg-gradient-to-br from-[#e8722a] to-[#d4631f] flex items-center justify-center relative overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UtensilsCrossed className="w-12 h-12 text-white opacity-50" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-[#1a1a2e]">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#e8722a]">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{item.prepTime} min</span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                              item.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.available ? (
                              <>
                                <Check className="w-3 h-3" />
                                Available
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Unavailable
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
                              item.available
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                          >
                            {item.available ? (
                              <EyeOff className="w-3 h-3 inline mr-1" />
                            ) : (
                              <Eye className="w-3 h-3 inline mr-1" />
                            )}
                            {item.available ? "Unavailable" : "Available"}
                          </button>
                          <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                  <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">
                    No menu items yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first dish to get started!
                  </p>
                  <button
                    onClick={() => setShowAddMenuItem(true)}
                    className="px-6 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                  >
                    Add Menu Item
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Orders Management
                </h1>
                <p className="text-gray-600">
                  Track and manage all incoming orders
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all" as const, label: "All" },
                  { id: "pending" as const, label: "Pending" },
                  { id: "confirmed" as const, label: "Confirmed" },
                  { id: "preparing" as const, label: "Preparing" },
                  { id: "ready" as const, label: "Ready" },
                  { id: "delivered" as const, label: "Delivered" },
                  { id: "cancelled" as const, label: "Cancelled" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setOrderFilterStatus(filter.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      orderFilterStatus === filter.id
                        ? "bg-[#e8722a] text-white"
                        : "bg-white text-[#1a1a2e] border border-gray-300 hover:border-[#e8722a]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Order Header */}
                      <button
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order.id ? null : order.id,
                          )
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-left">
                            <p className="font-mono font-bold text-[#1a1a2e]">
                              {order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customerName}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#e8722a]">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </button>

                      {/* Order Details (Expandable) */}
                      {expandedOrderId === order.id && (
                        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-bold text-[#1a1a2e] mb-2">
                              Items
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm bg-white p-2 rounded"
                                >
                                  <span className="text-gray-700">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="font-semibold text-[#e8722a]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-[#1a1a2e]">
                              Customer Details
                            </h4>
                            <div className="text-sm text-gray-700 space-y-1">
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{order.customerPhone}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{order.customerAddress}</span>
                              </div>
                              {order.notes && (
                                <div className="mt-2 p-2 bg-white rounded border-l-2 border-[#e8722a]">
                                  <p className="text-xs text-gray-600 font-semibold">
                                    Notes:
                                  </p>
                                  <p className="text-xs">{order.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            {order.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      "confirmed",
                                    )
                                  }
                                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {order.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "preparing")
                                }
                                className="flex-1 px-4 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === "preparing" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "ready")
                                }
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.status === "ready" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "delivered")
                                }
                                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">
                    No orders
                  </h3>
                  <p className="text-gray-600">
                    {orderFilterStatus === "all"
                      ? "No orders yet. They will appear here when customers place them."
                      : `No ${orderFilterStatus} orders at the moment.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Analytics & Insights
                </h1>
                <p className="text-gray-600">
                  Monitor your restaurant performance
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: "today" as const, label: "Today" },
                  { id: "week" as const, label: "This Week" },
                  { id: "month" as const, label: "This Month" },
                  { id: "all" as const, label: "All Time" },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setAnalyticsDateRange(range.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      analyticsDateRange === range.id
                        ? "bg-[#e8722a] text-white"
                        : "bg-white text-[#1a1a2e] border border-gray-300 hover:border-[#e8722a]"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold text-[#e8722a]">
                        {formatNumber(totalRevenue || 4850)}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-[#e8722a] opacity-50" />
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">+22%</span>
                    <span className="text-gray-600"> vs previous period</span>
                  </div>
                </div>

                {/* Orders & AOV Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-[#1a1a2e]">
                        {formatCount(totalOrdersCount || 47)}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-[#e8722a] opacity-50" />
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Average Order Value: </span>
                    <span className="text-[#e8722a] font-semibold">
                      {formatNumber(averageOrderValue || 103.19)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend (Line Chart) */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">
                    Revenue Trend
                  </h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: [
                          "Mon",
                          "Tue",
                          "Wed",
                          "Thu",
                          "Fri",
                          "Sat",
                          "Sun",
                        ],
                        datasets: [
                          {
                            label: "Revenue",
                            data: [450, 520, 480, 610, 750, 820, 680],
                            borderColor: "#e8722a",
                            backgroundColor: "rgba(232, 114, 42, 0.1)",
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: "#e8722a",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value: any) {
                                return "$" + value;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Orders by Status (Doughnut Chart) */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">
                    Orders by Status
                  </h3>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: [
                          "Pending",
                          "Confirmed",
                          "Preparing",
                          "Ready",
                          "Delivered",
                          "Cancelled",
                        ],
                        datasets: [
                          {
                            data: [3, 5, 2, 1, 35, 1],
                            backgroundColor: [
                              "#ffc107",
                              "#17a2b8",
                              "#fd7e14",
                              "#28a745",
                              "#20c997",
                              "#dc3545",
                            ],
                            borderWidth: 2,
                            borderColor: "#ffffff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>

                {/* Top Selling Items (Bar Chart) */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">
                    Top Selling Items
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: [
                          "Grilled Salmon",
                          "Truffle Risotto",
                          "Crispy Calamari",
                          "Chocolate Lava Cake",
                          "Caesar Salad",
                        ],
                        datasets: [
                          {
                            label: "Orders",
                            data: [12, 10, 8, 15, 9],
                            backgroundColor: [
                              "#e8722a",
                              "#f59e0b",
                              "#f97316",
                              "#ea580c",
                              "#c2410c",
                            ],
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Peak Hours (Bar Chart) */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">
                    Peak Hours
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ["Morning", "Afternoon", "Evening", "Night"],
                        datasets: [
                          {
                            label: "Orders",
                            data: [5, 18, 20, 4],
                            backgroundColor: [
                              "#ffd700",
                              "#ff9500",
                              "#e8722a",
                              "#7c3aed",
                            ],
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Insights */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">
                  Customer Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: ["New Customers", "Returning Customers"],
                        datasets: [
                          {
                            data: [12, 35],
                            backgroundColor: ["#3b82f6", "#22c55e"],
                            borderWidth: 2,
                            borderColor: "#ffffff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ["New", "Returning"],
                        datasets: [
                          {
                            label: "Average Order Value ($)",
                            data: [95.5, 107.3],
                            backgroundColor: ["#3b82f6", "#22c55e"],
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value: any) {
                                return "$" + value;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiters Tab */}
          {activeTab === "waiters" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Waiter Management
                </h1>
                <p className="text-gray-600">
                  Manage your restaurant waiters and staff
                </p>
              </div>

              {/* Add Waiter Button */}
              {!showAddWaiter && (
                <button
                  onClick={() => setShowAddWaiter(true)}
                  className="w-full px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Waiter
                </button>
              )}

              {/* Add Waiter Form */}
              {showAddWaiter && (
                <div className="bg-white rounded-lg p-6 border-2 border-[#e8722a] space-y-4">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Add New Waiter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={newWaiterForm.firstName}
                      onChange={(e) =>
                        setNewWaiterForm({
                          ...newWaiterForm,
                          firstName: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newWaiterForm.lastName}
                      onChange={(e) =>
                        setNewWaiterForm({
                          ...newWaiterForm,
                          lastName: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newWaiterForm.email}
                      onChange={(e) =>
                        setNewWaiterForm({
                          ...newWaiterForm,
                          email: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newWaiterForm.phone}
                      onChange={(e) =>
                        setNewWaiterForm({
                          ...newWaiterForm,
                          phone: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowAddWaiter(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (newWaiterForm.firstName && newWaiterForm.lastName) {
                          setWaiters([
                            ...waiters,
                            {
                              id: String(Date.now()),
                              ...newWaiterForm,
                            },
                          ]);
                          setNewWaiterForm({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: "",
                          });
                          setShowAddWaiter(false);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                    >
                      Add Waiter
                    </button>
                  </div>
                </div>
              )}

              {/* Waiters List */}
              {waiters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {waiters.map((waiter) => (
                    <div
                      key={waiter.id}
                      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center">
                            <User className="w-6 h-6 text-[#e8722a]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#1a1a2e]">
                              {waiter.firstName} {waiter.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {waiter.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{waiter.phone || "Not provided"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setWaiters(
                              waiters.filter((w) => w.id !== waiter.id),
                            )
                          }
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                  <User className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">
                    No waiters yet
                  </h3>
                  <p className="text-gray-600">
                    Add your first waiter to get started!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === "tables" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Table Management
                </h1>
                <p className="text-gray-600">
                  Manage your restaurant tables and floor plan
                </p>
              </div>

              {/* Add Table Button */}
              {!showAddTable && (
                <button
                  onClick={() => setShowAddTable(true)}
                  className="w-full px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Table
                </button>
              )}

              {/* Add Table Form */}
              {showAddTable && (
                <div className="bg-white rounded-lg p-6 border-2 border-[#e8722a] space-y-4">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Add New Table
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Table Number"
                      value={newTableForm.tableNumber}
                      onChange={(e) =>
                        setNewTableForm({
                          ...newTableForm,
                          tableNumber: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={newTableForm.capacity}
                      onChange={(e) =>
                        setNewTableForm({
                          ...newTableForm,
                          capacity: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    <input
                      type="text"
                      placeholder="Location (e.g. Window)"
                      value={newTableForm.locationDescription}
                      onChange={(e) =>
                        setNewTableForm({
                          ...newTableForm,
                          locationDescription: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowAddTable(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (newTableForm.tableNumber && newTableForm.capacity) {
                          setTables([
                            ...tables,
                            {
                              id: String(Date.now()),
                              tableNumber: newTableForm.tableNumber,
                              capacity: Number(newTableForm.capacity),
                              locationDescription:
                                newTableForm.locationDescription,
                              isActive: true,
                              positionX: Number(newTableForm.positionX),
                              positionY: Number(newTableForm.positionY),
                            },
                          ]);
                          setNewTableForm({
                            tableNumber: "",
                            capacity: "",
                            locationDescription: "",
                            positionX: "12",
                            positionY: "12",
                          });
                          setShowAddTable(false);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all"
                    >
                      Add Table
                    </button>
                  </div>
                </div>
              )}

              {/* Tables List */}
              {tables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center">
                            <Table className="w-6 h-6 text-[#e8722a]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#1a1a2e]">
                              Table {table.tableNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {table.capacity} seats
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {table.locationDescription && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{table.locationDescription}</span>
                          </div>
                        )}
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            table.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {table.isActive ? (
                            <>
                              <Check className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setTables(tables.filter((t) => t.id !== table.id))
                          }
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                  <Table className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">
                    No tables yet
                  </h3>
                  <p className="text-gray-600">
                    Add your first table to get started!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
                  Settings
                </h1>
                <p className="text-gray-600">
                  Manage your restaurant information and preferences
                </p>
              </div>

              {/* Restaurant Info Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-2xl font-bold text-[#1a1a2e]">
                  Restaurant Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Description
                    </label>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cuisineType}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            cuisineType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Restaurant Image URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.imageUrl}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                    {settingsForm.imageUrl && (
                      <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                        <img
                          src={settingsForm.imageUrl}
                          alt="Restaurant"
                          className="w-full h-40 object-cover rounded"
                          onError={() => (
                            <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.active}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          active: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      Restaurant is Active (Open for Orders)
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveRestaurantInfo}
                  disabled={savingSettings}
                  className="w-full px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {savingSettings && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Restaurant Info
                </button>
              </div>

              {/* Operating Hours Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4">
                  Operating Hours
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Day
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Open Time
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Close Time
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Open
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {operatingHours.map((hour, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-semibold text-gray-700">
                            {hour.day}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              value={hour.openTime}
                              onChange={(e) =>
                                handleUpdateOperatingHours(
                                  idx,
                                  "openTime",
                                  e.target.value,
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#e8722a]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              value={hour.closeTime}
                              onChange={(e) =>
                                handleUpdateOperatingHours(
                                  idx,
                                  "closeTime",
                                  e.target.value,
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#e8722a]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={hour.isOpen}
                              onChange={(e) =>
                                handleUpdateOperatingHours(
                                  idx,
                                  "isOpen",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Settings Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-2xl font-bold text-[#1a1a2e]">
                  Delivery Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={deliveryForm.deliveryRadius}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          deliveryRadius: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Minimum Order Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliveryForm.minimumOrderAmount}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          minimumOrderAmount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                      Delivery Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliveryForm.deliveryFee}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          deliveryFee: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8722a]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveDeliverySettings}
                  disabled={savingSettings}
                  className="w-full px-6 py-3 bg-[#e8722a] text-white rounded-lg font-semibold hover:bg-[#d4631f] transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {savingSettings && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Delivery Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
