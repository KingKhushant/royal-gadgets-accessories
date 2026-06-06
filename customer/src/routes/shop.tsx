import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { z } from "zod";

const searchSchema = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/shop")({
  component: Shop,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Shop — Royal Mobile Accessories" }] }),
});

function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [active, setActive] = useState<string | undefined>(category);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products?limit=1000"),
          api.get("/categories"),
        ]);

        // console.log("Products:", productsRes.data);
        // console.log("Categories:", categoriesRes.data);

        setProducts(productsRes.data.products || []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // console.log("URL Category:", category);
  // console.log("Active:", active);
  // console.log("Products:", products);

  useEffect(() => {
    setActive(category);
  }, [category]);

  // console.log("Active:", active);
  // console.log("Products State:", products);

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    if (active) {
      list = list.filter((p) => {
        if (typeof p.category === "object") {
          return (
            p.category?.name === active ||
            p.category?._id === active
          );
        }

        return p.category === active;
      });
    }

    if (q.trim()) {
      const term = q.toLowerCase();

      list = list.filter((p) => {
        const categoryName =
          typeof p.category === "object"
            ? p.category?.name || ""
            : p.category || "";

        return (
          p.name?.toLowerCase().includes(term) ||
          categoryName.toLowerCase().includes(term)
        );
      });
    }

    if (sort === "low") {
      list.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      list.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, active, q, sort]);

  const clearFilters = () => {
    setQ("");
    setActive(undefined);
    navigate({ search: {} });
  };

  if (loading) {
  return (
    <div className="py-20 text-center">
      Loading products...
    </div>
  );
}

  return (
  <section className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-12">

    {/* 1st Row - Search top right */}
    <div className="flex justify-end mb-4">
      <div className="relative w-full sm:w-72 md:w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:border-rose-300 focus:outline-none"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>

    {/* 2nd Row - Heading + Sort */}
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl">
          {active ? active : "All Products"}
        </h1>
        <p className="text-xs sm:text-base text-zinc-500 mt-1">
          {filtered.length} premium products
        </p>
      </div>

      <div className="min-w-[140px] sm:min-w-[180px]">
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-rose-600 mb-1">
          Sort By
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-rose-300"
        >
          <option value="featured">Featured</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>

    {/* 3rd Row - Filters horizontal scroll */}
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-3 mb-6 scrollbar-hide">
      <button
        onClick={() => {
          setActive(undefined);
          navigate({ search: {} });
        }}
        className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all flex-shrink-0 ${
          !active
            ? "bg-rose-50 text-rose-700 font-medium"
            : "bg-zinc-100"
        }`}
      >
        All
      </button>

      {categories.map((c) => (
        <button
          key={c._id}
          onClick={() => setActive(c.name)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all flex-shrink-0 ${
            active === c.name
              ? "bg-rose-50 text-rose-700 font-medium"
              : "bg-zinc-100"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
    

    {/* 4th Row - Products Grid */}
    {/* Products Grid - Matching Trending Section Style */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-zinc-400">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-rose-600 hover:text-rose-700 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
    </section>
  );
}