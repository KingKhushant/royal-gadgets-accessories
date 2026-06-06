import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/order-confirmed")({
  component: OrderConfirmed,
});

function OrderConfirmed() {
  return (
    <section className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="royal-border bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm">

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 sm:mb-6">
          <CheckCircle2
            className="text-emerald-600"
            size={36}
          />
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl sm:text-4xl mb-3">
          Order Confirmed!
        </h1>

        {/* Message */}
        <p className="text-zinc-600 text-sm sm:text-lg leading-relaxed">
          Thank you for your payment. <br />
          Your order has been successfully placed.
        </p>

        <p className="text-zinc-500 text-xs sm:text-sm mt-3 sm:mt-4">
          Our team will contact you shortly on WhatsApp / phone for delivery confirmation.
        </p>

        {/* Buttons */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link
            to="/"
            className="bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all"
          >
            Back to Home
          </Link>

          <Link
            to="/shop"
            className="border border-zinc-300 py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}