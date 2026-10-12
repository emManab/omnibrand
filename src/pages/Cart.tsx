import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatInr } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";

export function CartPage() {
  const { items, remove, setQty } = useCart();
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Browse the catalogue and add a product or a custom design.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px] lg:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Cart</h1>
        <ul className="mt-6 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <ProductImage src={item.image} alt="" className="h-24 w-24 rounded-xl object-cover bg-paper" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.size} · {item.material} · {item.finish}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQty(item.id, Math.max(1, Number(e.target.value)))}
                    className="w-20 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                  <span className="text-sm font-medium">{formatInr(item.lineTotal)}</span>
                </div>
              </div>
              <button onClick={() => remove(item.id)} className="text-muted hover:text-ink" aria-label="Remove">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-2xl border border-line p-5">
        <p className="font-semibold">Summary</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatInr(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatInr(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatInr(total)}</dd>
          </div>
        </dl>
        <Link
          to="/checkout"
          className="mt-5 block rounded-full bg-brand py-2.5 text-center text-sm font-semibold text-white"
        >
          Checkout
        </Link>
        <p className="mt-3 text-xs text-muted">Free shipping above ₹2,500. GST collected at payment.</p>
      </aside>
    </div>
  );
}
