import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState([]);

  // Get filter values from URL
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  // Local state for filter inputs (not applied yet)
  const [localCategory, setLocalCategory] = useState(category);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSort, setLocalSort] = useState(sort);

  // Sync local state when URL changes (e.g., page load)
  useEffect(() => {
    setLocalCategory(category);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSort(sort);
  }, [category, minPrice, maxPrice, sort]);

  useEffect(() => {
    // Fetch unique categories once
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/products/search?q=");
        const uniqueCats = [
          ...new Set(data.products.map((p) => p.category)),
        ].sort();
        setCategories(uniqueCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let apiUrl = `/products/search?q=${encodeURIComponent(query)}`;
        if (category) apiUrl += `&category=${encodeURIComponent(category)}`;
        if (minPrice) apiUrl += `&minPrice=${minPrice}`;
        if (maxPrice) apiUrl += `&maxPrice=${maxPrice}`;
        apiUrl += `&sort=${sort}`;
        const { data } = await axios.get(apiUrl);
        setProducts(data.products);
        setTotalResults(data.totalResults);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, category, minPrice, maxPrice, sort]);

  // Apply filters - updates URL which triggers useEffect
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    if (localCategory) {
      newParams.set("category", localCategory);
    } else {
      newParams.delete("category");
    }

    if (localMinPrice) {
      newParams.set("minPrice", localMinPrice);
    } else {
      newParams.delete("minPrice");
    }

    if (localMaxPrice) {
      newParams.set("maxPrice", localMaxPrice);
    } else {
      newParams.delete("maxPrice");
    }

    newParams.set("sort", localSort);

    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalCategory("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSort("newest");

    const newParams = new URLSearchParams();
    newParams.set("q", query);
    setSearchParams(newParams);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {category
              ? `Search Results for "${query}" in ${category}`
              : `Search Results for "${query}"`}
          </h1>
          <p className="text-gray-400">
            Found {totalResults} {totalResults === 1 ? "result" : "results"}
          </p>
        </div>
        {products.length > 0 && (
          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            ← Back
          </Link>
        )}
      </div>

      {/* Filters - Now uses local state */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap flex-1 items-center">
          {/* Category */}
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-full px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-2 border border-gray-600">
            <span className="text-emerald-400 text-sm">₹</span>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              placeholder="Min"
              className="bg-transparent border-0 w-16 text-white text-sm focus:outline-none placeholder-gray-400"
            />
            <span className="text-gray-500">–</span>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              placeholder="Max"
              className="bg-transparent border-0 w-16 text-white text-sm focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* Sort */}
          <select
            value={localSort}
            onChange={(e) => setLocalSort(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-full px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
          </select>
        </div>

        {/* Apply/Clear Buttons */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition duration-300"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium transition duration-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No products found for "{query}".
          </p>
          <Link
            to="/"
            className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
