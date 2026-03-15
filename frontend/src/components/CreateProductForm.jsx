import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, X } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import toast from "react-hot-toast";

const categories = [
  "jeans",
  "t-shirts",
  "shoes",
  "glasses",
  "jackets",
  "suits",
  "bags",
];

const CreateProductForm = ({ editProduct = null, onSuccess = null }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name || "");
      setDescription(editProduct.description || "");
      setPrice(editProduct.price?.toString() || "");
      setCategory(editProduct.category || "");
      setExistingImages(editProduct.images || []);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setExistingImages([]);
      setImages([]);
    }
  }, [editProduct]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img instanceof Blob) {
          URL.revokeObjectURL(URL.createObjectURL(img));
        }
      });
    };
  }, [images]);

  const { createProduct, updateProduct, loading } = useProductStore();

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) toast.error("Some files exceed 5MB limit.");

    const currentTotal = images.reduce((sum, f) => sum + f.size, 0);
    const newTotal = files.reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + newTotal > MAX_FILE_SIZE * 5) {
      toast.error("Total image size exceeds 25MB.");
      return;
    }

    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (name && name !== "undefined") formData.append("name", name);
    if (description && description !== "undefined")
      formData.append("description", description);
    if (price && price !== "undefined") formData.append("price", price);
    if (category && category !== "undefined")
      formData.append("category", category);

    if (images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      if (editProduct) {
        await updateProduct(editProduct._id, formData);
        toast.success("Product updated successfully!");
        if (onSuccess) onSuccess();
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }

      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImages([]);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        editProduct ? "Error updating product" : "Error creating product",
      );
    }
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        {editProduct ? "Edit Product" : "Create New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Image upload section */}
        <div className="mt-1">
          <input
            type="file"
            id="images"
            className="sr-only"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <label
            htmlFor="images"
            className="cursor-pointer inline-flex items-center bg-gray-700 py-2 px-3 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-600"
          >
            <Upload className="h-5 w-5 mr-2" /> Upload Images
          </label>
          <span className="ml-2 text-xs text-gray-400">
            (Max 5MB per image)
          </span>

          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx}`}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              {editProduct ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              {editProduct ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
