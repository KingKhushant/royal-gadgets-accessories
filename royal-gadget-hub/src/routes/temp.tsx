import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { RefreshCw, Package, FolderTree, Image as ImageIcon, AlertTriangle, ArrowRight, Clock, Copy, CheckCircle2, XCircle, Clock3, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const Route = createFileRoute("/temp")({
  head: () => ({ meta: [{ title: "Dashboard — Royal Mobile Gadget Admin" }] }),
  component: DashboardPage,
});

interface Order {
  _id: string;
  customerName: string;
  city?: string;
  state?: string;
  createdAt: string;
  total: number;
  status?: string;
  phone?: string;
  address?: string;
  pincode?: string;

  items?: {
    quantity: number;
    price: number;
    product?: {
      _id: string;
      name: string;
      images?: string[];
    };
  }[];
}

function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    activeBanners: 0,
    lowStock: 0,
  });
  
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fullAddress = selectedOrder
    ? [
        selectedOrder.address,
        selectedOrder.city,
        selectedOrder.state,
        selectedOrder.pincode,
      ].filter(Boolean).join(", ")
    : "";

  const getProductDisplay = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return { text: "No Products", extra: 0 };
    }
    const names = order.items.map((item) => item.product?.name).filter(Boolean);
    return { text: names[0] || "Unknown Product", extra: names.length - 1 };
  };

  const refreshOrders = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/orders");
      let orders = Array.isArray(res.data) ? res.data : res.data?.orders || [];

      orders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      if (orders.length > lastCount) {
        toast.success(`${orders.length - lastCount} new order received 🎉`);
      }

      setLastCount(orders.length);
      setRecentOrders(orders);
      toast.success("Orders refreshed");
    } catch (err) {
      toast.error("Failed to refresh orders");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const [pRes, cRes, bRes, oRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/banners"),
          api.get("/orders"),
        ]);

        const products = Array.isArray(pRes.data) ? pRes.data : pRes.data?.products || [];
        const categories = Array.isArray(cRes.data) ? cRes.data : cRes.data?.categories || [];
        const banners = Array.isArray(bRes.data) ? bRes.data : bRes.data?.banners || [];
        let orders = Array.isArray(oRes.data) ? oRes.data : oRes.data?.orders || [];

        orders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setStats({
          products: products.length,
          categories: categories.length,
          activeBanners: banners.filter((x: any) => x.isActive ?? x.active).length,
          lowStock: products.filter((x: any) => (x.stock ?? 0) < 5).length,
        });

        setRecentProducts(products.slice(0, 6));
        setRecentOrders(orders);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Dashboard</h1>
        <p className="text-[#374151]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Products", value: stats.products, icon: Package, color: "from-[#D4AF37] to-[#9F1239]" },
          { label: "Categories", value: stats.categories, icon: FolderTree, color: "from-emerald-500 to-teal-600" },
          { label: "Active Banners", value: stats.activeBanners, icon: ImageIcon, color: "from-amber-500 to-orange-600" },
          { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-[#E5E0D8] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-inner`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#1F2937]">{loadingStats ? "—" : item.value}</p>
            <p className="text-sm text-[#374151] mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg text-[#1F2937] flex items-center gap-2">
              <Clock className="w-5 h-5" /> Recent Orders
            </h2>
            <button
              onClick={refreshOrders}
              className="w-9 h-9 rounded-xl border border-[#E5E0D8] hover:bg-white flex items-center justify-center transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          <Link to="/orders" className="text-[#D4AF37] hover:text-[#9F1239] flex items-center gap-1 text-sm font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          {loadingStats ? (
            <div className="py-12 text-center text-[#374151]">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center text-[#374151]">No recent orders</div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 cursor-pointer hover:bg-[#F8F5F0] transition-all flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1F2937] truncate">{order.customerName}</p>
                    <p className="text-sm text-[#374151] truncate">
                      {order.city || "N/A"}, {order.state || "N/A"}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-[#1F2937]">
                      {getProductDisplay(order).text}
                      {getProductDisplay(order).extra > 0 && (
                        <span className="ml-1 text-[#D4AF37] text-xs">+{getProductDisplay(order).extra}</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[#1F2937]">₹{(order.total || 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-[#374151]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg text-[#1F2937]">Recent Products</h2>
          <Link to="/products" className="text-[#D4AF37] hover:text-[#9F1239] flex items-center gap-1 text-sm font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProducts.map((p: any) => (
            <Link
              key={p._id}
              to="/products"
              className="bg-white border border-[#E5E0D8] rounded-2xl p-4 hover:border-[#D4AF37]/50 hover:shadow transition-all"
            >
              <h3 className="font-medium text-[#1F2937] line-clamp-2 mb-3">{p.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-[#1F2937]">₹{p.price}</p>
                <span className={`text-xs px-3 py-1 rounded-full ${p.stock > 5 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  Stock: {p.stock}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-lg text-[#1F2937] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: "/products", label: "Add Product", icon: Package },
            { to: "/categories", label: "Add Category", icon: FolderTree },
            { to: "/banners", label: "Add Banner", icon: ImageIcon },
            { to: "/reviews", label: "Reviews", icon: Clock },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center justify-center bg-white border border-[#E5E0D8] hover:border-[#D4AF37] rounded-3xl p-6 transition-all hover:shadow-md"
            >
              <action.icon className="w-8 h-8 text-[#D4AF37] mb-3" />
              <span className="text-sm font-medium text-[#1F2937] text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-semibold text-[#1F2937]">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl text-[#374151] hover:text-black">✕</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[#1F2937]">
              <div>
                <p className="font-medium">Customer</p>
                <p>{selectedOrder.customerName}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Phone:</span>
                <a href={`tel:${selectedOrder.phone}`} className="text-[#D4AF37] hover:underline">{selectedOrder.phone}</a>
                <button onClick={() => { navigator.clipboard.writeText(selectedOrder.phone || ""); toast.success("Phone copied"); }}>
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F8F5F0] border border-[#E5E0D8] rounded-2xl p-4">
                <p className="text-sm font-medium mb-1">Delivery Address</p>
                <p className="text-sm leading-relaxed">{fullAddress}</p>
              </div>

              <div className="bg-[#F8F5F0] border border-[#E5E0D8] rounded-2xl p-4">
                <p className="font-medium mb-3">Products ({selectedOrder.items?.length || 0})</p>
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-t border-[#E5E0D8] first:border-0">
                    <div>
                      <p className="text-sm">{item.product?.name}</p>
                      <p className="text-xs text-[#374151]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <p className="text-2xl font-bold text-[#1F2937]">
                  Total: ₹{selectedOrder.total?.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t flex gap-3 justify-center bg-[#F8F5F0]">
              <button
                className="w-8 h-8 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-500/25"
                title="Delete Order"
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete this order?"
                  );

                  if (!confirmed) return;

                  try {
                    await api.delete(`/orders/${selectedOrder._id}`);

                    toast.success("Order deleted successfully");

                    setRecentOrders((prev) =>
                      prev.filter((o) => o._id !== selectedOrder._id)
                    );

                    setSelectedOrder(null);
                  } catch (error) {
                    toast.error("Failed to delete order");
                    console.error(error);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-300" />
                
              </button>
              
              {/* Decline */}
              <button
                title="Decline"
                className="group flex flex-col items-center gap-1"
                onClick={async () => {
                  try {
                    await api.put(`/orders/${selectedOrder._id}/status`, {
                      status: "Cancelled",
                    });

                    toast.success("Order declined");
                    setSelectedOrder(null);
                  } catch {
                    toast.error("Failed to decline order");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500/25">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[11px] font-medium text-red-500">
                  Decline
                </span>
              </button>

              {/* Pending */}
              <button
                title="Pending"
                className="group flex flex-col items-center gap-1"
                onClick={async () => {
                  try {
                    await api.put(`/orders/${selectedOrder._id}/status`, {
                      status: "Pending",
                    });

                    toast.success("Order marked pending");
                    setSelectedOrder(null);
                  } catch {
                    toast.error("Failed to update order");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow-500/25">
                  <Clock3 className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-[11px] font-medium text-yellow-500">
                  Pending
                </span>
              </button>

              {/* Approve */}
              <button
                title="Approve"
                className="group flex flex-col items-center gap-1"
                onClick={async () => {
                  try {
                    await api.put(`/orders/${selectedOrder._id}/status`, {
                      status: "Confirmed",
                    });

                    toast.success("Order approved");
                    setSelectedOrder(null);
                  } catch {
                    toast.error("Failed to approve order");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/25">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-[11px] font-medium text-green-500">
                  Approve
                </span>
              </button>
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 rounded-2xl border border-[#E5E0D8] hover:bg-white">Close</button>
              {/* You can keep or enhance the status buttons similarly */}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}