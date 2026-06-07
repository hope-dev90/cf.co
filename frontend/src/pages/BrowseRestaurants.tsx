import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { restaurantApi } from "../lib/api";

const RESTAURANT_IMAGES = [
  "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg",
  "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
];

const FALLBACK_RESTAURANTS = [
  { id: "1", name: "Gourmet Bistro", cuisine: "French" },
  { id: "2", name: "Sushi Master", cuisine: "Japanese" },
  { id: "3", name: "Pizza Palace", cuisine: "Italian" },
];

interface RestaurantCard {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  raw: any;
}

const BrowseRestaurants: React.FC = () => {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Keep your original animation behavior
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

  // ✅ REAL API INTEGRATION
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantApi.getAll();

        if (data?.success && data?.restaurants?.length) {
          const mapped = data.restaurants.map((r: any, i: number) => ({
            id: String(r.id),
            name: r.name,
            cuisine: r.cuisine_type || "Restaurant",
            image: RESTAURANT_IMAGES[i % RESTAURANT_IMAGES.length],
            raw: r,
          }));
          setRestaurants(mapped);
        } else {
          throw new Error("No data");
        }
      } catch {
        // fallback
        setRestaurants(
          FALLBACK_RESTAURANTS.map((r, i) => ({
            ...r,
            image: RESTAURANT_IMAGES[i % RESTAURANT_IMAGES.length],
            raw: r,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-body-md text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-on-surface">
      {/* HEADER */}
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
              className="text-primary border-b-2 border-primary pb-1 font-label-bold text-label-bold"
            >
              Home
            </Link>
          </nav>

          {user ? (
            <Link
              to={
                user.role === "admin"
                  ? "/admin"
                  : user.role === "restaurant_owner"
                  ? "/owner"
                  : "/dashboard"
              }
              className="bg-primary-container text-on-primary py-xs px-sm rounded"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-primary-container text-on-primary py-xs px-sm rounded"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-32 pb-xl px-margin-desktop max-w-container-max mx-auto min-h-screen">
        {/* SEARCH */}
        <section className="mb-lg">
          <div className="relative w-full max-w-container-max">
            <span className="material-symbols-outlined absolute left-base top-1/2 -translate-y-1/2 text-on-secondary-fixed-variant">
              search
            </span>
            <input
              ref={searchRef}
              className="w-full h-14 pl-12 pr-base rounded bg-surface border-b-2 border-surface-dim focus:border-primary-container transition-all text-body-md outline-none custom-shadow"
              placeholder="Search restaurants..."
            />
          </div>
        </section>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden custom-shadow group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-md space-y-base">
                <h2 className="text-headline-sm text-on-surface">
                  {restaurant.name}
                </h2>

                <p className="text-label-bold text-primary-container uppercase">
                  {restaurant.cuisine}
                </p>

                <p className="text-body-md text-on-secondary-fixed-variant line-clamp-2">
                  {restaurant.raw?.description ||
                    `Enjoy ${restaurant.cuisine} cuisine`}
                </p>

                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="w-full mt-md bg-primary-container text-on-primary py-sm rounded-lg text-center block"
                >
                  Book a Table
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-lg px-margin-desktop flex justify-between items-center bg-surface-container">
        <h2 className="text-headline-sm text-secondary">
          GourmetConcierge
        </h2>
      </footer>
    </div>
  );
};

export default BrowseRestaurants;