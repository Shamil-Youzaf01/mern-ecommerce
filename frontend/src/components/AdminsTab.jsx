// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UserPlus, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const AdminsTab = () => {
  const {
    users,
    usersLoading,
    fetchAllUsers,
    deleteUser,
    createAdmin,
    loading,
  } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const admins = users.filter(
    (user) => user.role === "admin" || user.role === "superadmin",
  );

  const handleDelete = (userId) => {
    if (admins.length === 1) {
      toast.error("Cannot delete the last admin!");
      return;
    }
    deleteUser(userId);
    toast.success("Admin removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAdmin(formData);
    setShowModal(false);
    setFormData({ name: "", email: "", password: "", role: "admin" });
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
        <div className="text-white">Loading admins...</div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h3 className="text-xl font-semibold text-emerald-300">
            Admin Accounts
          </h3>
          <button
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-2xl text-sm font-medium transition-colors"
            onClick={() => setShowModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add New Admin
          </button>
        </div>

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
            {admins.map((admin) => (
              <tr
                key={admin._id}
                className="hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  {admin.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-emerald-600 text-xs rounded-full">
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {formatDate(admin.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(admin._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <div className="text-center py-8 text-gray-400">No admins found</div>
        )}
      </motion.div>

      {/*  ADMIN MODAL  */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gray-900 px-8 py-6 flex items-center justify-between border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Add New Admin</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-2xl px-5 py-3 text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-2xl px-5 py-3 text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-2xl px-5 py-3 text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-2xl px-5 py-3 text-white mt-1"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-2xl text-white font-medium disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Admin"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminsTab;
