import { supabase, supabaseEnabled } from "@/lib/supabase";
import { paise } from "@/lib/money";

export async function createRazorpayOrder(amountInr: number, receipt: string) {
  if (!supabaseEnabled || !supabase) {
    return { orderId: `demo_${receipt}`, amount: paise(amountInr), demo: true as const };
  }
  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount: paise(amountInr), receipt, currency: "INR" },
  });
  if (error) throw error;
  return { orderId: data.id as string, amount: data.amount as number, demo: false as const };
}

export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  if (!supabaseEnabled || !supabase) return { verified: true, demo: true };
  const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
    body: payload,
  });
  if (error) throw error;
  if (!data?.verified) throw new Error("Payment signature did not verify.");
  return { verified: true, demo: false };
}

export function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay."));
    document.body.appendChild(s);
  });
}
