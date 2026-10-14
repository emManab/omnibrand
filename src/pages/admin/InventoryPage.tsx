import { Warehouse } from "lucide-react";

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track stock levels, configure low stock thresholds, and audit ledger logs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Warehouse className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Inventory Control & Ledger</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Stock level adjustments, threshold alerts, and inventory ledger history are coming soon.
        </p>
      </div>
    </div>
  );
}
