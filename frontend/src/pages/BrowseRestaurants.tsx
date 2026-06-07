import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi } from "../lib/api";

interface RestaurantCard {
  id: number;
  name: string;
  cuisine_type: string;
  description?: string;
  phone?: string;
  image?: string;
}

export default function BrowseRestaurants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultImages = [
    "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantApi.getAll();
        if (data.success && data.restaurants) {
          setRestaurants(data.restaurants);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-[#1a1a2e]" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1a1a2e]">Browse Restaurants</h1>
              <p className="text-sm text-[#4a4a68]">Discover amazing food near you</p>
            </div>
            {user && (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Dashboard
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search restaurants by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8722a]/50 focus:border-[#e8722a]"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-7 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">
              {searchQuery ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-[#4a4a68] mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Sign up as a restaurant owner to add the first restaurant"}
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold rounded-lg transition-colors"
            >
              Sign Up
              <Plus size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={restaurant.image || defaultImages[index % defaultImages.length]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/30 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  {restaurant.cuisine_type && (
                    <p className="text-sm font-medium text-[#e8722a] mb-3">
                      {restaurant.cuisine_type}
                    </p>
                  )}
                  {restaurant.description && (
                    <p className="text-sm text-[#4a4a68] line-clamp-3 mb-4">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <button className="w-full py-3 bg-[#e8722a] hover:bg-[#d4631f] text-white font-semibold rounded-lg transition-colors">
                      Book a Table
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
