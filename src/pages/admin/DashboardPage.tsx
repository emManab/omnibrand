import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  FileEdit,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FolderTree,
  ArrowRight,
  Database,
  ExternalLink,
  RefreshCw,
  Loader2,
  Plus,
} from "lucide-react";
import { supabaseEnabled } from "@/lib/supabase";
import { getDashboardStats, listRecentlyUpdatedProducts, type RecentProduct } from "@/lib/api/admin";
import { formatInr } from "@/lib/money";
import { products, categories } from "@/data/catalog";
import { listAllOrders } from "@/lib/orders";
import type { DashboardStats, Order } from "@/types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    if (supabaseEnabled) {
      try {
        const [statsData, recentData] = await Promise.all([
          getDashboardStats(),
          listRecentlyUpdatedProducts(6),
        ]);
        setStats(statsData);
        setRecentProducts(recentData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard data from Supabase.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback data when Supabase is not configured
      try {
        const localOrders: Order[] = await listAllOrders();
        const paidOrders = localOrders.filter((o) => o.status !== "cancelled");
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        const fallbackStats: DashboardStats = {
          activeProducts: products.length,
          draftProducts: 0,
          archivedProducts: 0,
          inStock: products.filter((p) => p.availability === "in_stock").length,
          lowStock: products.filter((p) => p.availability === "low_stock").length,
          outOfStock: products.filter((p) => p.availability === "out_of_stock").length,
          madeToOrder: products.filter((p) => p.madeToOrder).length,
          categories: categories.length,
          publishedCategories: categories.length,
          ordersTotal: localOrders.length,
          orders30d: localOrders.length,
          revenue30d: totalRevenue,
        };

        const fallbackRecent: RecentProduct[] = products.slice(0, 6).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          status: p.status,
          updatedAt: p.updatedAt,
        }));

        setStats(fallbackStats);
        setRecentProducts(fallbackRecent);
      } catch {
        setError("Error preparing fallback catalog data.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your catalog, order operations, and inventory status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4dff] hover:bg-[#123de0] rounded-xl shadow-sm shadow-[#1b4dff]/25 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Supabase Not Configured Guide Banner */}
      {!supabaseEnabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm text-amber-950">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-900">
                  Supabase Backend Not Connected (Fallback Mode Active)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 rounded-full">
                  Local Mode
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                The storefront is currently operating with hardcoded catalog data and local mock storage.
                To connect to your cloud database, enable live syncing, and store orders persistently, configure your Supabase environment variables:
              </p>

              <div className="mt-3 bg-amber-900/10 rounded-xl p-3 font-mono text-xs text-amber-950 overflow-x-auto border border-amber-200">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-amber-900">Next steps:</span>
                <span className="text-amber-800">
                  1. Copy <code className="bg-amber-100 px-1 py-0.5 rounded">.env.example</code> to <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>
                </span>
                <span className="text-amber-800">•</span>
                <span className="text-amber-800">2. Apply schema migrations in <code className="bg-amber-100 px-1 py-0.5 rounded">supabase/migrations</code></span>
                <span className="text-amber-800">•</span>
                <span className="text-amber-800">3. Restart dev server</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadData()}
            className="underline font-semibold ml-2 hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !stats && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff]" />
          <p className="text-xs mt-3 font-medium">Loading dashboard metrics...</p>
        </div>
      )}

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Active Products */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Products
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.activeProducts}
              </span>
              <span className="text-xs text-slate-500">published</span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Catalog items live</span>
              <Link to="/admin/products" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Draft Products */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Draft Products
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <FileEdit className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.draftProducts}
              </span>
              <span className="text-xs text-slate-500">in preparation</span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Unpublished listings</span>
              <Link to="/admin/products" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Orders (30d) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Orders (30d)
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1b4dff] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.orders30d}
              </span>
              <span className="text-xs text-slate-500">orders placed</span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Lifetime: {stats.ordersTotal}</span>
              <Link to="/admin/orders" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>View orders</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Revenue (30d) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Revenue (30d)
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {formatInr(stats.revenue30d)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Paid online & processed</span>
              <Link to="/admin/orders" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Low Stock Alerts
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                stats.lowStock > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl font-bold tracking-tight ${
                stats.lowStock > 0 ? "text-rose-600" : "text-slate-900"
              }`}>
                {stats.lowStock}
              </span>
              <span className="text-xs text-slate-500">items below threshold</span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Out of stock: {stats.outOfStock}</span>
              <Link to="/admin/inventory" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>Inspect</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Categories
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.categories}
              </span>
              <span className="text-xs text-slate-500">groups</span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Published: {stats.publishedCategories}</span>
              <Link to="/admin/categories" className="text-[#1b4dff] font-medium hover:underline inline-flex items-center gap-1">
                <span>Organize</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Products Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Updated Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest items modified across the catalog
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-semibold text-[#1b4dff] hover:text-[#123de0] inline-flex items-center gap-1"
          >
            <span>All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Slug</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentProducts.length > 0 ? (
                recentProducts.map((p) => {
                  const statusColors: Record<string, string> = {
                    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    draft: "bg-amber-50 text-amber-700 border-amber-200",
                    archived: "bg-slate-100 text-slate-600 border-slate-200",
                  };
                  const badgeClass = statusColors[p.status] || "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        /{p.slug}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${badgeClass}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "Recent"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-[#1b4dff] transition-colors"
                          title="Preview in Store"
                        >
                          <span>Storefront</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
