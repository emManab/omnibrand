import { X, Check, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatInr } from "@/lib/money";
import { Link } from "react-router-dom";

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
}

export function ProductComparison({ products, onClose }: ProductComparisonProps) {
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6eaf2] pb-4">
          <h2 className="text-xl font-extrabold text-[#182b48]">Compare Products</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#f5f7fa]">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-bold text-[#34445e]">Feature</th>
                {products.map((product) => (
                  <th key={product.id} className="p-3 text-center">
                    <div className="aspect-square w-24 overflow-hidden rounded-lg bg-[#f5f7fa]">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#182b48]">{product.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#edf0f5]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Starting Price</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm font-bold text-[#0875f5]">
                    {formatInr(product.fromPrice)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5] bg-[#f8fbff]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Rating</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm">
                    ⭐ {product.rating} ({product.reviews.toLocaleString()})
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Category</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm capitalize text-[#66758b]">
                    {product.category.replace("-", " ")}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5] bg-[#f8fbff]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Size Options</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-xs text-[#66758b]">
                    {product.sizes.length} options
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Material Options</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center text-xs text-[#66758b]">
                    {product.materials.length} options
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5] bg-[#f8fbff]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Featured</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.featured ? (
                      <Check size={18} className="mx-auto text-green-600" />
                    ) : (
                      <span className="text-[#b9c5d5]">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5]">
                <td className="p-3 text-sm font-semibold text-[#34445e]">Trending</td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.trending ? (
                      <Check size={18} className="mx-auto text-green-600" />
                    ) : (
                      <span className="text-[#b9c5d5]">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[#edf0f5] bg-[#f8fbff]">
                <td className="p-3"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <Link
                      to={`/product/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0875f5] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#075fd0]"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CompareToggle({ isComparing, onToggle }: { product: Product; isComparing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        isComparing
          ? "bg-[#0875f5] text-white"
          : "border border-[#d5dde8] text-[#34445e] hover:bg-[#f5f7fa]"
      }`}
    >
      {isComparing ? "✓ Comparing" : "Compare"}
    </button>
  );
}
