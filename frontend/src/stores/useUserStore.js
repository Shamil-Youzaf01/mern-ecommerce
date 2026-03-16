import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  users: [],
  loading: false,
  usersLoading: false,
  checkingAuth: true,
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,

  fetchCsrfToken: async () => {
    try {
      await axios.get("/csrf-token");
      console.log("CSRF token cookie set"); //for debugging
    } catch (error) {
      console.error(
        "Failed to fetch CSRF token:",
        error.response?.data || error.message,
      );
    }
  },

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password do not match");
    }

    try {
      const res = await axios.post("auth/signup", { name, email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message || "An error occured, try later again",
      );
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });

    try {
      const res = await axios.post("auth/login", { email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message || "An error occured, try later again",
      );
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(
        error.response?.data.message || "An error occured during logout",
      );
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get("auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    try {
      const response = await axios.post("auth/refresh-token");
      return response.data;
    } catch (error) {
      set({ user: null });
      throw error;
    }
  },

  // ===== ADMIN FUNCTIONS =====

  fetchAllUsers: async (page = 1, limit = 10) => {
    set({ usersLoading: true });
    try {
      const response = await axios.get(`/auth/all?page=${page}&limit=${limit}`);
      set({
        users: response.data.users,
        usersLoading: false,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalResults: response.data.totalResults,
      });
    } catch (error) {
      set({ usersLoading: false });
      toast.error("Failed to fetch users");
    }
  },

  deleteUser: async (userId) => {
    set({ usersLoading: true });
    try {
      await axios.delete(`/auth/${userId}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== userId),
        usersLoading: false,
      }));
      toast.success("User deleted");
    } catch (error) {
      set({ usersLoading: false });
      toast.error("Failed to delete user");
    }
  },

  createAdmin: async (adminData) => {
    set({ loading: true });
    try {
      const response = await axios.post("/auth", adminData);
      set((state) => ({
        users: [...state.users, response.data],
        loading: false,
      }));
      toast.success("Admin created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  },

  // ===== UPDATE ADDRESS =====

  updateAddress: async (addressData) => {
    set({ loading: true });
    try {
      const response = await axios.put("/auth/address", addressData);
      set({ user: response.data, loading: false });
      toast.success("Address saved successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  },

  // ===== DELETE ADDRESS =====

  deleteAddress: async () => {
    set({ loading: true });
    try {
      const response = await axios.delete("/auth/address");
      set({ user: response.data, loading: false });
      toast.success("Address deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  },
}));

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;
        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
