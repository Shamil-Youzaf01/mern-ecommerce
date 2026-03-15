// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrderStore } from "../stores/useOrderStore";
import toast from "react-hot-toast";

const OrdersTab = () => {
  const {
    orders,
    loading,
    currentPage,
    totalPages,
    totalResults,
    fetchAllOrders,
    deleteOrder,
  } = useOrderStore();

  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Pagination calculations
  const limit = 10;
  const showingFrom = totalResults === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalResults);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAllOrders(newPage);
    }
  };

  // Get customer name
  const getCustomerName = (order) => {
    return order.user?.name || "Unknown Customer";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "paid":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!selectedOrder) return;

    try {
      if (updateOrderStatus) {
        await updateOrderStatus(selectedOrder._id, newStatus);
      }

      setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);

      fetchAllOrders();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading orders...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ================= TABLE ================= */}
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Order ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Total
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-700">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 text-sm text-white">
                {order._id.slice(-8).toUpperCase()}
              </td>

              <td className="px-6 py-4 text-sm text-white">
                {getCustomerName(order)}
              </td>

              <td className="px-6 py-4 text-sm text-white">
                ₹{order.totalAmount}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-400">
                {formatDate(order.createdAt)}
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal(order)}
                    className="text-emerald-400 hover:text-emerald-300 p-2 rounded-xl hover:bg-emerald-500/10"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-400">No orders found</div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-900">
          <div className="text-gray-400 text-sm">
            Showing <span className="text-white">{showingFrom}</span> to{" "}
            <span className="text-white">{showingTo}</span> of{" "}
            <span className="text-white">{totalResults}</span> orders
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-3xl max-w-2xl w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-900 px-8 py-6 flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Order Details
                  </h2>
                  <p className="text-emerald-400 text-sm">
                    #{selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Customer</span>
                    <p className="text-white font-medium">
                      {getCustomerName(selectedOrder)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {selectedOrder.user?.email || "No email"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400">Date</span>
                    <p className="text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="text-gray-400 block mb-2">Status</span>
                  <select
                    value={selectedOrder.status}
                    onChange={handleStatusChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-4">
                    Order Items
                  </h3>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="text-left py-2">Product</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(
                        selectedOrder.items ||
                        selectedOrder.products ||
                        []
                      ).map((item, idx) => {
                        const prod = item.product || item;
                        const name =
                          prod?.name || item?.name || `Item ${idx + 1}`;
                        const qty = item.quantity || 1;
                        const price = item.price || prod.price || 0;
                        const subtotal = qty * price;

                        return (
                          <tr key={idx}>
                            <td className="py-3 text-white">{name}</td>
                            <td className="py-3 text-center text-gray-300">
                              {qty}
                            </td>
                            <td className="py-3 text-right text-gray-300">
                              ₹{price}
                            </td>
                            <td className="py-3 text-right text-white">
                              ₹{subtotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="border-t border-gray-700 pt-4 flex justify-between text-xl font-bold">
                  <span className="text-gray-300">Total Amount</span>
                  <span className="text-emerald-400">
                    ₹{selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-900 px-8 py-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersTab;
