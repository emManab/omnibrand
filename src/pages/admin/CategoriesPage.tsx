import { FolderTree, Plus } from "lucide-react";

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize catalog hierarchy, navigation tabs, and category imagery.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1b4dff] rounded-xl opacity-60 cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderTree className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Category Taxonomy Editor</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Category tree reorganization, parent/child groupings, and storefront navigation ordering are coming soon.
        </p>
      </div>
    </div>
  );
}
