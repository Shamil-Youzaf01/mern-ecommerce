import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const products = await Product.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const count = await Product.countDocuments({});

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalResults: count,
    });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProduts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// backend/controllers/product.controller.js
export const createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT DEBUG START ===");
  console.log("req.body:", req.body);
  console.log("Number of files received:", req.files ? req.files.length : 0);

  try {
    const imageUrls = [];

    // === IMAGE UPLOAD SECTION ===
    if (req.files && req.files.length > 0) {
      console.log("Starting Cloudinary upload...");
      for (const file of req.files) {
        console.log(
          `→ Uploading: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`,
        );

        const result = await cloudinary.uploader.upload(file.buffer, {
          folder: "products",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        });

        imageUrls.push(result.secure_url);
        console.log(`✅ Uploaded: ${result.secure_url}`);
      }
      console.log("All images uploaded successfully");
    } else {
      console.log("No images uploaded (creating without images)");
    }

    // === SAVE TO MONGO ===
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price) || 0,
      category: req.body.category,
      images: imageUrls, // always array (even empty)
    };

    console.log("Product data being saved:", productData);

    const product = await Product.create(productData);

    console.log("✅ Product created successfully! ID:", product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error("=== CREATE PRODUCT FAILED ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
      hint: "Check Render logs for full details",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (product.images) {
      for (const imageUrl of product.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {
          console.log("Error deleting image from cloudinary", error.message);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          images: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log(
      "Error in the getRecommendedProducts controller",
      error.message,
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  try {
    const products = await Product.find({ category })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const count = await Product.countDocuments({ category });

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalResults: count,
    });
  } catch (error) {
    console.log("Error in getProductsByCategory controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in the toggleFeaturedProduct controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(
      "Error in updatedFeaturedProductsCache function",
      error.message,
    );
  }
}

export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    let baseQuery = {};
    if (q && q.trim()) {
      const keyword = q.trim().slice(0, 50);
      baseQuery.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ];
    }

    const filterQuery = {};
    if (category) filterQuery.category = category;
    if (minPrice)
      filterQuery.price = { ...filterQuery.price, $gte: Number(minPrice) };
    if (maxPrice)
      filterQuery.price = { ...filterQuery.price, $lte: Number(maxPrice) };

    const finalQuery = { $and: [baseQuery, filterQuery] };

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };
    const sortOptions = sortMap[sort] || sortMap.newest;

    const products = await Product.find(finalQuery)
      .sort(sortOptions)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const count = await Product.countDocuments(finalQuery);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalResults: count,
      filters: { category, minPrice, maxPrice },
      sort,
    });
  } catch (error) {
    console.log("Error in searchProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.buffer, {
          folder: "products",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        });
        newImageUrls.push(result.secure_url);
      }
      updateData.images = [...(product.images || []), ...newImageUrls];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: error.message });
  }
};
