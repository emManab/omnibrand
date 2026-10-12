import { useState } from "react";
import { Filter, X, DollarSign, Star, TrendingUp, Sparkles } from "lucide-react";
import type { Product } from "@/types";

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterState {
  priceRange: [number, number];
  minRating: number;
  featured: boolean;
  trending: boolean;
  newArrivals: boolean;
}

export function AdvancedFilters({ onFilterChange, isOpen, onClose }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 5000],
    minRating: 0,
    featured: false,
    trending: false,
    newArrivals: false,
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 5000],
      minRating: 0,
      featured: false,
      trending: false,
      newArrivals: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#0875f5]" />
            <h2 className="text-lg font-extrabold text-[#182b48]">Advanced Filters</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#f5f7fa]">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#34445e]">
              <DollarSign size={16} />
              Price Range
            </div>
            <div className="mt-3 px-2">
              <div className="flex justify-between text-xs text-[#66758b]">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilters({ priceRange: [0, Number(e.target.value)] })}
                className="mt-2 w-full accent-[#0875f5]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#34445e]">
              <Star size={16} />
              Minimum Rating
            </div>
            <div className="mt-3 flex gap-2">
              {[0, 4.0, 4.5, 4.7, 4.9].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilters({ minRating: rating })}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    filters.minRating === rating
                      ? "bg-[#0875f5] text-white"
                      : "bg-[#f5f7fa] text-[#34445e] hover:bg-[#e6eaf2]"
                  }`}
                >
                  {rating === 0 ? "All" : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#34445e]">
              <TrendingUp size={16} />
              Product Tags
            </div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => updateFilters({ featured: e.target.checked })}
                  className="h-5 w-5 rounded border-[#d5dde8] text-[#0875f5] focus:ring-2 focus:ring-[#0875f5]/20"
                />
                <span className="text-sm text-[#34445e]">Featured Products</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.trending}
                  onChange={(e) => updateFilters({ trending: e.target.checked })}
                  className="h-5 w-5 rounded border-[#d5dde8] text-[#0875f5] focus:ring-2 focus:ring-[#0875f5]/20"
                />
                <span className="text-sm text-[#34445e]">Trending Now</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.newArrivals}
                  onChange={(e) => updateFilters({ newArrivals: e.target.checked })}
                  className="h-5 w-5 rounded border-[#d5dde8] text-[#0875f5] focus:ring-2 focus:ring-[#0875f5]/20"
                />
                <span className="flex items-center gap-1.5 text-sm text-[#34445e]">
                  <Sparkles size={14} className="text-[#0875f5]" />
                  New Arrivals
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={resetFilters}
            className="flex-1 rounded-lg border border-[#d5dde8] px-4 py-2.5 text-sm font-semibold text-[#34445e] transition hover:bg-[#f5f7fa]"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#0875f5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#075fd0]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    if (product.fromPrice < filters.priceRange[0] || product.fromPrice > filters.priceRange[1]) {
      return false;
    }

    if (filters.minRating > 0 && product.rating < filters.minRating) {
      return false;
    }

    if (filters.featured && !product.featured) {
      return false;
    }

    if (filters.trending && !product.trending) {
      return false;
    }

    if (filters.newArrivals && !product.newArrival) {
      return false;
    }

    return true;
  });
}
