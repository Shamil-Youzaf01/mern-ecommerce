import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  UserPlus,
  LogIn,
  Lock,
  Search,
  User,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const { user } = useUserStore();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const { cart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const isHomePage = location.pathname === "/";
  const isCategoryPage = location.pathname.startsWith("/category");
  const showSearchBar = user && (isHomePage || isCategoryPage);

  const getCategoryFromUrl = () => {
    if (isCategoryPage) {
      const pathParts = location.pathname.split("/");
      return pathParts[2];
    }
    return null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const category = getCategoryFromUrl();
      const searchUrl = category
        ? `/search?q=${encodeURIComponent(searchQuery.trim())}&category=${encodeURIComponent(category)}`
        : `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      navigate(searchUrl);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
          >
            Orbit
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            {showSearchBar && (
              <form
                onSubmit={handleSearch}
                className="relative hidden md:block"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-emerald-400"
                >
                  <Search size={18} />
                </button>
              </form>
            )}
            {user && (
              <>
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center"
                >
                  <User
                    className="inline-block mr-1 group-hover:text-emerald-400"
                    size={20}
                  />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* Cart Link */}
                <Link
                  to={"/cart"}
                  className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
                >
                  <ShoppingCart
                    className="inline-block mr-1 group-hover:text-emerald-400"
                    size={20}
                  />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                to={"/secret-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {!user && (
              <>
                <Link
                  to={"/signup"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to={"/login"}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
