import { Image as ImageIcon, Plus } from "lucide-react";

export function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Banners & Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure homepage hero carousels, promo cards, and special discount announcements.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1b4dff] rounded-xl opacity-60 cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Banner</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Banner & Promotion Manager</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Scheduling promotions, banner asset uploading, and CTA targeting are coming soon.
        </p>
      </div>
    </div>
  );
}
