import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  const decreaseQty = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const increaseQty = () => {
    updateQuantity(item._id, item.quantity + 1);
  };

  const total = item.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
        <img
          src={item.images?.[0] || item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-sm md:text-base font-semibold text-white hover:text-emerald-400 cursor-pointer">
            {item.name}
          </h3>

          <button
            onClick={() => removeFromCart(item._id)}
            className="text-red-400 hover:text-red-300 transition"
          >
            <Trash size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-400">₹{item.price} each</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={decreaseQty}
              className="px-3 py-1 hover:bg-gray-600 transition"
            >
              <Minus size={16} />
            </button>

            <span className="px-4 text-sm font-medium">{item.quantity}</span>

            <button
              onClick={increaseQty}
              className="px-3 py-1 hover:bg-gray-600 transition"
            >
              <Plus size={16} />
            </button>
          </div>

          <p className="text-emerald-400 font-bold text-sm md:text-base">
            ₹{total}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
