import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Store identity, shipping thresholds, announcement banners, and social links.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Store Settings & Configuration</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Global storefront settings, free shipping thresholds, and announcement banner controls are coming soon.
        </p>
      </div>
    </div>
  );
}
