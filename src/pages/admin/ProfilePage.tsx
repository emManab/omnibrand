import { UserCircle } from "lucide-react";
import { useAuth } from "@/store/auth";

export function ProfilePage() {
  const user = useAuth((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal administrator credentials, name, and security preferences.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0c1d3c] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserCircle className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName || "Administrator"}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1b4dff] border border-blue-100">
              {user?.role || "admin"}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Profile Settings
          </h3>
          <p className="text-xs text-slate-500">
            Profile editing, password change, and avatar uploads will be enabled in future phases.
          </p>
        </div>
      </div>
    </div>
  );
}
