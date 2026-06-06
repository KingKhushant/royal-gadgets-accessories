import { useNavigate } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — Royal Mobile Accessories" }] }),
});

function Checkout() {
  const { items, total, clear } = useCart();
  const [pay, setPay] = useState("cod");
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const continueToPayment = async () => {
    try {
      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.qty,
          price: item.product.price,
        })),

        total,
        status: "Pending",
        paymentStatus: "Pending",
      };

      const response = await api.post("/orders", orderData);

      console.log("Order Created:", response.data);

      // SAVE ORDER ID
      localStorage.setItem(
        "currentOrderId",
        response.data.order._id
      );

      console.log(
        "Saved Order ID:",
        response.data.order._id
      );

      toast.success("Order saved successfully");

      navigate({
        to: "/payment",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save order");
    }
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order placed successfully!");
    setDone(true);
    clear();
  };

  if (done) {
    return (
      <section className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-emerald-600" size={52} />
        </div>
        <h1 className="font-display text-4xl">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Thank you! Our team will WhatsApp you shortly for confirmation.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex bg-gradient-to-r from-rose-600 to-rose-700 text-white px-8 py-3.5 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          Back to Home
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Nothing to checkout</h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex bg-gradient-to-r from-rose-600 to-rose-700 text-white px-8 py-3.5 rounded-2xl font-semibold"
        >
          Shop Now
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      <h1 className="font-display text-2xl sm:text-4xl mb-5 sm:mb-10">
        Checkout
      </h1>

      <form
        onSubmit={placeOrder}
        className="grid lg:grid-cols-[1fr_380px] gap-5 sm:gap-10"
      >
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-8">

          {/* Delivery Details */}
          <div className="royal-border bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8">
            <h3 className="font-display text-lg sm:text-2xl mb-4 sm:mb-6">
              Delivery Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
              <input
                required
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Full Name"
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none"
              />

              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                maxLength={15}
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none"
              />

              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none sm:col-span-2"
              />

              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full Address"
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none sm:col-span-2"
              />

              <input
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none"
              />

              <input
                required
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength={6}
                className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:border-rose-300 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={continueToPayment}
              className="w-full mt-5 sm:mt-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base hover:shadow-lg transition-all"
            >
              Continue to Payment
            </button>
          </div>

          {/* Payment Method */}
          {/* <div className="royal-border bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8">
            <h3 className="font-display text-lg sm:text-2xl mb-4 sm:mb-6">
              Payment Method
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {[
                {
                  id: "cod",
                  label: "Cash on Delivery",
                  desc: "Pay when you receive the order",
                },
                {
                  id: "upi",
                  label: "UPI Payment",
                  desc: "Google Pay, PhonePe, Paytm",
                },
                {
                  id: "razorpay",
                  label: "Cards / Net Banking",
                  desc: "Powered by Razorpay",
                },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                    pay === option.id
                      ? "border-rose-600 bg-rose-50"
                      : "border-zinc-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={pay === option.id}
                    onChange={(e) => setPay(e.target.value)}
                    className="mt-1 accent-rose-600"
                  />

                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {option.label}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {option.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div> */}
        </div>

        {/* Order Summary */}
        <aside className="royal-border bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-lg sm:text-2xl mb-4 sm:mb-6">
            Your Order
          </h3>

          <div className="space-y-2 sm:space-y-4 text-xs sm:text-sm">
            {items.map((i) => (
              <div key={i.product._id} className="flex justify-between gap-2">
                <span className="line-clamp-1 pr-2">
                  {i.product.name} × {i.qty}
                </span>
                <span className="font-medium shrink-0">
                  ₹{i.product.price * i.qty}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 my-4 sm:my-6" />

          <div className="flex justify-between items-baseline font-display text-xl sm:text-3xl">
            <span>Total</span>
            <span className="text-gradient-gold">₹{total}</span>
          </div>

          {/* <button
            type="submit"
            className="mt-5 sm:mt-8 w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg shadow-lg transition-all"
          >
            Place Order
          </button> */}

          <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-3 sm:mt-5">
            Secure checkout • for any technical issue contact on 8007307435
          </p>
        </aside>
      </form>
    </section>
  );
}