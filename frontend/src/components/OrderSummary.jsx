// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, MapPin, Edit, Plus, Trash2 } from "lucide-react";
import axios from "../lib/axios";
import ShippingAddressForm from "./ShippingAddressForm";

const OrderSummary = () => {
  const {
    total,
    subtotal,
    coupon,
    isCouponApplied,
    cart,
    clearCart,
    initCartSync,
  } = useCartStore();
  const { user, updateAddress, deleteAddress } = useUserStore();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const savedAddress = user?.address;

  const savings = (subtotal || 0) - (total || 0);
  const formattedSubtotal = (subtotal || 0).toFixed(2);
  const formattedTotal = (total || 0).toFixed(2);
  const formattedSavings = (savings || 0).toFixed(2);

  const discountPercentage = coupon?.discountPercentage || 0;

  const couponCodeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    initCartSync();
  }, [initCartSync]);

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

  const handleAddressSubmit = async (addressData) => {
    await updateAddress(addressData);
    setShowAddressForm(false);
  };

  const handleDeleteAddress = async () => {
    if (window.confirm("Are you sure you want to delete your address?")) {
      await deleteAddress();
    }
  };

  const hasAddress = savedAddress && savedAddress.street;

  const handlePayment = async () => {
    if (isProcessingPayment) return;

    if (!hasAddress) {
      setShowAddressForm(true);
      return;
    }
    setIsProcessingPayment(true);
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
              await useCartStore.getState().getMyCoupon();
              clearCart();
              await axios.delete("/cart", { data: { productId: undefined } });
              navigate("/success");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await axios.post("/payments/cancel-order", {
                orderId: mongoOrderId,
              });
            } catch (e) {
              console.error("Failed to clear checkout lock:", e);
            } finally {
              setIsProcessingPayment(false);
              navigate("/cancel");
            }
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

      razorpay.on("payment.failed", async (response) => {
        console.error("Payment failed:", response.error);
        try {
          await axios.post("/payments/cancel-order", { orderId: mongoOrderId });
        } catch (e) {
          console.error("Failed to clear lock:", e);
        }
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
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Section - Separate Card */}
      <motion.div
        className="rounded-xl border border-gray-700 bg-gray-800 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
        </div>

        {showAddressForm ? (
          <ShippingAddressForm
            initialData={savedAddress}
            onSubmit={handleAddressSubmit}
            onCancel={() => setShowAddressForm(false)}
          />
        ) : (
          <div className="min-h-[100px]">
            {hasAddress ? (
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {savedAddress.street}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {savedAddress.city}, {savedAddress.state} -{" "}
                    {savedAddress.zipCode}
                  </p>
                  <p className="text-gray-400 text-sm">
                    📞 {savedAddress.phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAddress}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Add Shipping Address</span>
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Order Summary - Separate Card */}
      <motion.div
        className="rounded-xl border border-gray-700 bg-gray-800 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">
          Order Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>₹{formattedSubtotal}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Savings</span>
              <span>-₹{formattedSavings}</span>
            </div>
          )}

          {coupon && isCouponApplied && (
            <div className="flex justify-between text-emerald-400 items-center">
              <div className="flex items-center gap-2">
                <span>Coupon</span>
                <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded">
                  {coupon.code}
                </span>
              </div>
              <span>-{discountPercentage}%</span>
            </div>
          )}

          <div className="border-t border-gray-600 pt-3 flex justify-between">
            <span className="text-white font-bold">Total</span>
            <span className="text-emerald-400 font-bold text-xl">
              ₹{formattedTotal}
            </span>
          </div>
        </div>

        <motion.button
          className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
            hasAddress
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
          whileHover={hasAddress ? { scale: 1.02 } : {}}
          whileTap={hasAddress ? { scale: 0.98 } : {}}
          onClick={handlePayment}
          disabled={!hasAddress || isProcessingPayment}
        >
          {isProcessingPayment ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : hasAddress ? (
            "Proceed to Checkout"
          ) : (
            "Add Address to Continue"
          )}
        </motion.button>

        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-sm text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSummary;
