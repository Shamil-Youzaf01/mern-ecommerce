// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useUserStore } from "../stores/useUserStore";

const UsersTab = () => {
  const {
    users,
    usersLoading,
    currentPage,
    totalPages,
    totalResults,
    fetchAllUsers,
    deleteUser,
  } = useUserStore();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Calculate showing range
  const limit = 10;
  const showingFrom = totalResults === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalResults);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAllUsers(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (usersLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

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
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Joined
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 bg-gray-600 text-xs rounded-full">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => deleteUser(user._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-400">No users found</div>
      )}

      {/* ===== PAGINATION =====*/}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-900">
          <div className="text-gray-400 text-sm order-2 sm:order-1">
            Showing{" "}
            <span className="text-white font-medium">{showingFrom}</span> to{" "}
            <span className="text-white font-medium">{showingTo}</span> of{" "}
            <span className="text-white font-medium">{totalResults}</span> users
          </div>
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
                    className={`w-10 h-10 rounded-full transition-colors ${currentPage === page ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
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

export default UsersTab;
