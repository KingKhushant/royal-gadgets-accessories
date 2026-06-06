import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { useRequireAuth } from "@/components/admin/useRequireAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, X, Loader2, ImageOff, Filter } from "lucide-react";


export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsPage,
});

interface Category {
  _id?: string;
  id?: string;
  name: string;
}

interface ProductImage {
  url: string;
  publicId: string;
  _id?: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category?: any;
  flashSale?: boolean;
  isFlashSale?: boolean;
  images?: Array<ProductImage | string>;
  description?: string;
}

const empty: Product = { name: "", price: 0, originalPrice: 0, discount: 0, stock: 0, flashSale: false, images: [], description: "" };

const getImageUrl = (img?: ProductImage | string | null) => {
  if (!img) return "";
  return typeof img === "string" ? img : img.url || "";
};

function ProductsPage() {
  const { ready } = useRequireAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [flashFilter, setFlashFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
 

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    try {
      const [p, c] = await Promise.all([
        api.get(`/products?page=${page}&limit=10`),
        api.get("/categories")
      ]);

      setItems(p.data.products || []);
      setTotalPages(p.data.pages || 1);
      setTotalProducts(p.data.total || 0);

      setCats(
        Array.isArray(c.data)
          ? c.data
          : c.data?.categories || c.data?.data || []
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };
    

  useEffect(() => {
    if (ready) load();
  }, [ready, page]);

  

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter) {
        const cid = typeof p.category === "object" ? p.category?._id || p.category?.id : p.category;
        if (cid !== catFilter) return false;
      }
      if (flashFilter === "yes" && !(p.flashSale || p.isFlashSale))
        return false;

      if (flashFilter === "no" && (p.flashSale || p.isFlashSale))
        return false;
      if (stockFilter === "out" && (p.stock ?? 0) > 0) return false;
      if (stockFilter === "low" && ((p.stock ?? 0) === 0 || (p.stock ?? 0) >= 5)) return false;
      if (stockFilter === "in" && (p.stock ?? 0) < 5) return false;
      return true;
    });
  }, [items, search, catFilter, flashFilter, stockFilter]);

  const [totalProducts, setTotalProducts] = useState(0);
  const pageItems = filtered;

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!ready) return null;
  

  return (
    <AdminLayout>
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 mb-4 shadow-sm">

    {/* Top Toolbar */}
    <div className="flex items-center justify-between">

      <div className="min-w-0">
        <h1 className="text-xl font-bold text-[#1F2937]">
          Products
        </h1>
        <p className="text-xs text-[#6B7280]">
          {totalProducts} items
        </p>
      </div>

      <div className="flex items-center gap-2">

        {/* Search */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="
            w-10 h-10
            rounded-xl
            border border-[#E5E0D8]
            bg-white
            hover:bg-[#F8F5F0]
            transition-all
            shadow-sm
            flex items-center justify-center"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Add Product */}
        <button
          onClick={() => {
            setEditing(empty);
            setModalOpen(true);
          }}
          className="
          w-10 h-10
          rounded-xl
          bg-[#D4AF37]
          text-white
          hover:scale-105
          transition-all
          shadow-md
          flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>

      </div>
    </div>

    {/* Search Box */}
    {showSearch && (
      <div className="mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="
            w-full
            pl-10
            pr-3
            py-2.5
            text-sm
            bg-white
            border border-[#E5E0D8]
            rounded-xl
            focus:ring-2
            focus:ring-[#D4AF37]
            outline-none
            "
          />
        </div>
      </div>
    )}

    {/* Filters */}
    {showFilters && (
      <div className="mt-3 grid grid-cols-3 gap-2">

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="
px-3 py-2
bg-white
border border-[#E5E0D8]
rounded-xl
text-sm
"
        >
          <option value="">Category</option>
          {cats.map((c) => (
            <option
              key={c._id || c.id}
              value={c._id || c.id}
            >
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={flashFilter}
          onChange={(e) => setFlashFilter(e.target.value)}
          className="
            px-3 py-2
            bg-white
            border border-[#E5E0D8]
            rounded-xl
            text-sm
            "
        >
          <option value="">Flash</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="
          px-3 py-2
          bg-white
          border border-[#E5E0D8]
          rounded-xl
          text-sm
          "
        >
          <option value="">Stock</option>
          <option value="in">In</option>
          <option value="low">Low</option>
          <option value="out">Out</option>
        </select>

      </div>
    )}
  </div>

      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          
          {/* Desktop Table */}
          <div className="
            hidden md:block
            bg-white
            border border-[#E5E0D8]
            rounded-2xl
            overflow-hidden
            shadow-sm
            ">
            <div className="overflow-x-auto">
              {/* <table className="w-full text-sm"> */}
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="bg-[#F8F5F0] text-left text-muted-foreground">
                    <tr>
                      <th className="p-3">Image</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Original</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Flash</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={8} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                    )}
                    {!loading && pageItems.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No products found</td></tr>
                    )}
                    {pageItems.map((p) => {
                      const id = (p._id || p.id)!;
                      const img = getImageUrl(p.images?.[0] ?? null);
                          
                      return (
                        <tr
                          key={id}
                          className="
                          border-t
                          border-[#E5E0D8]
                          hover:bg-[#FAF8F4]
                          transition-colors
                          "
                          >
                          <td className="p-3">
                            {img ? (
                              <img src={img} alt={p.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><ImageOff className="w-4 h-4 text-muted-foreground" /></div>
                            )}
                          </td>
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3">₹{p.price}</td>
                          <td className="p-3 text-muted-foreground line-through">{p.originalPrice ? `₹${p.originalPrice}` : "—"}</td>
                          <td className="p-3">{p.discount ? `${p.discount}%` : "—"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${(p.stock ?? 0) === 0
                            ? "bg-red-100 text-red-600"
                            : (p.stock ?? 0) < 5
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"}`}>
                              {p.stock ?? 0}
                            </span>
                          </td>
                          <td className="p-3">{(p.flashSale || p.isFlashSale) ? "⚡" : "—"}</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditing(p); setModalOpen(true); }} className="
                              p-2
                              rounded-xl
                              bg-[#D4AF37]/10
                              text-[#D4AF37]
                              hover:bg-[#D4AF37]/20
"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setConfirmId(id)} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              {/* </table> */}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            {!loading &&
              pageItems.map((p) => {
                const id = (p._id || p.id)!;
                const img = getImageUrl(p.images?.[0] ?? null);

                return (
                  <div
                    key={id}
                    className="
                    bg-white
                    border border-[#E5E0D8]
                    rounded-2xl
                    p-3
                    shadow-sm
                    "
                  >
                    <div className="flex items-center gap-2">
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                          <ImageOff className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-medium truncate">
                            {p.name}
                          </h3>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                console.log("EDITING =>", p);
                                setEditing(p);
                                setModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setConfirmId(id)}
                              className="
                              p-2
                              rounded-xl
                              bg-red-500/10
                              text-red-600
                              hover:bg-red-500/20
                              "
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-semibold text-primary">
                            ₹{p.price}
                          </span>

                          {p.originalPrice && (
                            <span className="line-through text-muted-foreground">
                              ₹{p.originalPrice}
                            </span>
                          )}

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              (p.stock ?? 0) === 0
                                ? "bg-red-100 text-red-600"
                                : (p.stock ?? 0) < 5
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {p.stock}
                          </span>

                          {(p.flashSale || p.isFlashSale) && (
                            <span className="text-[10px] text-orange-600">
                              ⚡
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="
                          px-4 py-2
                          rounded-xl
                          border border-[#E5E0D8]
                          bg-white
                          hover:bg-[#F8F5F0]
                          transition-all
                          disabled:opacity-50
                          disabled:opacity-50">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="
                                  px-4 py-2
                                  rounded-xl
                                  border border-[#E5E0D8]
                                  bg-white
                                  hover:bg-[#F8F5F0]
                                  transition-all
                                  disabled:opacity-50
                                  disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
        categories={cats}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
        onSavedCategories={load}
      />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Delete product?"
        description="This will permanently remove the product."
      />
    </AdminLayout>
  );
}

function ProductModal({
  open,
  onClose,
  product,
  categories,
  onSaved,
  onSavedCategories
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: any[];
  onSaved: () => void;
  onSavedCategories: () => Promise<void>;
}) {
  
  const [form, setForm] = useState<Product>(empty);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const isEdit = !!(product && (product._id || product.id));
  const createCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Enter category name");
      return;
    }

    try {
      const name = newCategory.trim();

      const res = await api.post("/categories", {
        name,
        slug: name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-"),
      });

      const created =
        res.data?.category ||
        res.data?.data ||
        res.data;

      toast.success("Category created");

      // parent ko reload karwao
      await onSavedCategories?.();

      setForm((prev) => ({
        ...prev,
        category: created._id || created.id,
      }));

      setNewCategory("");
      setCategoryModalOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        "Failed to create category"
      );
    }
  };

  // Single Clean useEffect for Reset
  useEffect(() => {
    if (!open) {
      // Cleanup when modal closes
      setForm(empty);
      setSelectedFiles([]);
      setImageUrls([""]);
      return;
    }

    if (isEdit && product) {
      // Edit Mode
      setForm({
        ...empty,
        ...product,
        images: product.images || [],
      });
    } else {
      // Add New Product Mode
      setForm(empty);
    }

    setSelectedFiles([]);
    setImageUrls([""]);
  }, [open, product, isEdit]);

  const pasteImageUrl = async (index: number) => {
    try {
      const text = await navigator.clipboard.readText();

      if (!text.startsWith("http")) {
        toast.error("Clipboard me valid URL nahi hai");
        return;
      }

      const updated = [...imageUrls];
      updated[index] = text;

      // Last input hai to naya empty input add karo
      if (index === imageUrls.length - 1) {
        updated.push("");
      }

      setImageUrls(updated);
      toast.success("Image URL pasted");
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      console.log("PRICE BEFORE SAVE =", form.price);
      formData.append("price", String(form.price));
      formData.append("stock", String(form.stock));
      formData.append("originalPrice", String(form.originalPrice || 0));
      formData.append("discount", String(form.discount || 0));
      formData.append("flashSale", String(!!form.flashSale));

      if (form.description) formData.append("description", form.description);
      if (form.category) {
        formData.append(
          "category",
          typeof form.category === "object"
            ? form.category._id
            : form.category
        );
      }
      console.log("CATEGORY =>", form.category);
      // Combine: Existing Images + New URLs
      const combinedImages = [
        ...(form.images || []),
        ...imageUrls
          .filter(u => u.trim() !== "")
          .map(url => ({ url: url.trim(), publicId: "" }))
      ];

      formData.append("existingImages", JSON.stringify(combinedImages));

      // Local Files
      selectedFiles.forEach(file => formData.append("images", file));

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) {
        await api.put(`/products/${product!._id || product!.id}`, formData, config);
      } else {
        await api.post("/products", formData, config);
      }

      toast.success(isEdit ? "Product updated" : "Product created");
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
     
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"} size="lg">
      <form onSubmit={submit} className="space-y-3">

      {/* Name + Category */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *">
            <input
              className={inp}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();

                  setForm((prev) => ({
                    ...prev,
                    name: text,
                  }));
                } catch (err) {
                  console.log("Clipboard access denied");
                }
              }}
              required
            />
          </Field>

          <Field label="Category">
            <select
              className={inp}
              value={
                (typeof form.category === "object"
                  ? form.category?._id
                  : form.category) || ""
              }
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setCategoryModalOpen(true);
                  return;
                }

                setForm({
                  ...form,
                  category: e.target.value,
                });
              }}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">
                + Add New Category
              </option>
            </select>
          </Field>
        </div>

        {/* Price + Original Price */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price *">
            <input
              type="number"
              step="0.01"
              className={inp}
              value={form.price}
              onChange={(e) => {
                console.log("INPUT =", e.target.value);

                setForm(prev => ({
                  ...prev,
                  price: Number(e.target.value)
                }));
              }}
              required
            />
          </Field>

          <Field label="Original Price">
            <input
              type="number"
              step="0.01"
              className={inp}
              value={form.originalPrice || 0}
              onChange={(e) =>
                setForm({ ...form, originalPrice: +e.target.value })
              }
            />
          </Field>
        </div>

        {/* Discount + Stock */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount %">
            <input
              type="number"
              className={inp}
              value={form.discount || 0}
              onChange={(e) =>
                setForm({ ...form, discount: +e.target.value })
              }
            />
          </Field>

          <Field label="Stock">
            <input
              type="number"
              className={inp}
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: +e.target.value })
              }
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <textarea
            className={`${inp} min-h-[70px]`}
            value={form.description || ""}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();

                setForm((prev) => ({
                  ...prev,
                  description: text,
                }));
              } catch (err) {
                console.log("Clipboard access denied");
              }
            }}
          />
        </Field>

        

        <Field label="Images">
          <div className="space-y-4">

            {/* Preview Section - All Previews Together */}
            <div className="grid grid-cols-3 gap-3 min-h-[120px]">

              {/* 1. Saved Images (Edit mode) */}
              {(form.images || []).map((img, index) => (
                <div key={`saved-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img 
                    src={getImageUrl(img)} 
                    alt="Saved" 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        images: (prev.images || []).filter((_, i) => i !== index)
                      }));
                    }}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-center text-white py-0.5">
                    Saved
                  </div>
                </div>
              ))}

              {/* 2. Local Files Preview */}
              {selectedFiles.map((file, index) => (
                <div key={`local-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(file)} alt="Local" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-center text-white py-0.5">
                    Local
                  </div>
                </div>
              ))}

              {/* 3. NEW: URL Previews */}
              {imageUrls.map((url, index) => {
                const trimmedUrl = url.trim();
                if (!trimmedUrl) return null;

                return (
                  <div key={`url-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img 
                      src={trimmedUrl} 
                      alt="URL Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ""; // fallback if image fails to load
                        e.currentTarget.alt = "Invalid URL";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrls(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-center text-white py-0.5">
                      URL
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Add URLs */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Add Image URLs
              </label>
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    className={inp}
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => {
                      const updated = [...imageUrls];
                      updated[index] = e.target.value;
                      setImageUrls(updated);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");

                      const updated = [...imageUrls];
                      updated[index] = pasted;

                      if (index === imageUrls.length - 1) {
                        updated.push("");
                      }

                      setImageUrls(updated);

                      e.preventDefault();
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => pasteImageUrl(index)}
                    className="px-3 border rounded-lg"
                  >
                    Paste
                  </button>

                  {index === imageUrls.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setImageUrls([...imageUrls, ""])}
                      className="px-3 border border-border rounded-lg hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                      className="px-3 border border-border text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Files */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Upload Images from Device
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
              />
            </div>
          </div>
        </Field>

        
        {/* Flash Sale */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.flashSale}
            onChange={(e) =>
              setForm({ ...form, flashSale: e.target.checked })
            }
            className="accent-primary"
          />
          Flash Sale
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            className="
            px-5
            py-2.5
            rounded-xl
            bg-[#D4AF37]
            text-white
            hover:brightness-110
            transition-all
            flex items-center gap-2
            "
          >
            {saving && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save
          </button>
        </div>
      </form>
    </Modal>
    <Modal
      open={categoryModalOpen}
      onClose={() => setCategoryModalOpen(false)}
      title="Add Category"
    >
      <div className="space-y-4">

        <input
          className={inp}
          placeholder="Category name"
          value={newCategory}
          onChange={(e) =>
            setNewCategory(e.target.value)
          }
        />

        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={() => setCategoryModalOpen(false)}
            className="px-4 py-2 border border-border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={createCategory}
            className="px-4 py-2 bg-[#D4AF37]
            hover:brightness-110
            text-white rounded-lg"
          >
            Add Category
          </button>

        </div>
      </div>
    </Modal>
    </>
  );
}

const inp = `
      w-full
      px-3
      py-2.5
      bg-white
      border
      border-[#E5E0D8]
      rounded-xl
      text-sm
      focus:outline-none
      focus:ring-2
      focus:ring-[#D4AF37]
      `;
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>{children}</div>;
}