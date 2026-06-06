import { createFileRoute } from "@tanstack/react-router";
import { Upload, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/custom-order")({
  component: CustomOrder,
  head: () => ({ meta: [{ title: "Custom Order — Royal Mobile Accessories" }] }),
});

function CustomOrder() {
  const [file, setFile] = useState<File | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string)?.trim();
    const phone = (fd.get("phone") as string)?.trim();
    const req = (fd.get("request") as string)?.trim();
    const budget = (fd.get("budget") as string)?.trim();

    if (!name || !phone || !req) {
      toast.error("Please fill name, phone and request");
      return;
    }

    const text = `Custom Order Request%0A%0AName: ${name}%0APhone: ${phone}%0ABudget: ${budget}%0A%0ARequest: ${req}${file ? `%0A(Image attached: ${file.name})` : ""}`;
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
    toast.success("Opening WhatsApp to send your request");
    form.reset();
    setFile(null);
  };

  return (
    <section className="max-w-2xl mx-auto px-3 sm:px-5 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-1 text-rose-600 text-[10px] sm:text-xs uppercase tracking-wide">
          <Sparkles size={12} className="sm:w-4 sm:h-4" />
          Premium Personalization
        </div>

        <h1 className="font-display text-2xl sm:text-4xl mt-2">
          Custom Order Request
        </h1>

        <p className="text-muted-foreground mt-2 text-xs sm:text-sm max-w-sm mx-auto">
          Can't find what you want? We'll source it specially for you.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="royal-border bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
              Your Name
            </label>
            <input
              name="name"
              required
              maxLength={80}
              className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-rose-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
              Phone Number
            </label>
            <input
              name="phone"
              required
              maxLength={15}
              className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-rose-300 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
            Budget (₹)
          </label>
          <input
            name="budget"
            maxLength={20}
            placeholder="e.g. 800 – 2500"
            className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
            Describe Your Request
          </label>
          <textarea
            name="request"
            required
            rows={4}
            maxLength={1000}
            placeholder="I need a custom gift set..."
            className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 py-2.5 text-xs sm:text-sm focus:border-rose-300 focus:outline-none resize-y"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
            Reference Image (Optional)
          </label>

          <label className="mt-1.5 flex flex-col items-center justify-center border border-dashed border-zinc-300 hover:border-amber-400 rounded-xl sm:rounded-2xl px-4 py-5 sm:py-8 cursor-pointer transition-colors bg-zinc-50">
            <Upload size={20} className="text-rose-600 sm:w-6 sm:h-6" />

            <span className="text-xs sm:text-sm text-zinc-600 mt-2 text-center">
              {file ? file.name : "Click or drag image here"}
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white font-medium py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
        >
          Send Request via WhatsApp
        </button>
      </form>
    </section>
  );
}