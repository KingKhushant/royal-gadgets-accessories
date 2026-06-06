import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F5F0] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[#1F2937]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-[#374151]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9F1239] px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-[#D4AF37]/30"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F5F0] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[#1F2937]">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-[#374151]">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9F1239] px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-[#D4AF37]/30"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-[#E5E0D8] bg-white px-6 py-2.5 text-sm font-medium text-[#1F2937] transition-all hover:bg-[#F8F5F0]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Royal Mobile Admin" },
      { name: "description", content: "Royal Mobile Gadget Admin Dashboard" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#F8F5F0] text-[#1F2937]">
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
      <AuthProvider>
        <Outlet />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#1F2937",
              border: "1px solid #E5E0D8",
              borderRadius: "16px",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#D4AF37",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#9F1239",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}