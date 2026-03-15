// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Trash, Star, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = ({ onEditProduct }) => {
  const {
    products,
    loading,
    currentPage,
    totalPages,
    totalResults,
    fetchAllProducts,
    deleteProduct,
    toggleFeaturedProduct,
  } = useProductStore();

  // Fetch products on mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAllProducts(newPage);
    }
  };

  // Calculate showing range
  const limit = 10;
  const showingFrom = totalResults === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalResults);

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Featured
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {loading && products.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-gray-400">
                Loading products...
              </td>
            </tr>
          ) : products?.length > 0 ? (
            products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-xl object-cover"
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {product.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  ₹{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleFeaturedProduct(product._id)}
                    className={`p-2 rounded-2xl transition-all ${
                      product.isFeatured
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-600 text-gray-300 hover:bg-yellow-500"
                    }`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onEditProduct(product)} // Add this prop
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-2xl hover:bg-blue-500/10 transition-all"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-2xl hover:bg-red-500/10 transition-all"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-12 text-gray-400">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== PAGINATION - With Results Count ===== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-900">
          {/* Results count */}
          <div className="text-gray-400 text-sm order-2 sm:order-1">
            Showing{" "}
            <span className="text-white font-medium">{showingFrom}</span> to{" "}
            <span className="text-white font-medium">{showingTo}</span> of{" "}
            <span className="text-white font-medium">{totalResults}</span>{" "}
            products
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full transition-colors ${
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
              className="p-2 rounded-full bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsList;
