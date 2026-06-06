import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/cart")({
  component: Cart,
  head: () => ({ meta: [{ title: "Cart — Royal Mobile Accessories" }] }),
});

function Cart() {
  const { items, remove, setQty, total, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const shipping = total > 499 || total === 0 ? 0 : 49;
  const grand = total - discount + shipping;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "ROYAL10") {
      setDiscount(Math.round(total * 0.1));
      toast.success("✅ Coupon applied — 10% off!");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon code");
    }
  };

  // CartProvider ke andar
    const placeOrder = async (shippingDetails: any) => {
      const orderData = {
        customerName: shippingDetails.name,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.qty,
          price: item.product.price
        })),
        total: total,
      };

      const res = await api.post("/orders", orderData);
      localStorage.setItem(
        "currentOrderId",
        res.data.order._id
      );
      return res.data;
    };

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="mx-auto w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-6xl mb-6">
          🛍️
        </div>
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Discover premium mobile accessories &amp; gifts
        </p>
        <Link
          to="/shop"
          className="inline-flex mt-8 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-8 py-3.5 rounded-2xl font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition-all"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      <h1 className="font-display text-2xl sm:text-4xl mb-5 sm:mb-10">
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 sm:gap-10">

        {/* Cart Items */}
        <div className="space-y-3 sm:space-y-6">
          {items.map((i) => (
            <div
              key={i.product._id}
              className="royal-border bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex gap-3 sm:gap-6"
            >
              {/* Image */}
              <img
                src={
                  i.product.images?.[0]?.url ||
                  "/placeholder.jpg"
                }
                alt={i.product.name}
                className="w-16 h-16 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl object-cover border shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category */}
                <div className="text-[9px] sm:text-xs uppercase tracking-widest text-zinc-500">
                  {typeof i.product.category === "string" 
                    ? i.product.category 
                    : i.product.category?.name || "Uncategorized"}
                </div>

                <h3 className="font-semibold text-sm sm:text-lg leading-tight mt-1 line-clamp-2">
                  {i.product.name}
                </h3>

                <div className="text-rose-600 font-semibold mt-1 sm:mt-2 text-sm sm:text-xl">
                  ₹{i.product.price}
                </div>

                {/* Qty + Remove */}
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-4 flex-wrap">
                  <div className="flex items-center border border-zinc-200 rounded-xl sm:rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQty(i.product._id, i.qty - 1)}
                      className="px-2 sm:px-4 py-1.5 sm:py-2.5 hover:bg-zinc-100"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="px-3 sm:px-6 text-sm sm:text-base font-medium">
                      {i.qty}
                    </span>

                    <button
                      onClick={() => setQty(i.product._id, i.qty + 1)}
                      className="px-2 sm:px-4 py-1.5 sm:py-2.5 hover:bg-zinc-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => remove(i.product._id)}
                    className="text-zinc-500 hover:text-rose-600 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="text-right font-semibold text-sm sm:text-xl self-center shrink-0">
                ₹{i.product.price * i.qty}
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-xs sm:text-sm text-zinc-500 hover:text-rose-600"
          >
            Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <aside className="royal-border bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-lg sm:text-2xl mb-4 sm:mb-6">
            Order Summary
          </h3>

          {/* Coupon */}
          <div className="flex gap-2 sm:gap-3">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="ROYAL10"
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none"
            />

            <button
              onClick={applyCoupon}
              className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold"
            >
              Apply
            </button>
          </div>

          {/* Price */}
          <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Subtotal</span>
              <span>₹{total}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-zinc-600">Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>

            <div className="flex justify-between pt-3 border-t text-base sm:text-xl font-display">
              <span>Total</span>
              <span className="text-gradient-gold">₹{grand}</span>
            </div>
          </div>

          {/* Checkout */}
          <Link
            to="/checkout"
            className="mt-5 sm:mt-8 w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Proceed to Checkout
            <ArrowRight size={16} />
          </Link>

          <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-3 sm:mt-4">
            Secure payment via UPI • Cards • COD
          </p>
        </aside>
      </div>
    </section>
  );
}