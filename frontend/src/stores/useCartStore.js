import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const cartChannel = new BroadcastChannel("cart_sync");

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupon");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupon/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Coupon not found");
    }
  },

  removeCoupon: async () => {
    set({ isCouponApplied: false, coupon: null });
    get().calculateTotals();
    await get().getMyCoupon();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
      cartChannel.postMessage({ type: "CART_UPDATED" });
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  clearCart: async () => {
    try {
      await axios.delete("/cart");
    } catch (error) {
      console.error("Error clearing backend cart:", error);
    }
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    cartChannel.postMessage({ type: "CART_CLEARED" });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prev) => {
        const existing = prev.cart.find((i) => i._id === product._id);
        const newCart = existing
          ? prev.cart.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...prev.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
      cartChannel.postMessage({ type: "CART_UPDATED" });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  removeFromCart: async (productId) => {
    await axios.delete(`/cart`, { data: { productId } });
    set((prev) => ({ cart: prev.cart.filter((i) => i._id !== productId) }));
    get().calculateTotals();
    cartChannel.postMessage({ type: "CART_UPDATED" });
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) return get().removeFromCart(productId);
    await axios.put(`/cart/${productId}`, { quantity });
    set((prev) => ({
      cart: prev.cart.map((i) =>
        i._id === productId ? { ...i, quantity } : i,
      ),
    }));
    get().calculateTotals();
    cartChannel.postMessage({ type: "CART_UPDATED" });
  },

  calculateTotals: () => {
    const { cart, coupon, isCouponApplied } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );
    let total = subtotal;

    if (coupon && coupon.discountPercentage && isCouponApplied) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },

  initCartSync: () => {
    cartChannel.onmessage = (event) => {
      if (
        event.data.type === "CART_UPDATED" ||
        event.data.type === "CART_CLEARED"
      ) {
        get().getCartItems();
      }
    };
  },
}));
