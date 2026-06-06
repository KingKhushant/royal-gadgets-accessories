import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { RefreshCw , Package, FolderTree, Image as ImageIcon, AlertTriangle, ArrowRight, Clock, Copy, CheckCircle2, XCircle, Clock3, Trash2  } from "lucide-react";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";


export const Route = createFileRoute("/")({
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
    ]
      .filter(Boolean)
      .join(", ")
  : "";

  const getProductDisplay = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return {
        text: "No Products",
        extra: 0,
      };
    }

    const names = order.items
      .map((item) => item.product?.name)
      .filter(Boolean);

    return {
      text: names[0] || "Unknown Product",
      extra: names.length - 1,
    };
  };

  const refreshOrders = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/orders");

      let orders =
        Array.isArray(res.data)
          ? res.data
          : res.data?.orders || [];

      orders = orders
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
        if (orders.length > lastCount) {
        toast.success(
          `${orders.length - lastCount} new order received 🎉`
        );
      }

      setLastCount(orders.length);
      setRecentOrders(orders);

      toast.success("Orders refreshed");
    } catch (err) {
      toast.error("Failed to refresh orders");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      setLoadingStats(true);

      try {
        const [pRes, cRes, bRes, oRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/banners"),
          api.get("/orders"),
        ]);

        const products = Array.isArray(pRes.data)
          ? pRes.data
          : pRes.data?.products || [];

        const categories = Array.isArray(cRes.data)
          ? cRes.data
          : cRes.data?.categories || [];

        const banners = Array.isArray(bRes.data)
          ? bRes.data
          : bRes.data?.banners || [];

        let orders = Array.isArray(oRes.data)
          ? oRes.data
          : oRes.data?.orders || [];

        orders = orders
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setStats({
          products: products.length,
          categories: categories.length,
          activeBanners: banners.filter(
            (x: any) => x.isActive ?? x.active
          ).length,
          lowStock: products.filter(
            (x: any) => (x.stock ?? 0) < 5
          ).length,
        });

        setRecentProducts(products.slice(0, 6));
        setRecentOrders(orders);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const [pRes, cRes, bRes, oRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/banners"),
          api.get("/orders"),           // ← New: Fetch real orders
        ]);

        const products = Array.isArray(pRes.data) ? pRes.data : pRes.data?.products || [];
        const categories = Array.isArray(cRes.data) ? cRes.data : cRes.data?.categories || [];
        const banners = Array.isArray(bRes.data) ? bRes.data : bRes.data?.banners || [];
        
        // Process Orders
        let orders = Array.isArray(oRes.data) 
          ? oRes.data 
          : oRes.data?.orders || oRes.data?.data || [];

        // Take only latest 5 orders
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
        <p className="text-sm text-[#374151]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
     <div className="grid grid-cols-4 gap-2 mb-5">
      {[
        {
          label: "Products",
          value: stats.products,
          icon: Package,
          color: "text-[#D4AF37] bg-[#D4AF37]/10",
        },
        {
          label: "Categories",
          value: stats.categories,
          icon: FolderTree,
          color: "text-[#9F1239] bg-[#9F1239]/10",
        },
        {
          label: "Banners",
          value: stats.activeBanners,
          icon: ImageIcon,
          color: "text-[#D4AF37] bg-[#D4AF37]/10",
        },
        {
          label: "Stock",
          value: stats.lowStock,
          icon: AlertTriangle,
          color: "text-[#9F1239] bg-[#9F1239]/10",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white border border-[#E5E0D8] rounded-2xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${item.color}`}
          >
            <item.icon className="w-4 h-4" />
          </div>

          <p className="text-base sm:text-lg font-bold leading-none">
            {loadingStats ? "—" : item.value}
          </p>

          <p className="text-[9px] sm:text-[11px] text-[#374151] mt-1 leading-tight">
            {item.label}
          </p>
        </div>
      ))}
    </div>

      {/* Recent Orders Section - Now Real Data */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-4">
            <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Orders
            </h2>
            <button
              onClick={refreshOrders}
              className="w-9 h-9 rounded-xl border border-[#E5E0D8] bg-white hover:bg-[#F8F5F0] flex items-center justify-center transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <Link
            to="/orders"
            className="text-xs sm:text-sm text-primary flex items-center gap-1"
          >
            All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          {loadingStats ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Loading...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No orders
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-2 sm:p-4 cursor-pointer transition-colors
                    ${
                      order.status === "Confirmed"
                      ? "bg-green-500/10 border-l-4 border-green-500 hover:bg-green-500/20"
                      : order.status === "Cancelled"
                      ? "bg-[#9F1239]/10 border-l-4 border-[#9F1239] hover:bg-[#9F1239]/20"
                      : "bg-yellow-500/10 border-l-4 border-yellow-500 hover:bg-yellow-500/20"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    
                    {/* Left */}
                    <div className="min-w-0 w-24 sm:w-40">
                      <p className="font-medium text-sm truncate">
                        {order.customerName}
                      </p>
                    </div>
                    

                    {/* Center */}
                    <div className="flex-1 text-center min-w-0">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const product = getProductDisplay(order);

                          return (
                            <>
                              <span className="text-xs sm:text-sm truncate max-w-[120px]">
                                {product.text}
                              </span>

                              {product.extra > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px]">
                                  +{product.extra}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {order.city || "N/A"}, {order.state || "N/A"}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-xs sm:text-sm">
                        ₹{(order.total || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products - Unchanged */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm sm:text-base">
            Recent Products
          </h2>

          <Link
            to="/products"
            className="text-xs sm:text-sm text-primary flex items-center gap-1"
          >
            All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {recentProducts.map((p: any) => (
            <Link
              key={p._id || p.id}
              to="/products"
              className="bg-white border border-[#E5E0D8] rounded-2xl p-3 sm:p-4 hover:border-[#D4AF37] transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-xs sm:text-sm line-clamp-2">
                  {p.name}
                </h3>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#374151]">
                    ₹{p.price}
                  </p>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      p.stock > 5
                        ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "bg-[#9F1239]/10 text-[#9F1239]"
                    }`}
                  >
                    {p.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions - Unchanged */}
      <div>
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/products", label: "Add Product", icon: Package },
            { to: "/categories", label: "Add Category", icon: FolderTree },
            { to: "/banners", label: "Add Banner", icon: ImageIcon },
            { to: "/reviews", label: "Reviews", icon: Clock },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center justify-center bg-white border border-[#E5E0D8] hover:border-[#D4AF37] rounded-2xl p-6 transition-all hover:shadow-lg"
            >
              <action.icon className="w-7 h-7 text-[#D4AF37] mb-3" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">
                Order Details
              </h2>
              <button
                onClick={refreshOrders}
                className="w-9 h-9 rounded-xl border border-[#E5E0D8] bg-white hover:bg-[#F8F5F0] flex items-center justify-center transition-all"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#374151] hover:text-[#9F1239]"
              >
                ✕
              </button>
            </div>

            {/* Customer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              <p><strong>Name:</strong> {selectedOrder.customerName}</p>
              <div className="flex items-center gap-2">
                <strong>Phone:</strong>

                <a
                  href={`tel:${selectedOrder.phone}`}
                  className="text-[#D4AF37] hover:underline"
                >
                  {selectedOrder.phone}
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOrder.phone);
                    toast.success("Phone copied");
                  }}
                  className="p-1 rounded hover:bg-[#F8F5F0]"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    Delivery Address
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fullAddress);
                      toast.success("Address copied");
                    }}
                    className="p-1 rounded hover:bg-[#F8F5F0] transition"
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm break-words leading-relaxed">
                  {fullAddress}
                </p>
              </div>
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">
                    Products
                  </p>

                  <span className="text-xs px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                    {selectedOrder.items?.length || 0} Items
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-white p-2"
                    >
                      <div className="min-w-0">
                        <p
                          onClick={() =>
                            setExpandedProduct(
                              expandedProduct === item._id
                                ? null
                                : item._id
                            )
                          }
                          className={`font-medium text-sm cursor-pointer ${
                            expandedProduct === item._id
                              ? "whitespace-normal break-words"
                              : "truncate"
                          }`}
                        >
                          {item.product?.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold">
                        ₹{item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end border-t pt-3 mt-3">
                <p className="text-lg font-bold text-[#D4AF37]">
                  Total: ₹{selectedOrder.total?.toLocaleString("en-IN")}
                </p>
              </div>
              <p>
                <strong>Ordered On:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
              </p>
              {/* <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3">
        <p className="text-xs text-muted-foreground mb-1">
          Delivery Address
        </p>

        <p className="text-sm break-words leading-relaxed">
          {[
            selectedOrder.address,
            selectedOrder.city,
            selectedOrder.state,
            selectedOrder.pincode,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div> */}
            </div>
            

            {/* Actions */}
            <div className="p-2 border-t flex items-center justify-center gap-4">
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
                <div className="w-8 h-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/25">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[11px] font-medium text-emerald-500">
                  Approve
                </span>
              </button>

              

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}