import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/catalog";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";
import { Sparkles } from "lucide-react";

interface ProductRecommendationsProps {
  currentProduct?: Product;
  category?: string;
  title?: string;
}

export function ProductRecommendations({ currentProduct, category, title = "You might also like" }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const viewHistory = getViewHistory();
    const cartItems = getCartItems();

    let scored = products.map(p => {
      let score = 0;

      if (currentProduct && p.id === currentProduct.id) return { product: p, score: -1000 };

      if (currentProduct) {
        if (p.category === currentProduct.category) score += 50;
        const priceDiff = Math.abs(p.fromPrice - currentProduct.fromPrice);
        if (priceDiff < 200) score += 30;
        if (priceDiff < 100) score += 20;
      }

      if (category && p.category === category) score += 40;

      if (viewHistory.includes(p.id)) score += 15;
      if (cartItems.includes(p.id)) score -= 30;

      if (p.featured) score += 10;
      if (p.trending) score += 15;
      if (p.newArrival) score += 5;

      score += (p.rating - 4) * 10;

      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    setRecommendations(scored.slice(0, 6).map(s => s.product));
  }, [currentProduct, category]);

  if (recommendations.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#0875f5]" />
          <h2 className="text-base font-extrabold tracking-tight text-[#182b48] sm:text-lg">{title}</h2>
        </div>
        <Link to="/catalog" className="text-xs font-bold text-[#0875f5] hover:underline">View all →</Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {recommendations.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function getViewHistory(): string[] {
  try {
    const history = localStorage.getItem('product_views');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function getCartItems(): string[] {
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) return [];
    const parsed = JSON.parse(cart);
    return parsed.state?.items?.map((item: any) => item.productId) || [];
  } catch {
    return [];
  }
}

export function trackProductView(productId: string) {
  try {
    const history = getViewHistory();
    const updated = [productId, ...history.filter(id => id !== productId)].slice(0, 20);
    localStorage.setItem('product_views', JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}
