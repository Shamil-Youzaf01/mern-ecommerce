import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,

  // Fetch all orders (admin) - with pagination
  fetchAllOrders: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `/orders/all?page=${page}&limit=${limit}`,
      );
      set({
        orders: response.data.orders,
        loading: false,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalResults: response.data.totalResults,
      });
    } catch (error) {
      set({ error: "Failed to fetch orders", loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/orders/${orderId}/status`, {
        status,
      });
      set((prevOrders) => ({
        orders: prevOrders.orders.map((order) =>
          order._id === orderId ? response.data : order,
        ),
        loading: false,
      }));
      toast.success("Order status updated");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    set({ loading: true });
    try {
      await axios.delete(`/orders/${orderId}`);
      set((prevOrders) => ({
        orders: prevOrders.orders.filter((order) => order._id !== orderId),
        loading: false,
      }));
      toast.success("Order deleted");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  },
}));
