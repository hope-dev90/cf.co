import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  Star,
  Clock,
  ChevronRight,
  Loader,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { orderApi, restaurantApi } from "../lib/api";
import BookingFlow from "../components/booking/BookingFlow";
import type { ApiRestaurant } from "../types/booking";

interface DisplayRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  image: string;
  category: string;
  raw?: ApiRestaurant;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurantName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  paymentMethod?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const FALLBACK_RESTAURANTS: DisplayRestaurant[] = [
  {
    id: "1",
    name: "Pizzeria Bella",
    cuisine: "Italian",
    rating: 4.8,
    deliveryTime: 25,
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Pizza",
  },
  {
    id: "2",
    name: "Tokyo Sushi",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: 30,
    image:
      "https://images.pexels.com/photos/298310/pexels-photo-298310.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Sushi",
  },
  {
    id: "3",
    name: "Burger Junction",
    cuisine: "American",
    rating: 4.6,
    deliveryTime: 20,
    image:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Burgers",
  },
];

const RESTAURANT_IMAGES = [
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/298310/pexels-photo-298310.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/941862/pexels-photo-941862.jpeg?auto=compress&cs=tinysrgb&w=400",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "preparing":
      return "bg-orange-100 text-orange-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "completed":
    case "delivered":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const mapApiRestaurant = (
  restaurant: ApiRestaurant,
  index: number,
): DisplayRestaurant => ({
  id: String(restaurant.id),
  name: restaurant.name,
  cuisine: restaurant.cuisine_type || "Restaurant",
  rating: 4.5 + (index % 5) * 0.1,
  deliveryTime: 20 + (index % 4) * 5,
  image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
  category: restaurant.cuisine_type || "All",
  raw: restaurant,
});

const RestaurantCard: React.FC<{
  restaurant: DisplayRestaurant;
  onBook: (restaurant: DisplayRestaurant) => void;
}> = ({ restaurant, onBook }) => {
  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={() => onBook(restaurant)}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all duration-300 group-hover:bg-opacity-40 group-hover:opacity-100"
        >
          <span className="rounded-lg bg-[#e8722a] px-6 py-2 font-semibold text-white">
            Book Now
          </span>
        </button>
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-lg font-bold text-gray-900">
          {restaurant.name}
        </h3>
        <p className="mb-3 text-sm text-gray-600">{restaurant.cuisine}</p>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={16} fill="#e8722a" color="#e8722a" />
            <span className="font-semibold text-gray-900">
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock size={16} />
            <span className="text-sm">{restaurant.deliveryTime} min</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onBook(restaurant)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] py-3 font-semibold text-white transition-colors hover:bg-[#0f0f1e]"
        >
          <CalendarDays size={18} />
          Book Table / Order
        </button>
      </div>
    </div>
  );
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {order.restaurantName}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="mb-3 border-b border-gray-200 pb-3">
        {order.items.map((item, idx) => (
          <p key={idx} className="text-sm text-gray-600">
            {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-gray-900">
            Total: ${order.totalAmount.toFixed(2)}
          </span>
          {order.paymentMethod && (
            <p className="text-xs text-gray-500 capitalize">
              Paid via {order.paymentMethod}
            </p>
          )}
        </div>
        <button
          type="button"
          className="flex items-center gap-2 font-semibold text-[#e8722a]"
        >
          View Details
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"browse" | "orders" | "profile">(
    "browse",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderFilter, setOrderFilter] = useState<
    "All" | "Active" | "Completed"
  >("All");
  const [restaurants, setRestaurants] = useState<DisplayRestaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingRestaurant, setBookingRestaurant] =
    useState<ApiRestaurant | null>(null);

  const userName = authProfile?.name || user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantApi.getAll();
      const apiRestaurants = data.restaurants || [];
      if (apiRestaurants.length > 0) {
        setRestaurants(
          apiRestaurants.map((restaurant: ApiRestaurant, index: number) =>
            mapApiRestaurant(restaurant, index),
          ),
        );
      } else {
        setRestaurants(FALLBACK_RESTAURANTS);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants(FALLBACK_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApi.getMy();
      const apiOrders = data.orders || [];
      setOrders(
        apiOrders.map(
          (order: {
            id: number;
            restaurant_name?: string;
            created_at: string;
            total_amount: number | string;
            status: string;
            payment_method?: string;
            items?: Array<{
              menu_item_name: string;
              quantity: number;
              unit_price: number | string;
            }>;
          }) => ({
            id: String(order.id),
            restaurantName: order.restaurant_name || "Restaurant",
            orderDate: order.created_at,
            totalAmount: Number(order.total_amount),
            status: order.status,
            paymentMethod: order.payment_method,
            items: (order.items || []).map((item) => ({
              name: item.menu_item_name,
              quantity: item.quantity,
              price: Number(item.unit_price),
            })),
          }),
        ),
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "browse") {
      fetchRestaurants();
    }
  }, [activeTab, fetchRestaurants]);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  useEffect(() => {
    if (activeTab === "profile") {
      setLoading(true);
      setProfile({
        id: user?.id || "",
        name: userName,
        email: user?.email || "",
        phone: "",
      });
      setLoading(false);
    }
  }, [activeTab, user, userName]);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleBook = async (restaurant: DisplayRestaurant) => {
    if (restaurant.raw) {
      setBookingRestaurant(restaurant.raw);
      return;
    }

    try {
      const data = await restaurantApi.getById(restaurant.id);
      setBookingRestaurant(data.restaurant);
    } catch {
      setBookingRestaurant({
        id: Number(restaurant.id),
        name: restaurant.name,
        cuisine_type: restaurant.cuisine,
        operating_hours: null,
      });
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "All") return true;
    if (orderFilter === "Active")
      return ["pending", "preparing", "ready"].includes(order.status);
    if (orderFilter === "Completed")
      return ["completed", "delivered", "cancelled"].includes(order.status);
    return true;
  });

  const categories = [
    "All",
    ...Array.from(new Set(restaurants.map((restaurant) => restaurant.category))),
  ];

  return (
    <div className="flex h-screen bg-[#faf5f0]">
      <div className="flex w-64 flex-col bg-[#1a1a2e] shadow-lg">
        <div className="flex items-center gap-3 border-b border-gray-700 p-6">
          <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">CF Company</span>
        </div>

        <div className="flex items-center gap-4 border-b border-gray-700 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8722a] text-lg font-bold text-white">
            {userInitial}
          </div>
          <div>
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-sm text-gray-400">Food Lover</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-6">
          {[
            { id: "browse", label: "Browse & Book", icon: Search },
            { id: "orders", label: "My Orders", icon: ShoppingBag },
            { id: "profile", label: "Profile", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveTab(item.id as "browse" | "orders" | "profile")
                }
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  isActive ? "border-l-4 text-[#e8722a]" : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderLeftColor: isActive ? "#e8722a" : "transparent",
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 p-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-400 transition-colors hover:text-red-400"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "browse" && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-gray-600">
                Book a table, order online, and add your favorites to cart
              </p>
            </div>

            <div className="mb-8">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-2 font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#e8722a] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader className="animate-spin text-[#e8722a]" size={32} />
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onBook={handleBook}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <Search size={48} className="mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No restaurants found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                My Orders
              </h1>
              <p className="text-gray-600">
                Track your table bookings and online orders
              </p>
            </div>

            <div className="mb-8 flex gap-4">
              {(["All", "Active", "Completed"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setOrderFilter(filter)}
                  className={`px-6 py-2 font-medium transition-colors ${
                    orderFilter === filter
                      ? "bg-[#e8722a] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader className="animate-spin text-[#e8722a]" size={32} />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="max-w-3xl">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <ShoppingBag size={48} className="mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No orders yet
                </h3>
                <p className="text-gray-600">
                  Book a table or order online from Browse & Book
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl p-8">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                My Profile
              </h1>
              <p className="text-gray-600">Update your personal information</p>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader className="animate-spin text-[#e8722a]" size={32} />
              </div>
            ) : profile ? (
              <div className="rounded-lg bg-white p-8 shadow-md">
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setSaving(true);
                    try {
                      alert("Profile updated successfully!");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(event) =>
                        setProfile({ ...profile, name: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(event) =>
                        setProfile({ ...profile, email: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile({ ...profile, phone: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-[#e8722a] py-3 font-semibold text-white transition-colors hover:opacity-90"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {bookingRestaurant && (
        <BookingFlow
          restaurant={bookingRestaurant}
          profileName={userName}
          profileEmail={user?.email || ""}
          onClose={() => setBookingRestaurant(null)}
          onComplete={() => {
            if (activeTab === "orders") {
              fetchOrders();
            }
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
