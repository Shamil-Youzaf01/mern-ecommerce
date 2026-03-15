import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {/* 404 */}
      <h1 className="text-7xl md:text-8xl font-bold text-emerald-500">404</h1>

      {/* Title */}
      <h2 className="mt-4 text-2xl font-semibold text-white">Page not found</h2>

      {/* Description */}
      <p className="mt-2 text-gray-400 max-w-md">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <Link
          to="/"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg transition"
        >
          <Home size={18} />
          Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 border border-gray-600 hover:bg-gray-800 text-gray-300 px-5 py-2.5 rounded-lg transition"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
