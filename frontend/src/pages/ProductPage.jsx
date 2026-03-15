import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import {
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }
    if (!product) {
      toast.error("Product not available");
      return;
    }
    addToCart(product);
    toast.success("Added to cart!");
  };

  const nextImage = () => {
    const images = product.images || [product.image];
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = product.images || [product.image];
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div>Product not found</div>;

  // Support both new 'images' array and legacy 'image' field
  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="flex items-center text-emerald-400 mb-6 hover:underline"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Home
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Carousel */}
        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          <img
            src={images[currentIndex]}
            alt={`${product.name} - ${currentIndex + 1}`}
            className="w-full h-[400px] md:h-[500px] object-cover"
            loading="lazy"
          />

          {/* Navigation arrows - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex
                        ? "bg-emerald-500"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <span className="inline-block px-3 py-1 bg-emerald-900/20 text-emerald-400 text-sm rounded-full">
            {product.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {product.name}
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-emerald-400">
            ₹{product.price}
          </p>
          <div className="text-gray-300 leading-relaxed">
            {product.description}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
