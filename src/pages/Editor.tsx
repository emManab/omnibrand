import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DesignEditor } from "@/components/editor/DesignEditor";
import { getProduct } from "@/data/catalog";
import { priceFor } from "@/lib/pricing";
import { formatInr } from "@/lib/money";
import { useCart } from "@/store/cart";
import { supabaseEnabled } from "@/lib/supabase";
import { useProduct } from "@/lib/queries";

export function EditorPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { data: dbProduct, isLoading } = useProduct(slug);
  const staticProduct = getProduct(slug ?? "");
  const product = (supabaseEnabled ? dbProduct : null) ?? staticProduct;
  const add = useCart((s) => s.add);
  const navigate = useNavigate();

  const sizeId = params.get("size") ?? product?.sizes[0]?.id ?? "";
  const materialId = params.get("material") ?? product?.materials[0]?.id ?? "";
  const finishId = params.get("finish") ?? product?.finishes[0]?.id ?? "";
  const quantity = Number(params.get("qty") ?? product?.quantities[0] ?? 1);

  const quote = useMemo(() => {
    if (!product) return null;
    return priceFor(product, { quantity, sizeId, materialId, finishId });
  }, [product, quantity, sizeId, materialId, finishId]);

  if (supabaseEnabled && isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-3xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0875f5] border-t-transparent" />
      </div>
    );
  }

  if (!product || !quote) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>Choose a product first.</p>
        <Link to="/catalog" className="text-brand">
          Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <p className="text-sm text-muted">
        <Link to={`/product/${product.slug}`} className="hover:text-ink">
          {product.name}
        </Link>{" "}
        / Design studio
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Live product preview</h1>
        <p className="text-sm text-muted">
          {quote.size.label} · {quote.material.label} · {quantity} pcs · {formatInr(quote.lineTotal)}
        </p>
      </div>
      <div className="mt-6">
        <DesignEditor
          background={product.image}
          accent={product.accent}
          onExport={(png, json) => {
            add({
              id: crypto.randomUUID(),
              productId: product.id,
              name: `${product.name} (custom)`,
              image: png,
              quantity,
              size: quote.size.label,
              material: quote.material.label,
              finish: quote.finish.label,
              unitPrice: quote.unitPrice,
              lineTotal: quote.lineTotal,
              designDataUrl: png,
              designJson: json,
            });
            toast.success("Custom design added to cart");
            navigate("/cart");
          }}
        />
      </div>
    </div>
  );
}
