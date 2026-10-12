import type { Order, OrderStatus } from "@/types";
import { supabase, supabaseEnabled } from "@/lib/supabase";

const KEY = "omnibrand.orders";

function localAll(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Order[];
  } catch {
    return [];
  }
}

function localSave(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export async function saveOrder(order: Order) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      user_id: order.userId,
      email: order.email,
      name: order.name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      pincode: order.pincode,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      razorpay_order_id: order.razorpayOrderId,
      razorpay_payment_id: order.razorpayPaymentId,
    });
    if (error) throw error;
    return;
  }
  localSave([order, ...localAll()]);
}

export async function listOrdersForUser(userId: string, email?: string) {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`user_id.eq.${userId},email.eq.${email ?? ""}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }
  return localAll().filter((o) => o.userId === userId || (email && o.email === email));
}

export async function listAllOrders() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }
  return localAll();
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  localSave(localAll().map((o) => (o.id === id ? { ...o, status } : o)));
}

function mapRow(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ""),
    email: String(row.email ?? ""),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    pincode: String(row.pincode ?? ""),
    items: (row.items as Order["items"]) ?? [],
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    total: Number(row.total ?? 0),
    status: row.status as Order["status"],
    razorpayOrderId: row.razorpay_order_id as string | undefined,
    razorpayPaymentId: row.razorpay_payment_id as string | undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}
