import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Welcome to Calcuttapress Admin");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@calcuttapress.com");
    setPassword("admin123");
    toast.info("Demo administrator credentials filled");
  };

  return (
    <div className="min-h-screen bg-[#071433] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to store navigation */}
        <div className="mb-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-[#0c1d3c] px-3.5 py-1.5 rounded-full border border-[#1b315b]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to storefront</span>
          </Link>
        </div>

        {/* Branding header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1b4dff] text-white shadow-lg shadow-[#1b4dff]/30 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Calcuttapress Admin
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Sign in to access catalog, inventory, and order management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0c1d3c] py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-[#1b315b]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@calcuttapress.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#071433] border border-[#223d6c] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#071433] border border-[#223d6c] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#1b4dff] hover:bg-[#123de0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4dff] focus:ring-offset-[#0c1d3c] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#1b4dff]/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          {/* Offline/demo credentials helper */}
          <div className="mt-6 pt-5 border-t border-[#1b315b]/70">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#071433]/80 border border-[#1b315b]">
              <KeyRound className="w-4 h-4 text-[#6ea0ff] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <p className="font-medium text-white">Local / Demo Access</p>
                <p className="mt-0.5 text-slate-400">
                  Use default local credentials or click below to autofill:
                </p>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="mt-2 text-xs font-medium text-[#6ea0ff] hover:text-white underline underline-offset-2"
                >
                  Autofill admin credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
