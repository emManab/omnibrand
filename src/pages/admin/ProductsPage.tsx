import { Package, Plus } from "lucide-react";

export function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product catalog, pricing, variants, and print calculator options.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1b4dff] rounded-xl opacity-60 cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-50 text-[#1b4dff] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Product Management Module</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Full product catalog editor, image gallery uploads, and print variant matrix are coming in the next phase.
        </p>
      </div>
    </div>
  );
}
