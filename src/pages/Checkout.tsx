import { FormEvent, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { formatInr } from "@/lib/money";
import { createRazorpayOrder, loadRazorpayScript, verifyRazorpayPayment } from "@/lib/payments";
import { saveOrder } from "@/lib/orders";
import type { Order } from "@/types";

export function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setBusy(true);
    try {
      const orderId = crypto.randomUUID();
      const rz = await createRazorpayOrder(total, orderId);

      const persist = async (paymentId?: string, rzOrder?: string, status: Order["status"] = "paid") => {
        const order: Order = {
          id: orderId,
          userId: user?.id ?? "guest",
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          items,
          subtotal,
          shipping,
          total,
          status: paymentId ? "artwork_review" : status,
          razorpayOrderId: rzOrder,
          razorpayPaymentId: paymentId,
          createdAt: new Date().toISOString(),
        };
        await saveOrder(order);
        clear();
        toast.success("Order placed");
        navigate(`/account?order=${orderId}`);
      };

      if (rz.demo) {
        await persist(undefined, rz.orderId, "artwork_review");
        toast.message("Demo checkout", {
          description: "Connect Razorpay + Supabase to take live payments. This order was recorded locally.",
        });
        return;
      }

      await loadRazorpayScript();
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Missing VITE_RAZORPAY_KEY_ID");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key,
          amount: rz.amount,
          currency: "INR",
          name: "Calcuttapress",
          description: "Print order",
          order_id: rz.orderId,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyRazorpayPayment(response);
              await persist(response.razorpay_payment_id, response.razorpay_order_id);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        rzp.open();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p>Nothing to check out.</p>
        <Link to="/catalog" className="text-brand">
          Catalogue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          {user ? `Signed in as ${user.email}` : "Checking out as a guest. You can create an account after."}
        </p>
        <div className="mt-6 grid gap-3">
          <input required placeholder="Full name" className="rounded-xl border border-line px-3 py-2.5" {...field("name")} />
          <input required type="email" placeholder="Email" className="rounded-xl border border-line px-3 py-2.5" {...field("email")} />
          <input required placeholder="Phone" className="rounded-xl border border-line px-3 py-2.5" {...field("phone")} />
          <textarea required placeholder="Address" className="rounded-xl border border-line px-3 py-2.5" {...field("address")} />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" className="rounded-xl border border-line px-3 py-2.5" {...field("city")} />
            <input required placeholder="PIN code" className="rounded-xl border border-line px-3 py-2.5" {...field("pincode")} />
          </div>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-line p-5">
        <p className="font-semibold">Pay {formatInr(total)}</p>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatInr(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <button
          disabled={busy}
          className="mt-6 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Opening payment…" : "Pay with Razorpay"}
        </button>
        <p className="mt-3 text-xs leading-5 text-muted">
          Card charges are created on the server. The secret key never ships in this app. Without Supabase
          credentials, checkout records a local demo order.
        </p>
      </aside>
    </form>
  );
}
