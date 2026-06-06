import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-display text-gradient-gold">404</h1>
        <p className="mt-3 text-muted-foreground">This royal page doesn't exist.</p>
        <Link to="/" className="inline-block mt-6 bg-gradient-gold text-primary-foreground px-5 py-2 rounded-md font-medium">Go Home</Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Royal Mobile Accessories — Nagpur's Premium Gadget & Gift Store" },
      { name: "description", content: "Best deals on mobile accessories, gadgets, smart watches, earbuds, toys & gifts in Nagpur. Visit us at Gurudev Nagar, opposite Petrol Pump." },
      { property: "og:title", content: "Royal Mobile Accessories — Nagpur's Premium Gadget & Gift Store" },
      { property: "og:description", content: "Best deals on mobile accessories, gadgets, smart watches, earbuds, toys & gifts in Nagpur. Visit us at Gurudev Nagar, opposite Petrol Pump." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Royal Mobile Accessories — Nagpur's Premium Gadget & Gift Store" },
      { name: "twitter:description", content: "Best deals on mobile accessories, gadgets, smart watches, earbuds, toys & gifts in Nagpur. Visit us at Gurudev Nagar, opposite Petrol Pump." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fa536d3e-6609-4175-b55b-f7a843c3abea" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fa536d3e-6609-4175-b55b-f7a843c3abea" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Navbar />
        <main className="min-h-[60vh]">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
        <Toaster theme="dark" position="top-right" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}
