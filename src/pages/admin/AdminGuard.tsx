import { Navigate, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export function AdminGuard() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const signOut = useAuth((s) => s.signOut);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff]" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-600">
            The admin portal is reserved for Calcuttapress staff members with administrative rights.
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left">
            <div className="text-slate-500">Signed in as:</div>
            <div className="font-semibold text-slate-800 truncate mt-0.5">{user.email}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-slate-500">Role:</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-100 text-amber-800">
                {user.role}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
                navigate("/admin/login");
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
