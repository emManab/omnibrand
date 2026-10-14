import { ShoppingCart } from "lucide-react";

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review customer orders, production statuses, tracking numbers, and custom artwork files.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-50 text-[#1b4dff] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Order Management & Fulfillment</h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Order lifecycle tracking, artwork review pipeline, and status updates are coming soon.
        </p>
      </div>
    </div>
  );
}
