import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cart.map((item) => item.productId) },
    });

    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cart.find(
        (cartItem) => cartItem.productId.toString() === product._id.toString(),
      );
      return { ...product.toJSON(), quantity: item?.quantity || 1 };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cart.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ productId });
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body || {};

    if (!productId) {
      // Clear entire cart using findByIdAndUpdate to avoid version conflicts
      await User.findByIdAndUpdate(req.user._id, { cart: [] });
    } else {
      // Remove specific item using $pull
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { cart: { productId: productId } },
      });
    }

    res.json([]);
  } catch (error) {
    console.error("Error in removeAllFromCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      if (quantity === 0) {
        user.cart = user.cart.filter((item) => item.productId !== productId);
        await user.save();
        return res.json(user.cart);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cart);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
