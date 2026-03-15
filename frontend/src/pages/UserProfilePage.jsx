import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, LogOut, ArrowLeft } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";

const UserProfilePage = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders");
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="flex items-center text-emerald-400 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Home
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* User Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>

            {/* Menu */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "profile"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <User size={18} className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "orders"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Package size={18} className="inline mr-2" />
                My Orders
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-700 transition-colors"
              >
                <LogOut size={18} className="inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-6">
                Profile Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">
                    Account Status
                  </label>
                  <p className="text-emerald-400 text-lg">Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Order History
              </h3>

              {loading ? (
                <LoadingSpinner />
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400 text-lg">No orders found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition shadow-lg hover:shadow-xl"
                    >
                      {/* Header - Order ID + Status */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide">
                            Order ID
                          </p>
                          <p className="text-white font-mono text-sm truncate max-w-[200px]">
                            {order._id}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            order.status === "paid"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : order.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Products List */}
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-400 text-sm mb-3">Products</p>
                        <div className="space-y-3">
                          {order.products.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition"
                            >
                              {/* Product Image */}
                              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-600">
                                <img
                                  src={
                                    item.product?.images?.[0] ||
                                    item.product?.image
                                  }
                                  alt={item.product?.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product Name & Price */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {item.product?.name || "Product"}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  ₹{item.price} × {item.quantity}
                                </p>
                              </div>

                              {/* Item Total */}
                              <p className="text-emerald-400 font-semibold">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer - Total + Date */}
                      <div className="border-t border-gray-700 mt-4 pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div>
                          <p className="text-gray-400 text-xs">Ordered on</p>
                          <p className="text-gray-300 text-sm">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">Total Amount</p>
                          <p className="text-emerald-400 font-bold text-2xl">
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
