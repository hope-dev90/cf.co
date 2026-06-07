import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi } from "../lib/api";
import type { ApiRestaurant } from "../lib/api";

const FOOD_IMAGES = [
  "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const BrowseRestaurants: React.FC = () => {
  const { profile } = useAuth();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    restaurantApi
      .getAll()
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setError("Failed to load restaurants. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return restaurants;
    const q = search.toLowerCase();
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.cuisine_type || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q),
    );
  }, [restaurants, search]);

  const dashboardPath =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "restaurateur"
        ? "/owner"
        : "/dashboard";

  return (
    <div className="min-h-screen bg-[#faf5f0] text-[#1a1a2e] flex flex-col">
      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="CF Company" className="h-9 w-auto" />
            <span className="hidden sm:block text-lg font-bold text-[#1a1a2e]">CF Company</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-[#4a4a68] hover:text-[#e8722a] transition-colors">Home</Link>
            <Link to="/restaurants" className="text-sm font-semibold text-[#e8722a] border-b-2 border-[#e8722a] pb-0.5">Restaurants</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile ? (
              <Link to={dashboardPath}
                className="hidden sm:inline-flex px-4 py-2 bg-[#e8722a] text-white text-sm font-semibold rounded-lg hover:bg-[#d4631f] transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="hidden sm:inline-flex px-4 py-2 border border-[#e8722a] text-[#e8722a] text-sm font-semibold rounded-lg hover:bg-[#faf5f0] transition-colors">
                  Login
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 bg-[#e8722a] text-white text-sm font-semibold rounded-lg hover:bg-[#d4631f] transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-xl text-[#1a1a2e]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#4a4a68] hover:bg-[#faf5f0]">Home</Link>
            <Link to="/restaurants" onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#e8722a]">Restaurants</Link>
            {profile ? (
              <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#e8722a] text-center">Dashboard</Link>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-[#e8722a] border border-[#e8722a] text-center">Login</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#e8722a] text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Hero banner ── */}
      <section className="pt-16 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Browse Restaurants
          </h1>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Discover amazing dining experiences near you
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a68] text-xl pointer-events-none">
              search
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or cuisine…"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-[#1a1a2e] text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e8722a] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a4a68] hover:text-[#1a1a2e]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
        {/* Result count */}
        {!loading && !error && (
          <p className="text-sm text-[#4a4a68] mb-6">
            {search
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
              : `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} available`}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-red-400">error</span>
            <p className="text-[#1a1a2e] font-semibold">{error}</p>
            <button
              onClick={() => { setError(""); setLoading(true); restaurantApi.getAll().then(d => setRestaurants(d.restaurants || [])).catch(() => setError("Failed to load")).finally(() => setLoading(false)); }}
              className="px-6 py-2 bg-[#e8722a] text-white text-sm font-semibold rounded-lg hover:bg-[#d4631f] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-[#4a4a68] opacity-40">
              {restaurants.length === 0 ? "storefront" : "search_off"}
            </span>
            <p className="text-lg font-semibold text-[#1a1a2e]">
              {restaurants.length === 0 ? "No restaurants yet" : "No matches found"}
            </p>
            <p className="text-sm text-[#4a4a68] max-w-xs">
              {restaurants.length === 0
                ? "Be the first! Sign up as a restaurant owner to add yours."
                : `No restaurants match "${search}". Try a different search.`}
            </p>
            {search && (
              <button onClick={() => setSearch("")}
                className="px-5 py-2 border border-[#e8722a] text-[#e8722a] text-sm font-semibold rounded-lg hover:bg-[#faf5f0] transition-colors">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Restaurant grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant, index) => (
              <article
                key={restaurant.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={FOOD_IMAGES[index % FOOD_IMAGES.length]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Cuisine pill */}
                  {restaurant.cuisine_type && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#e8722a] text-xs font-bold px-3 py-1 rounded-full shadow">
                      {restaurant.cuisine_type}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-[#1a1a2e] mb-1 line-clamp-1">
                    {restaurant.name}
                  </h2>

                  {restaurant.description && (
                    <p className="text-sm text-[#4a4a68] line-clamp-2 mb-3 flex-1">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-[#4a4a68] mb-4">
                    {restaurant.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">phone</span>
                        {restaurant.phone}
                      </span>
                    )}
                    {restaurant.email && (
                      <span className="flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        <span className="truncate">{restaurant.email}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="mt-auto w-full py-2.5 bg-[#1a1a2e] hover:bg-[#e8722a] text-white text-sm font-semibold rounded-xl transition-all duration-300 text-center active:scale-95"
                  >
                    Book a Table
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#1a1a2e] text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CF Company" className="h-7 w-auto" />
            <span className="text-white font-semibold">CF Company</span>
          </div>
          <p>© 2024 CF Company. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#e8722a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#e8722a] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#e8722a] transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 shadow-lg">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-[#4a4a68] hover:text-[#e8722a] transition-colors">
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link to="/restaurants" className="flex flex-col items-center gap-0.5 text-[#e8722a]">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          <span className="text-[10px] font-semibold">Restaurants</span>
        </Link>
        <Link to={profile ? dashboardPath : "/login"} className="flex flex-col items-center gap-0.5 text-[#4a4a68] hover:text-[#e8722a] transition-colors">
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-semibold">{profile ? "Dashboard" : "Login"}</span>
        </Link>
      </nav>
    </div>
  );
};

export default BrowseRestaurants;
