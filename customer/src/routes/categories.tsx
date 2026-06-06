import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/categories")({
  component: Categories,
  head: () => ({ meta: [{ title: "Categories — Royal Mobile Accessories" }] }),
});

type Category = {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  description: string;
  sampleImage?: string;
  image?: string;
};

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);
  
  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading categories...
      </div>
    );
  }

  return (

    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-14">
      
      {/* Header */}
      <div className="text-center mb-8 sm:mb-14">
        <div className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600 font-medium">
          Explore Our Collection
        </div>

        <h1 className="font-display text-2xl sm:text-5xl mt-2">
          All Categories
        </h1>

        <p className="text-muted-foreground mt-2 sm:mt-4 max-w-md mx-auto text-xs sm:text-lg">
          Premium handpicked mobile accessories, gadgets, gifts & more
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
        {categories.map((c) => (
          <Link
            key={c._id}
            to="/shop"
            search={{ category: c.name } as any}
            className="group relative rounded-xl sm:rounded-3xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-lg border border-zinc-100 hover:border-zinc-200 transition-all duration-300"
          >
            <img
              src={
                c.image ||
                "https://placehold.co/600x400?text=Category"
              }
              alt={c.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-2 sm:p-5">
              <div className="font-display text-xs sm:text-2xl text-white tracking-tight">
                {c.name}
              </div>

              {c.description && (
                <div className="text-white/80 text-[10px] sm:text-sm mt-1 line-clamp-2">
                  {c.description}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-amber-400 to-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
        ))}
      </div>
    </section>
  );
}