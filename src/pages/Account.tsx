import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { listOrdersForUser } from "@/lib/orders";
import { formatInr } from "@/lib/money";
import type { Order } from "@/types";

export function AccountPage() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const [params] = useSearchParams();
  const highlight = params.get("order");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void listOrdersForUser(user?.id ?? "guest", user?.email).then(setOrders);
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your orders</h1>
          <p className="mt-1 text-sm text-muted">
            {user ? user.email : "Guest checkout on this browser"}
          </p>
        </div>
        {user ? (
          <button onClick={() => void signOut()} className="text-sm text-muted">
            Sign out
          </button>
        ) : (
          <Link to="/login" className="text-sm text-brand">
            Sign in
          </Link>
        )}
      </div>

      {user?.role === "admin" && (
        <Link
          to="/admin"
          className="mt-4 inline-block rounded-full bg-navy px-4 py-2 text-sm font-medium text-white"
        >
          Open admin dashboard
        </Link>
      )}

      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li
            key={o.id}
            className={`rounded-2xl border p-5 ${highlight === o.id ? "border-brand" : "border-line"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{o.id.slice(0, 8).toUpperCase()}</p>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium capitalize">
                {o.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {new Date(o.createdAt).toLocaleString("en-IN")} · {formatInr(o.total)}
            </p>
            <ul className="mt-3 text-sm">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.name} × {i.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {orders.length === 0 && (
        <p className="mt-10 text-muted">No orders yet. Custom work starts in the catalogue.</p>
      )}
    </div>
  );
}
