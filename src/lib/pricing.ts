import type { Product } from "@/types";

const quantityTiers: Record<number, number> = {
  1: 1,
  2: 0.98,
  5: 0.95,
  6: 0.94,
  10: 0.92,
  12: 0.9,
  24: 0.86,
  25: 0.85,
  48: 0.8,
  50: 0.78,
  96: 0.72,
  100: 0.7,
  250: 0.58,
  500: 0.48,
  1000: 0.4,
  2500: 0.34,
};

function nearestTier(qty: number) {
  const keys = Object.keys(quantityTiers)
    .map(Number)
    .sort((a, b) => a - b);
  let factor = 1;
  for (const k of keys) {
    if (qty >= k) factor = quantityTiers[k];
  }
  return factor;
}

export function findOption(options: Product["sizes"], id: string) {
  return options.find((o) => o.id === id) ?? options[0];
}

export function priceFor(product: Product, opts: {
  quantity: number;
  sizeId: string;
  materialId: string;
  finishId: string;
}) {
  const size = findOption(product.sizes, opts.sizeId);
  const material = findOption(product.materials, opts.materialId);
  const finish = findOption(product.finishes, opts.finishId);
  const qty = Math.max(1, opts.quantity);
  const unit =
    product.fromPrice *
    size.multiplier *
    material.multiplier *
    finish.multiplier *
    nearestTier(qty);
  const lineTotal = unit * qty;
  return {
    unitPrice: Math.round(unit),
    lineTotal: Math.round(lineTotal),
    size,
    material,
    finish,
  };
}
