import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Truck, Shield, Gift, Star, Trophy } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";


export const Route = createFileRoute("/")({ component: Home });

type Banner = {
  _id: string;
  title?: string;
  image?: {
    url?: string;
  } | string;
};

function HeroSlider() {

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["flash-sale-products"],
    queryFn: async () => {
      const res = await api.get("/products");

      const allProducts = res.data?.products || res.data || [];

      return allProducts
        .filter((p: any) => p.isFlashSale === true)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    },
  });

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await api.get("/banners");
      return res.data || [];
    },

    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const [currentImage, setCurrentImage] = useState(0);

  // Auto slider
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Preload images
  useEffect(() => {
    banners.forEach((banner) => {
      const img = new Image();

      img.src =
        typeof banner.image === "string"
          ? banner.image
          : banner.image?.url || "";
    });
  }, [banners]);

  if (isLoading) {
    return (
      <div className="w-full h-[350px] bg-zinc-100 rounded-3xl animate-pulse" />
    );
  }

  if (!banners.length) {
    return null;
  }

  const imageSrc =
    typeof banners[currentImage]?.image === "string"
      ? banners[currentImage]?.image
      : banners[currentImage]?.image?.url;

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={currentImage}
        src={imageSrc}
        alt={banners[currentImage]?.title || "Banner"}
        className="w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </AnimatePresence>
  );
}

