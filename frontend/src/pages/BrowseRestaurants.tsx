import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi } from "../lib/api";

// Use the real API restaurants with fallback images
const RESTAURANT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4dScZ7C51i3F4f0kD35GCHF-DvcThqkC-v1uQ6lHz57uOQUONkk42uWYXdPEAfXtzHiiY1UpLjOH-BOC3tS8DcyuAdHz0kzUZ1-dad1dYhwbLPDFExOVihiXgHF4tp4pOa6zNWmXhjbFjrURcoREDlp-EHzgQSQCU5kqK1MTQpB0gja-u9iLvpw4XXxFf9Vw7p1CBox_0L4z0hEWKdh0UpgvLFubyxpTUFXv4VcIi_F2HxkC7AS4DuCjQPKhKX9Es2eb8oe_Zmst0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzjYuUvNn5PPN-r9sSsDVT8FF9Pr4KcF3TKH7DCpOkDtuOCVowa36N5rWfh1MXVZowDZOBSG1O-wfWU8CtE1ohfE8Oe0fWclM576nBYAvkpYQB5UMA_qlb1AiFA12P_Ww_pgwOv2PX-Qj_qUuSkm3HGxF2QVKVcCQKtYtPyh49QpeqzcygiEeOB5fV7fQN8ILWdnnbPDYmqQOAmDRhtUYhYwokgAFcERx764pX4FXf7HA8Kedgw--biLuUd3v6FSkzQNVX7R4mDJyP",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCWNiUJE_N3qOInpzYns-Ip93kCebNvNBovJNDIM1BqObLxDKAhMQYp2Xea-bUur0ViLu4tvyreRqbR25v0UFJQ9XqY7_8_FuIULV1blaI8arKNMZb1oh34Q5a1zW2P2FXDwQqBtcDcgwFAAG3ddRft6dHTqkjwf8itCBzjrvxdvQgC_vEQN-zKevBRNsX9dct5Z5xt3CKSwQ9_ZQbq3SxpuAk-57twrXJiZixvnoidaMN8xV7DNLWBdfq7zpzxeW_BX8Hi2y67kuXM",
  "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const FALLBACK_RESTAURANTS = [
  {
    id: "1",
    name: "Gourmet Bistro",
    cuisine: "French",
    rating: 4.5,
    description: "We cook delicious food!",
  },
  {
    id: "2",
    name: "Test Bistro",
    cuisine: "International",
    rating: 4.5,
    description: "A cozy test restaurant serving delicious food!",
  },
  {
    id: "3",
    name: "Lumina Dining",
    cuisine: "Italian Modern",
    rating: 4.9,
    description:
      "Experience the future of fine dining with locally sourced ingredients.",
  },
];

interface RestaurantCard {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  description: string;
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
              description: restaurant.description || "We cook delicious food!",
              image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
              raw: restaurant,
            }),
          );
          setRestaurants(mappedRestaurants);
        } else {
          const mappedFallback = FALLBACK_RESTAURANTS.map((r, index) => ({
            ...r,
            image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
            raw: r,
          }));
          setRestaurants(mappedFallback);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        const mappedFallback = FALLBACK_RESTAURANTS.map((r, index) => ({
          ...r,
          image: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-body-lg text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-on-surface">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 max-w-container-max mx-auto bg-surface shadow-sm">
        <Link
          to="/"
          className="flex items-center gap-base cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-primary">
            arrow_back
          </span>
          <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
            Back Home
          </span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">
            Browse Restaurants
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Discover amazing food near you
          </p>
        </div>

        <div className="flex items-center gap-md">
          <nav className="hidden md:flex gap-md items-center">
            <Link
              to="/"
              className="text-primary border-b-2 border-primary pb-1 font-label-bold text-label-bold hover:text-primary transition-colors"
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
              className="bg-primary-container text-on-primary font-label-bold text-label-bold py-xs px-sm rounded hover:opacity-90 transition-opacity"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-primary-container text-on-primary font-label-bold text-label-bold py-xs px-sm rounded hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-xl px-margin-desktop max-w-container-max mx-auto min-h-screen">
        {/* Search Bar */}
        <section className="mb-lg">
          <div className="relative w-full max-w-container-max">
            <span className="material-symbols-outlined absolute left-base top-1/2 -translate-y-1/2 text-on-secondary-fixed-variant">
              search
            </span>
            <input
              ref={searchRef}
              className="w-full h-14 pl-12 pr-base rounded bg-surface border-b-2 border-surface-dim focus:border-primary-container focus:ring-0 transition-all text-body-md font-body-md outline-none custom-shadow"
              placeholder="Search restaurants by name or cuisine..."
              type="text"
            />
          </div>
        </section>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden custom-shadow group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  alt={restaurant.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={restaurant.image}
                />
              </div>
              <div className="p-md space-y-base">
                <div className="flex justify-between items-start">
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">
                    {restaurant.name}
                  </h2>
                  <div className="flex items-center text-primary-container">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1;" }}
                    >
                      star
                    </span>
                    <span className="text-label-bold font-label-bold ml-1">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-label-bold font-label-bold text-primary-container uppercase tracking-widest">
                  {restaurant.cuisine}
                </p>
                <p className="text-body-md font-body-md text-on-secondary-fixed-variant line-clamp-2">
                  {restaurant.description}
                </p>
                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="w-full mt-md bg-primary-container text-on-primary font-label-bold text-label-bold py-sm rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md block text-center"
                >
                  Book a Table
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-xl flex justify-center">
          <button className="flex items-center gap-xs text-primary font-label-bold text-label-bold hover:underline py-base px-lg transition-all">
            VIEW MORE RESTAURANTS
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container">
        <div className="text-center md:text-left">
          <h2 className="text-headline-sm font-headline-sm text-secondary">
            GourmetConcierge
          </h2>
          <p className="text-body-sm font-body-sm text-on-secondary-fixed-variant mt-1">
            © 2024 GourmetConcierge. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-md">
          <a
            href="#"
            className="text-label-bold font-label-bold text-on-secondary-fixed-variant hover:underline transition-all active:scale-95"
          >
            About Us
          </a>
          <a
            href="#"
            className="text-label-bold font-label-bold text-on-secondary-fixed-variant hover:underline transition-all active:scale-95"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-label-bold font-label-bold text-on-secondary-fixed-variant hover:underline transition-all active:scale-95"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-label-bold font-label-bold text-on-secondary-fixed-variant hover:underline transition-all active:scale-95"
          >
            Contact Support
          </a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full md:hidden bg-surface-container-highest flex justify-around items-center h-16 shadow-lg z-50">
        <Link
          to="/browse"
          className="flex flex-col items-center gap-1 text-primary"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1;" }}
          >
            restaurant
          </span>
          <span className="text-[10px] font-label-bold uppercase">Browse</span>
        </Link>
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-1 text-on-secondary-fixed-variant"
        >
          <span className="material-symbols-outlined">bookmark</span>
          <span className="text-[10px] font-label-bold uppercase">
            Bookings
          </span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1 text-on-secondary-fixed-variant"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-label-bold uppercase">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default BrowseRestaurants;
