import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { useRequireAuth } from "@/components/admin/useRequireAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Loader2, ImageOff, Search, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: CategoriesPage,
});

interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  order?: number;
}

const empty: Category = { name: "", slug: "", image: "", description: "", order: 0 };
const inp = `
  w-full
  px-3
  py-2.5
  bg-white
  border border-[#E5E0D8]
  rounded-xl
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-[#D4AF37]
  `;

function CategoriesPage() {
  const { ready } = useRequireAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category>(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/categories");
      setItems(Array.isArray(r.data) ? r.data : r.data?.categories || r.data?.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const filtered = useMemo(() => {
    return items.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.name?.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      const id = editing._id || editing.id;
      const payload = {
        ...editing,
        slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-")
      };

      if (id) {
        await api.put(`/categories/${id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
      }

      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!ready) return null;

  return (
    <AdminLayout>
      {/* Toolbar - Same as Products */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-none">Categories</h1>
            <p className="text-[11px] text-muted-foreground">{filtered.length} total</p>
          </div>

          <button
            onClick={() => { setEditing(empty); setOpen(true); }}
            className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-[#D4AF37]
            text-white
            text-sm font-medium
            hover:brightness-110
            transition-all
            shadow-sm
            "
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="
              w-full
              pl-9 pr-3 py-2
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-16">
              No categories found
            </p>
          )}

          {filtered.map((c) => {
            const id = (c._id || c.id)!;
            return (
              <div
                key={id}
                className="
                  bg-white
                  border border-[#E5E0D8]
                  rounded-2xl
                  overflow-hidden
                  group
                  hover:shadow-md
                  transition-all
                "
              >
                {/* Image */}
                <div className="aspect-video bg-[#F8F5F0] relative">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">/{c.slug}</p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditing(c); setOpen(true); }}
                        className="p-1.5 rounded hover:bg-muted text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmId(id)}
                        className="p-1.5 rounded hover:bg-muted text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {c.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {c.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      to="/products"
                      search={{ category: id }}
                      className="
                      flex-1
                      flex items-center justify-center gap-2
                      px-3 py-2
                      text-xs
                      border border-[#E5E0D8]
                      rounded-xl
                      bg-white
                      hover:bg-[#F8F5F0]
                      transition-all
                      "
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Products
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing._id || editing.id ? "Edit Category" : "Add Category"} size="md">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Name *</label>
            <input
              className={inp}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Slug</label>
            <input
              className={inp}
              value={editing.slug || ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              placeholder="auto-generated"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Image URL</label>
            <input
              className={inp}
              value={editing.image || ""}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
            <textarea
              className={`${inp} min-h-[80px]`}
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Order</label>
            <input
              type="number"
              className={inp}
              value={editing.order || 0}
              onChange={(e) => setEditing({ ...editing, order: +e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="
                px-5 py-2.5
                rounded-xl
                bg-[#D4AF37]
                text-white
                text-sm
                flex items-center gap-2
                hover:brightness-110
                transition-all
                "
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && del(confirmId)}
        title="Delete category?"
        description="This will permanently delete this category."
      />
    </AdminLayout>
  );
}