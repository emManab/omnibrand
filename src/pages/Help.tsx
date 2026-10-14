export function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Calcuttapress support</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">How Calcuttapress prints</h1>
      <p className="mt-3 text-sm leading-6 text-muted">A quick guide to preparing artwork, production timelines and secure checkout.</p>
      <div className="mt-8 space-y-8 text-[15px] leading-7 text-muted">
        <section>
          <h2 className="text-lg font-semibold text-ink">Artwork</h2>
          <p className="mt-2">Upload PNG or SVG logos in the editor. Keep type 3 mm from trim. We review files before press — you will hear from production if a logo is too low-resolution for the size you picked.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">Turnaround</h2>
          <p className="mt-2">Business cards and stickers: 3–5 working days after approval. Apparel: 5–8. Packaging: 7–12. Delivery estimates depend on product, artwork approval and destination.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">Payments</h2>
          <p className="mt-2">Razorpay handles supported payment methods. Checkout charges are created through the configured backend so payment secrets are not exposed in the browser.</p>
        </section>
      </div>
    </div>
  );
}
