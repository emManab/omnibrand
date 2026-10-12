import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { products } from "@/data/catalog";
import { listAllOrders, updateOrderStatus } from "@/lib/orders";
import { useAuth } from "@/store/auth";
import { formatInr } from "@/lib/money";
import type { Order, OrderStatus } from "@/types";
import { toast } from "sonner";
import { ProductImage } from "@/components/ProductImage";

const statuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "artwork_review",
  "approved",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

const PRICE_KEY = "omnibrand.priceOverrides";

export function AdminPage() {
  const user = useAuth((s) => s.user);
  const [tab, setTab] = useState<"orders" | "products" | "artwork">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(PRICE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    void listAllOrders().then(setOrders);
  }, []);

  const artwork = useMemo(
    () =>
      orders.flatMap((o) =>
        o.items
          .filter((i) => i.designDataUrl)
          .map((i) => ({ order: o, item: i })),
      ),
    [orders],
  );

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>This desk is for production staff.</p>
        <Link to="/" className="mt-3 inline-block text-brand">
          Home
        </Link>
      </div>
    );
  }

  async function setStatus(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status);
    setOrders(await listAllOrders());
    toast.success("Status updated");
  }

  function savePrice(id: string, value: number) {
    const next = { ...overrides, [id]: value };
    setOverrides(next);
    localStorage.setItem(PRICE_KEY, JSON.stringify(next));
    toast.success("Starting price saved locally. Sync to Supabase products table in production.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-3xl font-semibold">Production desk</h1>
      <p className="mt-1 text-sm text-muted">Orders, artwork approvals, and starting prices.</p>
      <div className="mt-6 flex gap-2">
        {(["orders", "artwork", "products"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-navy text-white" : "bg-paper"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    {o.name}
                    <div className="text-xs text-muted">{o.city}</div>
                  </td>
                  <td className="px-4 py-3">{formatInr(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => void setStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-line px-2 py-1"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-8 text-center text-muted">No orders yet.</p>}
        </div>
      )}

      {tab === "artwork" && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artwork.map(({ order, item }) => (
            <figure key={item.id} className="rounded-2xl border border-line p-3">
              <ProductImage src={item.designDataUrl ?? ""} alt={item.name} className="aspect-square w-full rounded-xl object-cover" />
              <figcaption className="mt-2 text-sm">
                {item.name}
                <div className="text-xs text-muted">{order.id.slice(0, 8)}</div>
              </figcaption>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => void setStatus(order.id, "approved")}
                  className="rounded-full bg-navy px-3 py-1 text-xs text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => void setStatus(order.id, "cancelled")}
                  className="rounded-full border border-line px-3 py-1 text-xs"
                >
                  Reject
                </button>
              </div>
            </figure>
          ))}
          {artwork.length === 0 && <p className="text-muted">No custom files waiting.</p>}
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">From (INR)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={overrides[p.id] ?? p.fromPrice}
                      onBlur={(e) => savePrice(p.id, Number(e.target.value))}
                      className="w-28 rounded-lg border border-line px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
