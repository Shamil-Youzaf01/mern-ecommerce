// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, clearCart } =
    useCartStore();
  const { user } = useUserStore();

  const savings = (subtotal || 0) - (total || 0);
  const formattedSubtotal = (subtotal || 0).toFixed(2);
  const formattedTotal = (total || 0).toFixed(2);
  const formattedSavings = (savings || 0).toFixed(2);

  const discountPercentage = coupon?.discountPercentage || 0;

  // Store coupon code in a ref to avoid state changes during checkout
  const couponCodeRef = useRef(null);

  // Update ref when coupon is applied
  useEffect(() => {
    if (isCouponApplied && coupon) {
      couponCodeRef.current = coupon.code;
    } else {
      couponCodeRef.current = null;
    }
  }, [isCouponApplied, coupon]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      if (coupon) {
        useCartStore.setState({ coupon: null, isCouponApplied: false });
      }
      await loadRazorpayScript();

      const res = await axios.post("/payments/create-order", {
        products: cart,
        couponCode: isCouponApplied ? coupon?.code : null,
      });

      const { razorpayOrderId, amount, currency, key, mongoOrderId } = res.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: razorpayOrderId,
        name: "Orbit Ecommerce",
        description: "Order Payment",
        handler: async (response) => {
          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {
            console.warn("Payment was cancelled or incomplete");
            return;
          }
          try {
            const verifyRes = await axios.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: mongoOrderId,
            });

            if (verifyRes.data.message === "Payment verified successfully") {
              localStorage.setItem("lastOrderId", verifyRes.data.orderId);
              useCartStore.setState({ coupon: null, isCouponApplied: false });
              await useCartStore.getState().getMyCoupon(); // fetch the brand new coupon
              clearCart();
              await axios.delete("/cart", { data: { productId: undefined } });
              window.location.href = "/success";
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async () => {
            window.location.href = "/cancel";
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      if (error.response?.data?.error) {
        alert(`Payment failed: ${error.response.data.error}`);
      } else {
        alert("Payment failed. Please try again.");
      }
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dd className="text-base font-medium text-white">
              ₹{formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">
                -₹{formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-emerald-400">
                -{discountPercentage}% off
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-emerald-400">
              ₹{formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