function Countdown() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    const id = setInterval(() => {
      const diff = +end - +new Date();
      const h = Math.max(0, Math.floor(diff / 3.6e6));
      const m = Math.max(0, Math.floor((diff / 6e4) % 60));
      const s = Math.max(0, Math.floor((diff / 1000) % 60));
      setT({ h, m, s });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const box = (v: number, l: string) => (
    <div className="text-center">
      <div className="bg-white border border-amber-300 rounded-2xl px-4 py-3 font-display text-2xl text-zinc-900 tabular-nums shadow-sm">
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1.5">{l}</div>
    </div>
  );

  return <div className="flex gap-3 justify-center">{box(t.h, "Hours")}{box(t.m, "Min")}{box(t.s, "Sec")}</div>;
}

const TOYS = Object.values(
  import.meta.glob("@/assets/HomeToys/*.{png,jpg,jpeg}", {
    eager: true,
    query: "?url",
    import: "default",
  })
) as string[];

// floting photo component
function FloatingToy() {
  const [showMessage, setShowMessage] = useState(true);
  const [currentToy, setCurrentToy] = useState(0);

  // Auto import all images from HomeToys folder
  // const toys = Object.values(
  //   import.meta.glob("@/assets/HomeToys/*.{png,jpg,jpeg}", {
  //     eager: true,
  //     query: "?url",
  //     import: "default",
  //   })
  // ) as string[];
  const toys = TOYS;

  // Hide hello message after 4 sec
  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Change toy every 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToy((prev) => (prev + 1) % toys.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [toys.length]);

  useEffect(() => {
    toys.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute right-6 top-[145px] z-50 flex items-center gap-3"
    >
      {/* Hello bubble */}
      {showMessage && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white px-4 py-2 rounded-2xl shadow-lg border text-sm font-medium text-zinc-800"
        >
          Hello 👋
        </motion.div>
      )}

      {/* Toy image */}
      <motion.img
        // key={currentToy}
        src={toys[currentToy]}
        alt="Toy"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-24 h-24 object-cover rounded-2xl shadow-xl rotate-[-12deg] hover:rotate-0 transition-transform duration-300 cursor-pointer"
      />
    </motion.div>
  );
}

function Home() {
  
    // Fetch real categories from backend
  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data?.categories || res.data || [];
    },
  });

  
  const reviews = [
    { name: "Rahul Sharma", rating: 5, text: "Best earbuds I ever bought! Sound quality is amazing." },
    { name: "Priya Patel", rating: 4, text: "Fast delivery and genuine product. Highly recommended." },
    { name: "Amit Verma", rating: 5, text: "Smartwatch is fantastic. Battery lasts very long." },
    { name: "Sneha Gupta", rating: 4, text: "Loved the gift hamper. Perfect for gifting." },
  ];
  

  // const trending = products.slice(0, 8);

    // Fetch Trending Products (Limited + Sorted)
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["flash-sale-products"],
    queryFn: async () => {
      const res = await api.get("/products");

      const allProducts =
        res.data?.products || res.data || [];

      return allProducts
        .filter((p: any) => p.isFlashSale === true)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    },
  });

  

  const trending = products;   // No need to slice now
  

  return (
    <>
    <FloatingToy />
    {/* HERO */}
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-rose-50 to-amber-50">

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-rose-100/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          {/* Live Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-rose-700 border border-rose-200 rounded-full px-4 py-2 text-xs font-semibold shadow-md mb-5"
          >
            <Trophy size={14} />
            Nagpur's Most Trusted Store
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight"
          >
            Premium <br />
            Accessories, <br />
            <motion.span
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-400 to-rose-500 bg-[length:200%_200%]"
            >
              Gadgets
            </motion.span>{" "}
            & <span className="italic text-rose-700">Gifts</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm sm:text-base text-zinc-600 max-w-md leading-relaxed"
          >
            Handpicked collection of earbuds, smartwatches, chargers, power banks,
            and luxurious gift hampers crafted for modern lifestyle.
          </motion.p>

          {/* Buttons */}
          <div className="mt-6 flex flex-nowrap gap-3 overflow-x-auto">

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/shop"
                className="relative whitespace-nowrap bg-gradient-to-r from-rose-600 to-rose-700 text-white px-5 py-3 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-rose-500/30 overflow-hidden shrink-0"
              >
                <motion.span
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 skew-x-12"
                />
                Shop Now <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Feature Pills */}
          <div className="mt-6 flex flex-wrap gap-3 text-xs">

            <motion.span
              whileHover={{ y: -3 }}
              className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm text-zinc-700"
            >
              <BadgeCheck className="text-emerald-600" size={14} />
              100% Genuine
            </motion.span>

            <motion.span
              whileHover={{ y: -3 }}
              className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm text-zinc-700"
            >
              <Truck className="text-rose-600" size={14} />
              Same Day Delivery
            </motion.span>

            <motion.span
              whileHover={{ y: -3 }}
              className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm text-zinc-700"
            >
              <Shield className="text-amber-600" size={14} />
              Warranty Assured
            </motion.span>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 flex gap-4 flex-wrap">
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-md">
              <div className="text-xl font-bold text-rose-600">10K+</div>
              <div className="text-xs text-zinc-500">Happy Customers</div>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-md">
              <div className="text-xl font-bold text-amber-600">500+</div>
              <div className="text-xs text-zinc-500">Premium Products</div>
            </div>

            <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-md">
              <div className="text-xl font-bold text-emerald-600">4.9★</div>
              <div className="text-xs text-zinc-500">Customer Rating</div>
            </div>
          </div>

        </motion.div>

        {/* RIGHT SIDE - Hero Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative h-auto max-h-[350px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/50 shadow-2xl backdrop-blur-lg flex items-center justify-center"
          >
            <HeroSlider />
          </motion.div>
        </motion.div>

      </div>
    </section>
    

      {/* FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-rose-600">Discover</div>
            <h2 className="font-display text-4xl mt-1">Featured Categories</h2>
          </div>
          <Link to="/categories" className="text-rose-600 inline-flex items-center gap-2 hover:gap-3 transition-all">
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoriesData.slice(0, 6).map((cat: any, i: number) => {
            const Icon = [Star, Trophy, Shield, Gift, Truck, Gift][i % 6]; // fallback icons

            return (
              <motion.div
                key={cat._id || cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/shop"
                  search={{ category: cat.name || cat.slug }}
                  className="royal-border bg-white rounded-2xl p-3 sm:p-4 min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center text-center hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 flex items-center justify-center mb-3 group-hover:bg-rose-100 transition">
                    <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-rose-500 group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="font-medium text-xs sm:text-sm lg:text-base leading-tight line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {cat.name}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      
      {/* TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 py-8 sm:py-16">
        <div className="flex items-end justify-between mb-4 sm:mb-8">
          <div>
            <div className="text-[9px] sm:text-xs uppercase tracking-widest text-rose-600">
              Hot Right Now
            </div>
            <h2 className="font-display text-lg sm:text-3xl md:text-4xl mt-1">
              Trending Products
            </h2>
          </div>

          <Link to="/shop" className="text-[10px] sm:text-sm text-rose-600 inline-flex items-center gap-1">
            View All <ArrowRight size={12} className="sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {productsLoading ? (
            <div className="col-span-full py-12 text-center">
              Loading trending products...
            </div>
          ) : trending.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No trending products available
            </div>
          ) : (
            trending.map((p: any) => (
              <ProductCard
                key={p._id}
                product={p}
              />
            ))
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 py-8 sm:py-16 bg-zinc-50">

      {/* Heading */}
      <div className="text-center mb-6 sm:mb-12">
        <div className="text-[9px] sm:text-xs uppercase tracking-widest text-rose-600">
          The Royal Promise
        </div>
        <h2 className="font-display text-xl sm:text-3xl md:text-4xl mt-1 sm:mt-2">
          Why Choose Us
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
        {[
          {
            icon: BadgeCheck,
            title: "100% Genuine",
            desc: "Original warranty"
          },
          {
            icon: Truck,
            title: "Fast Delivery",
            desc: "Same-day shipping"
          },
          {
            icon: Shield,
            title: "Trusted Service",
            desc: "10+ years excellence"
          },
          {
            icon: Gift,
            title: "Custom Orders",
            desc: "Special sourcing"
          },
        ].map(({ icon: Icon, title, desc }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="royal-border bg-white rounded-xl sm:rounded-3xl p-3 sm:p-8 text-center sm:text-left"
          >
            {/* Icon */}
            <div className="w-8 h-8 sm:w-14 sm:h-14 mx-auto sm:mx-0 rounded-lg sm:rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white">
              <Icon size={14} className="sm:w-7 sm:h-7" />
            </div>

            {/* Title */}
            <div className="font-display text-[11px] sm:text-2xl mt-2 sm:mt-6 leading-tight">
              {title}
            </div>

            {/* Description */}
            <p className="text-[9px] sm:text-base text-zinc-600 mt-1 sm:mt-2 line-clamp-2">
              {desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 overflow-hidden">
  <div className="text-center mb-6">
    <div className="text-xs uppercase tracking-widest text-rose-600">
      Loved by Nagpur
    </div>
    <h2 className="font-display text-2xl sm:text-3xl mt-1">
      Customer Reviews
    </h2>
  </div>

  {/* Row 1 */}
  <div className="overflow-hidden mb-2">
    <motion.div
      className="flex gap-3 w-max"
      animate={{ x: ["0%", "-50%"] }}
      transition={{
        repeat: Infinity,
        duration: 22,
        ease: "linear",
      }}
    >
      {[...reviews, ...reviews].map((r, i) => (
        <div
          key={`top-${i}`}
          className="w-[220px] shrink-0 royal-border bg-white rounded-xl p-3"
        >
          {/* Stars */}
          <div className="flex text-amber-500 mb-2">
            {Array.from({ length: r.rating }).map((_, k) => (
              <Star key={k} size={12} fill="currentColor" />
            ))}
          </div>

          {/* Review */}
          <p className="text-zinc-700 text-xs leading-snug line-clamp-3">
            "{r.text}"
          </p>

          {/* Name */}
          <div className="mt-2 text-xs font-medium text-rose-600">
            — {r.name}
          </div>
        </div>
      ))}
    </motion.div>
  </div>

  {/* Row 2 */}
  <div className="overflow-hidden">
    <motion.div
      className="flex gap-3 w-max"
      animate={{ x: ["-50%", "0%"] }}
      transition={{
        repeat: Infinity,
        duration: 22,
        ease: "linear",
      }}
    >
      {[...reviews, ...reviews].map((r, i) => (
        <div
          key={`bottom-${i}`}
          className="w-[220px] shrink-0 royal-border bg-white rounded-xl p-3"
        >
          <div className="flex text-amber-500 mb-2">
            {Array.from({ length: r.rating }).map((_, k) => (
              <Star key={k} size={12} fill="currentColor" />
            ))}
          </div>

          <p className="text-zinc-700 text-xs leading-snug line-clamp-3">
            "{r.text}"
          </p>

          <div className="mt-2 text-xs font-medium text-rose-600">
            — {r.name}
          </div>
        </div>
      ))}
    </motion.div>
  </div>
</section>
    </>
  );
}