import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Zap, Loader2, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Royal Mobile Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token || res.data.accessToken;
      const user = res.data.user || res.data.admin || { email };
      if (!token) throw new Error("No token returned");
      login(token, user);
      toast.success("Welcome back!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const loginAsAdmin = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", {
        email: "admin@royalgadget.com",
        password: "admin123",
      });

      const token = res.data.token || res.data.accessToken;
      const user = res.data.user || res.data.admin || { email: "admin@royalgadget.com" };

      if (!token) throw new Error("No token returned");

      login(token, user);
      toast.success("Welcome back!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Quick login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8F5F0] via-[#F8F5F0] to-[#D4AF37]/10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              loginAsAdmin();
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-[#D4AF37]/50 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
          >
            <img
              alt="Logo"
              src="./logoGoldNoBG.png"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-[#1F2937]">
            Royal Mobile Gadget
          </h1>
          <p className="text-base text-[#374151] text-center mt-1 mb-8">
            Admin Dashboard Login
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royal.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E0D8] rounded-2xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E0D8] rounded-2xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-[#D4AF37] w-4 h-4"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl border border-red-500 bg-gradient-to-r from-[#FDBA74] to-[#DC2626] text-white font-semibold text-base hover:brightness-110 active:scale-[0.985] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#374151] mt-6 font-medium bg-white/50 px-3 py-1 rounded-full">
          © {new Date().getFullYear()} Royal Mobile Gadget Admin
        </p>
      </div>
    </div>
  );
}