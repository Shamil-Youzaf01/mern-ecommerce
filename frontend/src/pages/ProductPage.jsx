import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      navigate("/signup");
      return;
    }
    if (!product) {
      toast.error("Product not available");
      return;
    }
    addToCart(product);
  };

  const images = product ? product.images || [product.image] : [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (loading) return <LoadingSpinner />;
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Product not found
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Carousel */}
          <div className="relative rounded-xl overflow-hidden bg-gray-800 shadow-lg">
            <img
              src={images[currentIndex]}
              alt={`${product.name} - ${currentIndex + 1}`}
              className="w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] object-cover"
              loading="lazy"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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

                {/* Image counter */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Category Badge */}
            <span className="inline-block w-fit px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs sm:text-sm rounded-full capitalize">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">
              ₹{product.price.toLocaleString()}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-700" />

            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="mt-auto w-full sm:w-fit flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-8 py-3 rounded-lg font-medium transition-all text-sm sm:text-base"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
