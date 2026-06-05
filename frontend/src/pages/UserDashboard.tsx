import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Loader,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Types
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  image: string;
  category: string;
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Mock data for restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pizzeria Bella',
    cuisine: 'Italian',
    rating: 4.8,
    deliveryTime: 25,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Tokyo Sushi',
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: 30,
    image: 'https://images.pexels.com/photos/298310/pexels-photo-298310.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Sushi',
  },
  {
    id: '3',
    name: 'Burger Junction',
    cuisine: 'American',
    rating: 4.6,
    deliveryTime: 20,
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Burgers',
  },
  {
    id: '4',
    name: 'Wok Express',
    cuisine: 'Asian',
    rating: 4.7,
    deliveryTime: 35,
    image: 'https://images.pexels.com/photos/941862/pexels-photo-941862.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Asian',
  },
  {
    id: '5',
    name: 'Sweet Delights',
    cuisine: 'Desserts',
    rating: 4.9,
    deliveryTime: 15,
    image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Desserts',
  },
  {
    id: '6',
    name: 'Spice Palace',
    cuisine: 'Indian',
    rating: 4.7,
    deliveryTime: 40,
    image: 'https://images.pexels.com/photos/3756575/pexels-photo-3756575.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Asian',
  },
];

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-orange-100 text-orange-800';
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Restaurant Card Component
const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: '#e8722a',
              color: 'white',
            }}
          >
            Order Now
          </span>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{restaurant.cuisine}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star size={16} fill="#e8722a" color="#e8722a" />
            <span className="font-semibold text-gray-900">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock size={16} />
            <span className="text-sm">{restaurant.deliveryTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{order.restaurantName}</h3>
          <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="mb-3 pb-3 border-b border-gray-200">
        {order.items.map((item, idx) => (
          <p key={idx} className="text-sm text-gray-600">
            {item.quantity}x {item.name} - ₹{(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900">Total: ₹{order.totalAmount.toFixed(2)}</span>
        <button
          className="flex items-center gap-2 font-semibold transition-colors"
          style={{ color: '#e8722a' }}
        >
          View Details
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Main Dashboard Component
const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'profile'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // In a real app, this would come from Supabase
        // const { data, error } = await supabase.from('restaurants').select('*');
        // if (error) throw error;
        setRestaurants(mockRestaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'browse') {
      fetchRestaurants();
    }
  }, [activeTab]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('orders')
        //   .select('*')
        //   .eq('user_id', user?.id);
        // if (error) throw error;

        // Mock orders data
        const mockOrders: Order[] = [
          {
            id: 'ORD001',
            restaurantName: 'Pizzeria Bella',
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 450,
            status: 'delivered',
            items: [
              { name: 'Margherita Pizza', quantity: 2, price: 200 },
              { name: 'Garlic Bread', quantity: 1, price: 50 },
            ],
          },
          {
            id: 'ORD002',
            restaurantName: 'Tokyo Sushi',
            orderDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            totalAmount: 620,
            status: 'ready',
            items: [
              { name: 'Salmon Nigiri', quantity: 12, price: 400 },
              { name: 'Miso Soup', quantity: 2, price: 110 },
            ],
          },
          {
            id: 'ORD003',
            restaurantName: 'Burger Junction',
            orderDate: new Date().toISOString(),
            totalAmount: 380,
            status: 'preparing',
            items: [
              { name: 'Classic Burger', quantity: 2, price: 180 },
              { name: 'Fries', quantity: 2, price: 80 },
              { name: 'Coke', quantity: 2, price: 60 },
            ],
          },
        ];

        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('user_id', user?.id)
        //   .single();
        // if (error) throw error;

        setProfile({
          id: user?.id || '',
          name: userName,
          email: user?.email || '',
          phone: '+91 98765 43210',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab, user, userName]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'All') return true;
    if (orderFilter === 'Active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    if (orderFilter === 'Completed') return ['delivered'].includes(order.status);
    return true;
  });

  const categories = ['All', 'Pizza', 'Sushi', 'Burgers', 'Asian', 'Desserts'];

  return (
    <div className="flex h-screen bg-gray-50" style={{ backgroundColor: '#faf5f0' }}>
      {/* Sidebar */}
      <div
        className="w-64 shadow-lg flex flex-col"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">CF Company</span>
        </div>

        {/* User Info */}
        <div className="p-6 flex items-center gap-4 border-b border-gray-700">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: '#e8722a' }}
          >
            {userInitial}
          </div>
          <div>
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-sm text-gray-400">Food Lover</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'browse'
                ? 'border-l-4 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderLeftColor: activeTab === 'browse' ? '#e8722a' : 'transparent',
              color: activeTab === 'browse' ? '#e8722a' : undefined,
            }}
          >
            <Search size={20} />
            <span className="font-medium">Browse</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'border-l-4 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderLeftColor: activeTab === 'orders' ? '#e8722a' : 'transparent',
              color: activeTab === 'orders' ? '#e8722a' : undefined,
            }}
          >
            <ShoppingBag size={20} />
            <span className="font-medium">My Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'border-l-4 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderLeftColor: activeTab === 'profile' ? '#e8722a' : 'transparent',
              color: activeTab === 'profile' ? '#e8722a' : undefined,
            }}
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
              <p className="text-gray-600">Discover delicious restaurants and food</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 bg-white"
                  style={{ focusRingColor: '#e8722a' }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex gap-3 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? '#e8722a' : undefined,
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Restaurant Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin" size={32} style={{ color: '#e8722a' }} />
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Search size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your food orders</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8">
              {(['All', 'Active', 'Completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-6 py-2 font-medium transition-colors ${
                    orderFilter === filter
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: orderFilter === filter ? '#e8722a' : undefined,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin" size={32} style={{ color: '#e8722a' }} />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="max-w-3xl">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <ShoppingBag size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Start ordering from your favorite restaurants</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Update your personal information</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin" size={32} style={{ color: '#e8722a' }} />
              </div>
            ) : profile ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      // In a real app, save to Supabase
                      // await supabase.from('profiles').update(profile).eq('user_id', user?.id);
                      alert('Profile updated successfully!');
                    } catch (error) {
                      console.error('Error saving profile:', error);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#e8722a' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#e8722a' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#e8722a' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#e8722a' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
