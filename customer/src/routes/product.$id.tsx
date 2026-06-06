import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";


type Product = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  stock: number;
  rating?: number;
  
  category:
    | string
    | {
        _id: string;
        name: string;
      };

  images?: {
    url: string;
    publicId?: string;
  }[];
};

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  // Fetch Single Product from Backend
  const { data: p, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data?.product || res.data?.data || res.data;
    },
    enabled: !!id,
  });
  useEffect(() => {
      setSelectedImage(0);
    }, [p?._id]);
  // Fetch Related Products
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.products || res.data || [];
    },
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-semibold text-red-600">Product Not Found</h2>
        <Link to="/shop" className="text-rose-600 mt-4 inline-block">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const related = allProducts
  .filter((x: any) => {
    const xCategory =
      typeof x.category === "object"
        ? x.category?._id
        : x.category;

    const pCategory =
      typeof p.category === "object"
        ? p.category?._id
        : p.category;

    return (
      String(xCategory) === String(pCategory) &&
      String(x._id) !== String(p._id)
    );
  })
  .slice(0, 4);

  const off = p.originalPrice 
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) 
    : 0;

  const waMsg = `Hi Royal Mobile Accessories! I'm interested in ${p.name} (₹${p.price}). Is it available?`;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-xs sm:text-sm text-zinc-500 hover:text-rose-600 mb-4 sm:mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-5 sm:gap-10">
        {/* Image Section */}
        <div className="flex gap-4 justify-center">
          {/* Left Side Thumbnails */}
          {p.images && p.images.length > 0 && (
            <div className="flex flex-col gap-2">
              {p.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-rose-600"
                      : "border-zinc-200"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${p.name}-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="royal-border bg-white rounded-xl sm:rounded-3xl overflow-hidden aspect-square shadow-sm w-56 sm:w-80">
            <img
              src={
                p.images?.[selectedImage]?.url ||
                p.images?.[0]?.url ||
                "/placeholder.jpg"
              }
              alt={p.name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3 sm:space-y-5">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] uppercase text-rose-600">
              {typeof p.category === "object"
                ? p.category.name
                : p.category}
            </span>

            <span className="bg-rose-600 text-white text-[10px] px-2 rounded-full">
              {off}% OFF
            </span>

            <div className="flex items-center gap-1">
              <Star size={11} fill="currentColor" className="text-amber-500" />
              <span className="text-xs">4.8</span>
            </div>
          </div>

          <h1 className="font-display text-lg leading-tight mt-1">
            {p.name}
          </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-bold">
            ₹{Number(p.price).toLocaleString("en-IN")}
          </span>

          {p.originalPrice && (
            <span className="text-xs line-through text-zinc-400">
              ₹{Number(p.originalPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>
          {/* Description */}
          <div>
            <p
              className={`text-zinc-600 leading-relaxed text-xs sm:text-[15px] whitespace-pre-line ${
                !showFullDescription ? "line-clamp-3" : ""
              }`}
            >
              {p.description}
            </p>

            {p.description && p.description.length > 150 && (
              <button
                onClick={() =>
                  setShowFullDescription(!showFullDescription)
                }
                className="mt-2 text-rose-600 text-xs sm:text-sm font-medium hover:underline"
              >
                {showFullDescription ? "Show Less" : "More..."}
              </button>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {p.stock > 0 ? `${p.stock} in stock` : "Out of Stock"}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-1.5 hover:bg-zinc-100 text-base"
              >
                −
              </button>
              <span className="px-4 font-semibold text-sm sm:text-base">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-1.5 hover:bg-zinc-100 text-base"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={() => {
              add(p, qty);
              toast.success(`${p.name} added to cart`);
            }}
            disabled={p.stock === 0}
            className="w-full border border-zinc-300 hover:border-zinc-400 font-medium text-xs sm:text-base py-2 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2">
            <Link
              to="/cart"
              onClick={() => add(p, qty)}
              className="bg-gradient-to-r from-rose-600 to-rose-700 text-white font-medium text-xs sm:text-base py-2 sm:py-4 rounded-xl sm:rounded-2xl text-center shadow-md transition-all"
            >
              Buy Now
            </Link>

            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white py-2 sm:py-4 rounded-xl sm:rounded-2xl inline-flex items-center justify-center gap-2 text-xs sm:text-base font-medium hover:brightness-110 transition-all"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-10 sm:mt-20">
          <h2 className="font-display text-lg sm:text-3xl mb-4 sm:mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {related.map((r) => (
              <ProductCard key={r._id || r._id} product={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}