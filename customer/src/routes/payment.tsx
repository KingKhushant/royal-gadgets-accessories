import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/payment")({
  component: Payment,
});

function Payment() {
  const navigate = useNavigate();

  // demo status
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const orderId =
  localStorage.getItem("currentOrderId");
  // console.log("Current Order ID:", orderId);

  const checkPayment = async () => {
  try {
    setLoading(true);

    const orderId =
      localStorage.getItem("currentOrderId");

    if (!orderId) {
      toast.error("Order not found");
      return;
    }

    const res = await api.get(
      `/orders/${orderId}`
    );

    const order = res.data.order;

    setStatus(order.status);

    if (order.status === "Confirmed") {
      toast.success("Payment approved!");

      navigate({
        to: "/order-confirmed",
      });

      return;
    }

    if (order.status === "Cancelled") {
      toast.error(
        "Payment rejected. Please contact support."
      );

      return;
    }

    toast.info(
      "Payment verification is still pending."
    );
  } catch (err) {
    console.error(err);
    toast.error("Unable to check payment");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="max-w-xl mx-auto px-4 py-10">
      <div className="royal-border bg-white rounded-3xl p-6 sm:p-8 text-center">

        <h1 className="font-display text-2xl sm:text-4xl mb-6">
          Complete Payment
        </h1>

        {/* QR Code */}
        <div className="bg-zinc-50 rounded-2xl p-4 mb-6 flex justify-center">
          <img
            src="../src/assets/qr-code.png"
            alt="UPI QR"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
          />
        </div>

        {/* UPI Info */}
        <div className="space-y-3 text-sm sm:text-base mb-6">
          <div>
            <span className="text-zinc-500">UPI ID:</span>
            <div className="font-semibold">royal-gadget@upiid</div>
          </div>

          <div>
            <span className="text-zinc-500">Call After Payment:</span>
            <div className="font-semibold">+91 91728 91633</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 text-amber-700 rounded-2xl p-4 text-sm mb-6">
          1. Scan QR and pay <br />
          2. Call admin for verification <br />
          3. Wait for approval
        </div>

        {/* Check Status */}
        <button
          onClick={checkPayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 rounded-2xl font-semibold disabled:opacity-50"
        >
          {loading
            ? "Checking..."
            : "Check Payment Status"}
        </button>

        <p className="text-xs text-zinc-500 mt-4">
          Current Status: <span className="font-semibold">{status}</span>
        </p>
      </div>
    </section>
  );
}