import { useState } from "react";
import { Calculator, TrendingDown } from "lucide-react";
import { formatInr } from "@/lib/money";

interface BulkPriceCalculatorProps {
  basePrice: number;
  quantities: number[];
  productName?: string;
}

export function BulkPriceCalculator({ basePrice, quantities }: BulkPriceCalculatorProps) {
  const [selectedQty, setSelectedQty] = useState(quantities[0]);

  const calculatePrice = (qty: number) => {
    let discount = 0;
    if (qty >= 1000) discount = 0.25;
    else if (qty >= 500) discount = 0.20;
    else if (qty >= 250) discount = 0.15;
    else if (qty >= 100) discount = 0.10;
    else if (qty >= 50) discount = 0.05;

    const unitPrice = Math.round(basePrice * (1 - discount));
    const total = unitPrice * qty;
    const savings = (basePrice - unitPrice) * qty;

    return { unitPrice, total, savings, discount };
  };

  const current = calculatePrice(selectedQty);

  return (
    <div className="rounded-2xl border border-[#e6eaf2] bg-gradient-to-br from-[#f8fbff] to-[#f0f7ff] p-5">
      <div className="flex items-center gap-2 text-[#0875f5]">
        <Calculator size={18} />
        <h3 className="text-sm font-bold">Bulk Pricing Calculator</h3>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-[#34445e]">Select Quantity</label>
          <select
            value={selectedQty}
            onChange={(e) => setSelectedQty(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-[#d5dde8] bg-white px-3 py-2.5 text-sm font-medium text-[#182b48] outline-none transition focus:border-[#0875f5] focus:ring-2 focus:ring-[#0875f5]/20"
          >
            {quantities.map(qty => (
              <option key={qty} value={qty}>{qty.toLocaleString()} units</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-xs text-[#66758b]">Price per unit</p>
            <p className="text-2xl font-extrabold text-[#102748]">{formatInr(current.unitPrice)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-white p-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#46556d]">Total Cost</span>
          <span className="font-bold text-[#182b48]">{formatInr(current.total)}</span>
        </div>

        {current.discount > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#46556d]">Bulk Discount</span>
              <span className="flex items-center gap-1 font-bold text-green-600">
                <TrendingDown size={14} />
                {(current.discount * 100).toFixed(0)}% OFF
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#46556d]">You Save</span>
              <span className="font-bold text-green-600">{formatInr(current.savings)}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-[#fff7ed] p-3">
        <p className="text-xs leading-relaxed text-[#92400e]">
          <strong>💰 Volume Discounts:</strong> 50+ (5% off) · 100+ (10% off) · 250+ (15% off) · 500+ (20% off) · 1000+ (25% off)
        </p>
      </div>
    </div>
  );
}
