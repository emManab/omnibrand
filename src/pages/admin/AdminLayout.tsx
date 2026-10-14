import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

interface NavItem {
  name: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { name: "Products", to: "/admin/products", icon: Package },
  { name: "Categories", to: "/admin/categories", icon: FolderTree },
  { name: "Inventory", to: "/admin/inventory", icon: Warehouse },
  { name: "Banners", to: "/admin/banners", icon: ImageIcon },
  { name: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", to: "/admin/customers", icon: Users },
  { name: "Settings", to: "/admin/settings", icon: Settings },
  { name: "Profile", to: "/admin/profile", icon: UserCircle },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/admin/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* Mobile top navigation header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0c1d3c] text-white border-b border-[#1b315b]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar menu"
            className="p-2 rounded-lg bg-[#14284b] hover:bg-[#1a3461] text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight">Calcuttapress</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1b4dff] px-1.5 py-0.5 rounded text-white">
              Admin
            </span>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-[#14284b] px-2.5 py-1.5 rounded-lg border border-[#223d6c]"
        >
          <span>Store</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c1d3c] text-white flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-[#182f57] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Calcuttapress</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1b4dff] text-white px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Production & Management</p>
          </div>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#14284b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1b4dff] text-white shadow-sm shadow-[#1b4dff]/30 font-semibold"
                      : "text-slate-300 hover:bg-[#14284b] hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer controls & user info */}
        <div className="p-3 border-t border-[#182f57] space-y-2">
          {/* Quick storefront link */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#14284b] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 bg-[#071433] px-1.5 py-0.5 rounded">
              Live
            </span>
          </Link>

          {/* Current admin profile pill */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#08152e] border border-[#162a4d]">
            <div className="w-8 h-8 rounded-full bg-[#1b4dff]/20 text-[#6ea0ff] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.fullName || "Administrator"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                <ShieldCheck className="w-3 h-3 text-[#1b4dff] flex-shrink-0" />
                <span className="truncate">{user?.email || "admin"}</span>
              </div>
            </div>
          </div>

          {/* Sign out button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
