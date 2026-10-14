import { Users } from "lucide-react";

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            View registered user profiles, order histories, and customer spending analytics.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Customer Directory</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Customer account directory, order volume metrics, and contact information are coming soon.
        </p>
      </div>
    </div>
  );
}
