import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getProduct } from "@/data/catalog";
import { priceFor } from "@/lib/pricing";
import { formatInr } from "@/lib/money";
import { useCart } from "@/store/cart";
import { StarRow } from "@/components/StarRow";
import { ProductImage } from "@/components/ProductImage";
import { BulkPriceCalculator } from "@/components/BulkPriceCalculator";
import { ProductRecommendations, trackProductView } from "@/components/ProductRecommendations";
import { LiveChat } from "@/components/LiveChat";
import { supabaseEnabled } from "@/lib/supabase";
import { useProduct } from "@/lib/queries";

export function ProductPage() {
  const { slug } = useParams();
  const { data: dbProduct, isLoading } = useProduct(slug);
  const staticProduct = getProduct(slug ?? "");
  const product = (supabaseEnabled ? dbProduct : null) ?? staticProduct;
  const navigate = useNavigate();
  const add = useCart((s) => s.add);

  const [sizeId, setSizeId] = useState(product?.sizes[0]?.id ?? "");
  const [materialId, setMaterialId] = useState(product?.materials[0]?.id ?? "");
  const [finishId, setFinishId] = useState(product?.finishes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(product?.quantities[0] ?? 1);

  useEffect(() => {
    if (product) {
      setSizeId((prev) => (product.sizes.some((s) => s.id === prev) ? prev : product.sizes[0]?.id ?? ""));
      setMaterialId((prev) => (product.materials.some((m) => m.id === prev) ? prev : product.materials[0]?.id ?? ""));
      setFinishId((prev) => (product.finishes.some((f) => f.id === prev) ? prev : product.finishes[0]?.id ?? ""));
      setQuantity((prev) => (product.quantities.includes(prev) ? prev : product.quantities[0] ?? 1));
      trackProductView(product.id);
    }
  }, [product]);

  const quote = useMemo(() => {
    if (!product) return null;
    return priceFor(product, { quantity, sizeId, materialId, finishId });
  }, [product, quantity, sizeId, materialId, finishId]);

  if (supabaseEnabled && isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0875f5] border-t-transparent" />
      </div>
    );
  }

  if (!product || !quote) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p>That product is not in the catalogue.</p>
        <Link to="/catalog" className="mt-4 inline-block text-brand">
          Back to catalogue
        </Link>
      </div>
    );
  }

  function addPlain() {
    if (!product || !quote) return;
    add({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity,
      size: quote.size.label,
      material: quote.material.label,
      finish: quote.finish.label,
      unitPrice: quote.unitPrice,
      lineTotal: quote.lineTotal,
    });
    toast.success("Added to cart");
  }

  return (
    <>
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <div
        className="overflow-hidden rounded-3xl border border-line"
        style={{ background: product.accent }}
      >
        <ProductImage src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
      </div>
      <div>
        <p className="text-sm capitalize text-muted">{product.category.replace("-", " ")}</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <StarRow value={product.rating} />
          {product.rating} · {product.reviews.toLocaleString("en-IN")} reviews
        </div>
        <p className="mt-4 text-[15px] leading-7 text-muted">{product.description}</p>

        <Option label="Size" value={sizeId} onChange={setSizeId} options={product.sizes} />
        <Option label="Material" value={materialId} onChange={setMaterialId} options={product.materials} />
        <Option label="Finish" value={finishId} onChange={setFinishId} options={product.finishes} />

        <label className="mt-5 block text-sm font-medium">Quantity</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.quantities.map((n) => (
            <button
              key={n}
              onClick={() => setQuantity(n)}
              className={`rounded-full px-3 py-1.5 text-sm ${quantity === n ? "bg-navy text-white" : "bg-paper"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-paper p-5">
          <p className="text-sm text-muted">Price for this configuration</p>
          <p className="mt-1 text-3xl font-semibold">{formatInr(quote.lineTotal)}</p>
          <p className="text-sm text-muted">{formatInr(quote.unitPrice)} each · GST extra at checkout</p>
        </div>

        <div className="mt-5">
          <BulkPriceCalculator
            basePrice={product.fromPrice}
            quantities={product.quantities}
            productName={product.name}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() =>
              navigate(
                `/editor/${product.slug}?size=${sizeId}&material=${materialId}&finish=${finishId}&qty=${quantity}`,
              )
            }
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Customise & preview
          </button>
          <button
            onClick={addPlain}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-paper"
          >
            Add without design
          </button>
        </div>
      </div>
    </div>
    <ProductRecommendations currentProduct={product} title="Similar Products" />
    <LiveChat />
    </>
  );
}

function Option({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${value === o.id ? "bg-navy text-white" : "bg-paper"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
