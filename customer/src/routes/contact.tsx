import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [{ title: "Contact — Royal Mobile Accessories, Nagpur" }],
  }),
});

function Contact() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-14">
        <div className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600">
          Get In Touch
        </div>

        <h1 className="font-display text-2xl sm:text-5xl mt-2">
          Visit Our <span className="text-gradient-gold">Royal Store</span>
        </h1>

        <p className="text-muted-foreground mt-2 sm:mt-4 max-w-xl mx-auto text-xs sm:text-lg">
          Have questions? We’d love to hear from you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 sm:gap-10">
        {/* Contact Information */}
        <div className="space-y-3 sm:space-y-5">
          {[
            {
              icon: MapPin,
              title: "Store Address",
              detail:
                "Gurudev Nagar, Opposite Petrol Pump, Nagpur, Maharashtra 440009",
            },
            {
              icon: Phone,
              title: "Phone",
              detail: "+91 98765 43210",
            },
            {
              icon: Mail,
              title: "Email",
              detail: "hello@royalmobilenagpur.in",
            },
            {
              icon: Clock,
              title: "Store Hours",
              detail: "Monday – Sunday | 10:00 AM – 9:30 PM",
            },
          ].map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="royal-border bg-white rounded-xl sm:rounded-3xl p-3 sm:p-6 flex gap-3 sm:gap-5"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shrink-0">
                <Icon size={16} className="sm:w-5 sm:h-5" />
              </div>

              <div>
                <div className="uppercase text-[10px] sm:text-xs tracking-wide text-rose-600 font-medium">
                  {title}
                </div>

                <div className="mt-1 text-xs sm:text-base leading-relaxed text-zinc-700">
                  {detail}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white py-2 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">WhatsApp Us</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            <a
              href="tel:+919876543210"
              className="bg-gradient-to-r from-rose-600 to-rose-700 text-white py-2 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Phone size={16} />
              Call Now
            </a>
          </div>

          {/* Social */}
          <div className="flex gap-2 sm:gap-4 pt-2">
            <a
              href="#"
              className="p-2 sm:p-4 bg-zinc-100 hover:bg-zinc-200 rounded-xl sm:rounded-2xl transition-colors"
            >
              <Instagram size={16} className="sm:w-5 sm:h-5" />
            </a>

            <a
              href="#"
              className="p-2 sm:p-4 bg-zinc-100 hover:bg-zinc-200 rounded-xl sm:rounded-2xl transition-colors"
            >
              <Facebook size={16} className="sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="royal-border bg-white rounded-xl sm:rounded-3xl p-4 sm:p-8">
          <h3 className="font-display text-lg sm:text-3xl mb-4 sm:mb-7">
            Send us a Message
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message received! We'll reply soon.");
              (e.target as HTMLFormElement).reset();
            }}
            className="space-y-3 sm:space-y-5"
          >
            <input
              required
              placeholder="Your Name"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base"
            />

            <input
              required
              type="email"
              placeholder="Email Address"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base"
            />

            <input
              placeholder="Phone (optional)"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base"
            />

            <textarea
              required
              rows={4}
              placeholder="How can we help you?"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-3xl px-3 sm:px-5 py-3 resize-y text-xs sm:text-base"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs sm:text-base font-medium py-2 sm:py-4 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Map */}
      <div className="mt-8 sm:mt-14 royal-border bg-white rounded-xl sm:rounded-3xl overflow-hidden h-[220px] sm:h-[420px]">
        <iframe
          title="Royal Mobile Accessories Location"
          src="https://www.google.com/maps?q=Gurudev+Nagar+Nagpur&output=embed"
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}