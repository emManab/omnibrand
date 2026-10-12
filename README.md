# OmniBrand

Premium online printing for business cards, apparel, packaging, stickers and merch. React, TypeScript, Vite, Tailwind CSS, Fabric.js editor, Supabase, Razorpay.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

Without env keys the storefront, editor, cart and local checkout still work. Payments and cloud auth activate when you add credentials.

**Demo admin (local mode):** `admin@omnibrand.com` / `admin123`

## Connect Supabase

1. Create a project and run `supabase/migrations/20241012000000_omnibrand.sql` in the SQL editor.
2. Promote an admin in **Authentication → Users → user → App metadata**:

```json
{ "role": "admin" }
```

3. Copy `.env.example` to `.env` and set:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RAZORPAY_KEY_ID=
```

4. Deploy Edge Functions (secrets stay on the server):

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
```

Never put `RAZORPAY_KEY_SECRET` or the Supabase service role in `VITE_` variables.

## What is built

- Homepage, catalogue, search, category filters, product pages
- Dynamic price from quantity, size, material and finish
- Fabric.js editor: text, logo upload, colour, resize, live preview
- Cart, checkout, order history
- Razorpay via Edge Functions with HMAC verification
- Admin desk: orders, artwork approval, production status, starting prices
