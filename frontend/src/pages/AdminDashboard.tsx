import React, { useState, useEffect } from "react";
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
  Eye,
  Edit,
  MoreVertical,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Sample data types
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "restaurant_owner" | "admin";
  joinedDate: string;
  avatar: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  owner: string;
  rating: number;
  status: "active" | "inactive";
  image: string;
  orders: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantName: string;
  items: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  date: string;
}

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

// Sample data generators
const generateSampleUsers = (): User[] => [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "user",
    joinedDate: "2024-01-15",
    avatar: "SJ",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    role: "restaurant_owner",
    joinedDate: "2024-02-20",
    avatar: "MC",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "user",
    joinedDate: "2024-03-10",
    avatar: "EW",
  },
  {
    id: "4",
    name: "Alex Kumar",
    email: "alex@example.com",
    role: "restaurant_owner",
    joinedDate: "2024-01-25",
    avatar: "AK",
  },
  {
    id: "5",
    name: "Lisa Martinez",
    email: "lisa@example.com",
    role: "user",
    joinedDate: "2024-04-05",
    avatar: "LM",
  },
];

const generateSampleRestaurants = (): Restaurant[] => [
  {
    id: "1",
    name: "The Spice House",
    cuisine: "Indian",
    owner: "Mike Chen",
    rating: 4.8,
    status: "active",
    image: "TSH",
    orders: 342,
  },
  {
    id: "2",
    name: "Bella Italia",
    cuisine: "Italian",
    owner: "Alex Kumar",
    rating: 4.6,
    status: "active",
    image: "BI",
    orders: 218,
  },
  {
    id: "3",
    name: "Dragon Wok",
    cuisine: "Chinese",
    owner: "Unknown",
    rating: 4.5,
    status: "active",
    image: "DW",
    orders: 156,
  },
  {
    id: "4",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    owner: "Unknown",
    rating: 4.3,
    status: "inactive",
    image: "TF",
    orders: 89,
  },
  {
    id: "5",
    name: "Burger Paradise",
    cuisine: "American",
    owner: "Unknown",
    rating: 4.4,
    status: "active",
    image: "BP",
    orders: 201,
  },
];

const generateSampleOrders = (): Order[] => [
  {
    id: "ORD-001",
    customerId: "1",
    customerName: "Sarah Johnson",
    restaurantName: "The Spice House",
    items: 3,
    total: 45.99,
    status: "delivered",
    date: "2024-06-04",
  },
  {
    id: "ORD-002",
    customerId: "3",
    customerName: "Emma Wilson",
    restaurantName: "Bella Italia",
    items: 2,
    total: 38.5,
    status: "ready",
    date: "2024-06-04",
  },
  {
    id: "ORD-003",
    customerId: "5",
    customerName: "Lisa Martinez",
    restaurantName: "Dragon Wok",
    items: 4,
    total: 52.75,
    status: "preparing",
    date: "2024-06-04",
  },
  {
    id: "ORD-004",
    customerId: "2",
    customerName: "Mike Chen",
    restaurantName: "Burger Paradise",
    items: 1,
    total: 22.99,
    status: "confirmed",
    date: "2024-06-04",
  },
  {
    id: "ORD-005",
    customerId: "4",
    customerName: "Alex Kumar",
    restaurantName: "Taco Fiesta",
    items: 5,
    total: 61.25,
    status: "pending",
    date: "2024-06-04",
  },
];

