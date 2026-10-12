const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !secret) {
    return json({ error: "Razorpay secrets are not configured" }, 500);
  }

  const { amount, currency = "INR", receipt } = await req.json();
  if (!amount || amount < 100) {
    return json({ error: "Invalid amount" }, 400);
  }

  const auth = btoa(`${keyId}:${secret}`);
  const rz = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, receipt }),
  });
  const body = await rz.json();
  if (!rz.ok) return json(body, rz.status);
  return json(body);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
