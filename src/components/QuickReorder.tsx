import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { getProductById } from "@/data/catalog";
import { toast } from "sonner";

interface PastOrder {
  id: string;
  productId: string;
  productName: string;
  image: string;
  quantity: number;
  size: string;
  material: string;
  finish: string;
  unitPrice: number;
  orderedAt: number;
}

export function QuickReorder() {
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const add = useCart((s) => s.add);

  useEffect(() => {
    try {
      const orders = localStorage.getItem('past_orders');
      if (orders) {
        const parsed: PastOrder[] = JSON.parse(orders);
        setPastOrders(parsed.sort((a, b) => b.orderedAt - a.orderedAt).slice(0, 4));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const reorder = (order: PastOrder) => {
    const product = getProductById(order.productId);
    if (!product) {
      toast.error("Product no longer available");
      return;
    }

    add({
      id: crypto.randomUUID(),
      productId: order.productId,
      name: order.productName,
      image: order.image,
      quantity: order.quantity,
      size: order.size,
      material: order.material,
      finish: order.finish,
      unitPrice: order.unitPrice,
      lineTotal: order.unitPrice * order.quantity,
    });

    toast.success("Added to cart - ready to reorder!");
  };

  if (pastOrders.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="text-[#0875f5]" />
          <h2 className="text-base font-extrabold tracking-tight text-[#182b48] sm:text-lg">Quick Reorder</h2>
        </div>
      </div>
      <p className="mt-1 text-sm text-[#66758b]">Order again with one click - same specs, fresh print.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pastOrders.map(order => (
          <div key={order.id} className="group overflow-hidden rounded-xl border border-[#e6eaf2] bg-white transition hover:shadow-lg">
            <div className="aspect-square overflow-hidden bg-[#f5f7fa]">
              <img src={order.image} alt={order.productName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold text-[#182b48]">{order.productName}</h3>
              <p className="mt-1 text-xs text-[#66758b]">
                {order.quantity} × {order.size} · {order.material}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => reorder(order)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0875f5] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#075fd0]"
                >
                  <ShoppingBag size={13} />
                  Reorder
                </button>
                <Link
                  to={`/product/${getProductById(order.productId)?.slug}`}
                  className="flex items-center justify-center rounded-lg border border-[#d5dde8] px-3 py-2 text-xs font-semibold text-[#34445e] transition hover:bg-[#f5f7fa]"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function savePastOrder(order: Omit<PastOrder, 'id' | 'orderedAt'>) {
  try {
    const existing = localStorage.getItem('past_orders');
    const orders: PastOrder[] = existing ? JSON.parse(existing) : [];

    orders.unshift({
      ...order,
      id: crypto.randomUUID(),
      orderedAt: Date.now(),
    });

    localStorage.setItem('past_orders', JSON.stringify(orders.slice(0, 50)));
  } catch {
    // Ignore storage errors
  }
}