// Stat card component
const StatCardComponent: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <div
    className="bg-white rounded-lg shadow-md p-6 border-l-4"
    style={{ borderLeftColor: stat.color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {stat.value.toLocaleString()}
        </p>
        <p className="text-sm text-green-600 mt-2">
          +{stat.change}% this month
        </p>
      </div>
      <div className="text-4xl opacity-80">{stat.icon}</div>
    </div>
  </div>
);

// Overview Tab
const OverviewTab: React.FC = () => {
  const stats: StatCard[] = [
    {
      title: "Total Users",
      value: 2847,
      change: 12,
      icon: "👥",
      color: "#3b82f6",
    },
    {
      title: "Total Restaurants",
      value: 156,
      change: 8,
      icon: "🏪",
      color: "#e8722a",
    },
    {
      title: "Total Orders",
      value: 8392,
      change: 15,
      icon: "📦",
      color: "#10b981",
    },
    {
      title: "Revenue",
      value: 128450,
      change: 22,
      icon: "💰",
      color: "#14b8a6",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCardComponent key={idx} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Restaurant
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {generateSampleOrders().map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.restaurantName}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Restaurants
          </h3>
          <div className="space-y-4">
            {generateSampleRestaurants()
              .slice(0, 4)
              .map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {restaurant.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {restaurant.orders} orders
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-800" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
    preparing: { bg: "bg-orange-100", text: "text-orange-800" },
    ready: { bg: "bg-green-100", text: "text-green-800" },
    delivered: { bg: "bg-slate-100", text: "text-slate-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
    active: { bg: "bg-green-100", text: "text-green-800" },
    inactive: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  const style = styles[status] || styles.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Users Tab
const UsersTab: React.FC = () => {
  const [users] = useState<User[]>(generateSampleUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadgeStyle = (role: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      user: { bg: "bg-blue-100", text: "text-blue-800" },
      restaurant_owner: { bg: "bg-orange-100", text: "text-orange-800" },
      admin: { bg: "bg-teal-100", text: "text-teal-800" },
    };
    return styles[role] || styles.user;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => {
              const roleBadgeStyle = getRoleBadgeStyle(user.role);
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeStyle.bg} ${roleBadgeStyle.text}`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-sm flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                      <Eye size={16} /> View
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
          to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
          {filteredUsers.length} users
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Restaurants Tab
const RestaurantsTab: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    generateSampleRestaurants(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "inactive" : "active" }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="outline-none text-gray-700 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button className="w-full sm:w-auto bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Plus size={20} /> Add Restaurant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl font-bold text-white">
              {restaurant.image}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              <p className="text-xs text-gray-500 mt-1">
                Owner: {restaurant.owner}
              </p>

              <div className="flex items-center justify-between mt-3 py-2 border-t border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {restaurant.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {restaurant.orders} orders
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={restaurant.status === "active"}
                    onChange={() => handleToggleStatus(restaurant.id)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    {restaurant.status === "active" ? "Active" : "Inactive"}
                  </span>
                </label>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Orders Tab
const OrdersTab: React.FC = () => {
  const [orders] = useState<Order[]>(generateSampleOrders());
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "active" | "completed" | "cancelled"
  >("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filters = [
    "all",
    "pending",
    "active",
    "completed",
    "cancelled",
  ] as const;

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return order.status === "pending";
    if (activeFilter === "active")
      return ["confirmed", "preparing", "ready"].includes(order.status);
    if (activeFilter === "completed") return order.status === "delivered";
    if (activeFilter === "cancelled") return order.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? "bg-[#e8722a] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Items
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id,
                    )
                  }
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.restaurantName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                      View
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">
                          Order Details
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Customer ID:</span>{" "}
                          {order.customerId}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Items:</span>{" "}
                          {order.items} items
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Delivery Address:</span>{" "}
                          123 Main St, City
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">
                            Special Instructions:
                          </span>{" "}
                          No onions
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    platformName: "CF Company",
    commissionRate: 15,
    supportEmail: "support@feast.com",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Commented Supabase query pattern:
    // const { error } = await supabase
    //   .from('platform_settings')
    //   .update(settings)
    //   .eq('id', '1');
    // if (error) console.error('Error saving settings:', error);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Platform Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              The name displayed in emails and public pages
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) =>
                handleChange("commissionRate", parseFloat(e.target.value))
              }
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentage commission taken on each order
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address for customer support
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Save Settings
            </button>
            {saved && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
                <CheckCircle size={16} /> Settings saved successfully
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "restaurants" | "orders" | "settings"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    // Commented Supabase logout pattern:
    // const { error } = await supabase.auth.signOut();
    // if (error) console.error('Logout error:', error);

    await logout();
    navigate("/login");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "restaurants", label: "Restaurants", icon: <Store size={20} /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#faf5f0]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-[#1a1a2e] text-white transition-all duration-300 flex flex-col fixed md:static h-full z-50 md:z-auto`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold">CF Company</h1>
          </div>

          <div className="flex items-center gap-2 bg-[#e8722a] bg-opacity-20 px-3 py-2 rounded-lg border border-[#e8722a] border-opacity-30">
            <Shield size={16} className="text-[#e8722a]" />
            <span className="text-xs font-semibold text-[#e8722a]">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8722a] to-orange-600 flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-gray-700 text-[#e8722a] border-l-4 border-[#e8722a]"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 flex-1 md:flex-none ml-4 md:ml-0">
            {navItems.find((item) => item.id === activeTab)?.label ||
              "Overview"}
          </h2>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>Last updated: Today</span>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "restaurants" && <RestaurantsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
