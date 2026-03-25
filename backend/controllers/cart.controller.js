import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

// Get all products in the user's cart
export const getCartProducts = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      _id: { $in: cart.items.map((item) => item.product) },
    });

    const cartItems = products.map((product) => {
      const item = cart.items.find(
        (cartItem) => cartItem.product.toString() === product._id.toString(),
      );
      return { ...product.toJSON(), quantity: item?.quantity || 1 };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.json({ success: true });
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Products from cart
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body || {};

    if (!productId) {
      // Clear entire cart + unlock checkout
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [], checkoutLockedUntil: null },
      );
    } else {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { items: { product: productId } } },
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error in removeAllFromCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update the cart product quantity
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      if (quantity === 0) {
        cart.items = cart.items.filter(
          (item) => item.product.toString() !== productId,
        );
      } else {
        existingItem.quantity = quantity;
      }
      await cart.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
