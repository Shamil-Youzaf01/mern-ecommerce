import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,

  setProducts: (products) => set({ products }),

  createProduct: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to create product");
    }
  },

  fetchAllProducts: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products?page=${page}&limit=${limit}`);
      set({
        products: response.data.products,
        loading: false,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalResults: response.data.totalResults,
      });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  fetchProductsByCategory: async (category, page = 1, limit = 12) => {
    set({ products: [], loading: true });
    try {
      const response = await axios.get(
        `/products/category/${category}?page=${page}&limit=${limit}`,
      );
      set({
        products: response.data.products,
        loading: false,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalResults: response.data.totalResults,
      });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (product) => product._id !== productId,
        ),
        loading: false,
      }));
      toast.success("Product deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },

  updateProduct: async (id, formData) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === id ? res.data : product,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ featuredProducts: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));
