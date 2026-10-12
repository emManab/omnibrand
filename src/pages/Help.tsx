export function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">How OmniBrand prints</h1>
      <div className="mt-8 space-y-8 text-[15px] leading-7 text-muted">
        <section>
          <h2 className="text-lg font-semibold text-ink">Artwork</h2>
          <p className="mt-2">
            Upload PNG or SVG logos in the editor. Keep type 3 mm from trim. We review files before press —
            you will hear from production if a logo is too low-res for the size you picked.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">Turnaround</h2>
          <p className="mt-2">
            Business cards and stickers: 3–5 working days after approval. Apparel: 5–8. Packaging: 7–12.
            Metro shipping is included above ₹2,500.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">Payments</h2>
          <p className="mt-2">
            Razorpay handles cards, UPI and netbanking. Charges are created in a Supabase Edge Function so
            the key secret never sits in the browser.
          </p>
        </section>
      </div>
    </div>
  );
}
