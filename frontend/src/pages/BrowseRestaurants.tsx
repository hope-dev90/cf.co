import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi } from "../lib/api";

const RESTAURANT_IMAGES = [
  "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const FALLBACK_RESTAURANTS = [
  {
    id: "1",
    name: "Gourmet Bistro",
    cuisine: "French",
    rating: 4.5,
    deliveryTime: 30,
  },
  {
    id: "2",
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: 25,
  },
  {
    id: "3",
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.3,
    deliveryTime: 20,
  },
];

interface RestaurantCard {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  image: string;
  category: string;
  raw: any;
}

const BrowseRestaurants: React.FC = () => {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { profile } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const input = searchRef.current;
    if (!input) return;

    const handleFocus = () => {
      input.parentElement?.classList.add("scale-[1.01]");
    };

    const handleBlur = () => {
      input.parentElement?.classList.remove("scale-[1.01]");
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantApi.getAll();
        if (data.success && data.restaurants && data.restaurants.length > 0) {
          const mappedRestaurants: RestaurantCard[] = data.restaurants.map(
            (restaurant, index) => ({
              id: String(restaurant.id),
              name: restaurant.name,
              cuisine: restaurant.cuisine_type || "Restaurant",
              rating: 4.5 + (index % 5) * 0.1,
              deliveryTime: 20 + (index % 4) * 5,
              image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
              category: restaurant.cuisine_type || "All",
              raw: restaurant,
            }),
          );
          setRestaurants(mappedRestaurants);
        } else {
          const mappedFallback = FALLBACK_RESTAURANTS.map((r, index) => ({
            ...r,
            image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
            category: r.cuisine,
            raw: r,
          }));
          setRestaurants(mappedFallback);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        const mappedFallback = FALLBACK_RESTAURANTS.map((r, index) => ({
          ...r,
          image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
          category: r.cuisine,
          raw: r,
        }));
        setRestaurants(mappedFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back Home</span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Browse Restaurants
            </h1>
            <p className="text-sm text-gray-500">
              Discover amazing food near you
            </p>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-4 items-center">
              <Link
                to="/"
                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
              >
                Home
              </Link>
            </nav>
            {profile ? (
              <Link
                to={
                  profile.role === "admin"
                    ? "/admin"
                    : profile.role === "restaurateur"
                      ? "/owner"
                      : "/dashboard"
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* SEARCH */}
        <section className="mb-12">
          <div className="relative max-w-3xl mx-auto transition-transform duration-300">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-lg outline-none shadow-sm"
              placeholder="Search restaurants by name or cuisine..."
              type="text"
            />
          </div>
        </section>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-2"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={restaurant.image}
                  alt={restaurant.name}
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900">
                    {restaurant.name}
                  </h2>

                  <div className="flex items-center text-yellow-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="ml-1 font-semibold">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">
                  {restaurant.cuisine}
                </p>

                <p className="text-gray-600 line-clamp-2">
                  {restaurant.raw.description ||
                    `Enjoy delicious ${restaurant.cuisine} cuisine!`}
                </p>

                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="w-full mt-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-center"
                >
                  Book a Table
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* LOAD MORE */}
        <div className="mt-16 flex justify-center">
          <button className="flex items-center gap-2 text-blue-600 font-semibold hover:underline py-2 px-6 transition-all text-lg">
            View More Restaurants
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-100">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-800">Gourmet Concierge</h2>
          <p className="text-sm text-gray-600 mt-1">
            © 2024 Gourmet Concierge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BrowseRestaurants;
