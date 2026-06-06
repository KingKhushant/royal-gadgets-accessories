import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { useRequireAuth } from "@/components/admin/useRequireAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Loader2, ImageOff } from "lucide-react";

export const Route = createFileRoute("/banners")({
  head: () => ({ meta: [{ title: "Banners — Admin" }] }),
  component: BannersPage,
});

interface BannerImage {
  url: string;
  publicId?: string;
}

interface Banner {
  _id?: string;
  id?: string;
  title: string;
  subtitle?: string;
  image?: string | BannerImage | null;
  link?: string;
  position?: "main" | "secondary" | "flash" | "sidebar";
  order?: number;
  isActive?: boolean;
}

const empty: Banner = { 
  title: "", 
  subtitle: "", 
  image: "", 
  link: "", 
  position: "main", 
  order: 0, 
  isActive: true 
};

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

// Helper Function (Same as Products)
const getImageUrl = (img?: string | BannerImage | null): string => {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || "";
};

function BannersPage() {
  const { ready } = useRequireAuth();
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner>(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/banners");
      setItems(Array.isArray(r.data) ? r.data : r.data?.banners || r.data?.data || []);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.title?.trim()) return toast.error("Title required");

    setSaving(true);
    try {
      const id = editing._id || editing.id;
      const payload = { ...editing };

      // Agar image object hai to sirf URL bhej rahe hain
      if (typeof payload.image === "object" && payload.image?.url) {
        payload.image = payload.image.url;
      }

      if (id) {
        await api.put(`/banners/${id}`, payload);
      } else {
        await api.post("/banners", payload);
      }

      toast.success(id ? "Banner updated" : "Banner created");
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
      await api.delete(`/banners/${id}`);
      toast.success("Banner deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 mb-5 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">{items.length} banners</p>
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
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin mx-auto mt-12" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">No banners yet</p>
          )}

          {items.map((b) => {
            const id = (b._id || b.id)!;
            const imageUrl = getImageUrl(b.image);

            return (
              <div
                key={id}
                className="
                bg-white
                border border-[#E5E0D8]
                rounded-2xl
                overflow-hidden
                shadow-sm
              "
              >
                <div className="aspect-[3/1] bg-[#F8F5F0] relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${b.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs bg-black/60 text-white uppercase">
                    {b.position}
                  </span>
                </div>

                <div className="p-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{b.title}</h3>
                    {b.subtitle && <p className="text-sm text-muted-foreground truncate">{b.subtitle}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(b); setOpen(true); }}
                      className="
                      p-2
                      rounded-xl
                      bg-[#D4AF37]/10
                      text-[#D4AF37]
                      hover:bg-[#D4AF37]/20
                      "
                    >
                      <Edit2 className="w-4 h-4" />
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
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing._id || editing.id ? "Edit Banner" : "Add Banner"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
              <input className={inp} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Subtitle</label>
              <input className={inp} value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Image URL</label>
            <input
              className={inp}
              value={typeof editing.image === "string" ? editing.image : editing.image?.url || ""}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          {/* Live Preview */}
          {(() => {
            const previewUrl = typeof editing.image === "string" ? editing.image : editing.image?.url || "";
            return previewUrl && <img src={previewUrl} alt="Preview" className="
            w-full
            max-h-40
            object-cover
            rounded-xl
            border border-[#E5E0D8]
            " />;
          })()}

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Link</label>
            <input className={inp} value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Position</label>
              <select
                className={inp}
                value={editing.position}
                onChange={(e) => setEditing({ ...editing, position: e.target.value as any })}
              >
                <option value="main">Main</option>
                <option value="secondary">Secondary</option>
                <option value="flash">Flash</option>
                <option value="sidebar">Sidebar</option>
              </select>
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
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!editing.isActive}
              onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              className="accent-primary"
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="
            px-4 py-2
            rounded-xl
            border border-[#E5E0D8]
            bg-white
            hover:bg-[#F8F5F0]
            transition-all
            text-sm
            ">Cancel</button>
            <button disabled={saving} className="
              px-5 py-2.5
              rounded-xl
              bg-[#D4AF37]
              text-white
              text-sm
              flex items-center gap-2
              hover:brightness-110
              transition-all
              ">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && del(confirmId)}
        title="Delete banner?"
      />
    </AdminLayout>
  );
}