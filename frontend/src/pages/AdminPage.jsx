import React, { useEffect, useState } from "react";
import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  ShoppingCart,
  Users,
  UserCog,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import AnalyticsTab from "../components/AnalyticsTab";
import OrdersTab from "../components/OrdersTab";
import UsersTab from "../components/UsersTab";
import AdminsTab from "../components/AdminsTab";

import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

// Define sidebar items with role-based access
const sidebarItems = [
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
    roles: ["admin", "superadmin"],
  },
  {
    id: "create",
    label: "Create Product",
    icon: PlusCircle,
    roles: ["admin", "superadmin"],
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingBasket,
    roles: ["admin", "superadmin"],
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    roles: ["admin", "superadmin"],
  },
  { id: "users", label: "Users", icon: Users, roles: ["superadmin"] },
  { id: "admins", label: "Admins", icon: UserCog, roles: ["superadmin"] },
];

// Define which roles can access each tab
const tabAccess = {
  admins: ["superadmin"],
  users: ["superadmin"],
  products: ["admin", "superadmin"],
  create: ["admin", "superadmin"],
  orders: ["admin", "superadmin"],
  analytics: ["admin", "superadmin"],
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const { fetchAllProducts } = useProductStore();
  const { user, checkingAuth, logout } = useUserStore();
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Filter sidebar items based on user role
  // Show all items for now (role-based filtering can be added later)
  const allowedSidebarItems =
    checkingAuth || !user
      ? sidebarItems
      : sidebarItems.filter((item) => {
          if (!item.roles) return true;
          return user?.role && item.roles.includes(user.role);
        });

  // Find the current item from allowed sidebar items
  const currentItem = allowedSidebarItems.find((item) => item.id === activeTab);

  // Handle tab change with role-based access check
  const handleTabChange = (tabId) => {
    const allowedRoles = tabAccess[tabId] || ["admin", "superadmin"];
    const userRole = user?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      setActiveTab(tabId);
    } else {
      // Redirect to first allowed tab
      const firstAllowed = allowedSidebarItems[0];
      if (firstAllowed) {
        setActiveTab(firstAllowed.id);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* ==================== SIDEBAR ==================== */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {allowedSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (optional logout) */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl"
          >
            {/* Add logout icon if you want */}
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.h1
            className="text-4xl font-bold text-emerald-400 mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentItem?.label || "Admin"}
          </motion.h1>

          {/* Render active tab */}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "create" && (
            <CreateProductForm
              key={editingProduct?._id || "create"}
              editProduct={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                setActiveTab("products");
              }}
            />
          )}
          {activeTab === "products" && (
            <ProductsList
              onEditProduct={(product) => {
                setEditingProduct(product);
                setActiveTab("create");
              }}
            />
          )}

          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "admins" && <AdminsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
