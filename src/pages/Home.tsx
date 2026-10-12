import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock,
  Package,
  PenLine,
  Truck,
} from "lucide-react";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { StarRow } from "@/components/StarRow";
import { ProductImage } from "@/components/ProductImage";

const tabs = [
  { id: "all", label: "All" },
  { id: "business-cards", label: "Business Cards" },
  { id: "apparel", label: "Apparel" },
  { id: "stickers", label: "Stickers & Labels" },
  { id: "packaging", label: "Packaging" },
  { id: "marketing", label: "Marketing Materials" },
];

const reviews = [
  {
    name: "Rohan Mehta",
    role: "Founder, Northlight",
    text: "Cards arrived two days early and the silk stock felt like a studio sample, not a bulk run.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Producer, Atelier Events",
    text: "We ordered 400 tees for a festival. Colour held, sizes ran true, and the editor was actually usable.",
    rating: 5,
  },
  {
    name: "Arjun Verma",
    role: "Brand lead, Kite Labs",
    text: "Mailer boxes made our unboxing look expensive. Print on the inside flap was registered perfectly.",
    rating: 5,
  },
];

export function Home() {
  const [tab, setTab] = useState("all");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const popular = products.filter((p) => p.featured);
  const shown = tab === "all" ? popular : popular.filter((p) => p.category === tab);
  const trending = products.filter((p) => p.trending);
  const arrivals = products.filter((p) => p.newArrival);

  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setJoined(true);
  }

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-5 lg:px-6">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#d8eaff] via-[#c4ddff] to-[#a8ceff]">
          <div className="absolute -right-12 top-0 -z-10 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
          <div className="grid min-h-[410px] items-center gap-4 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-10">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#24466f] sm:text-xs">Custom printing for every idea</p>
              <h1 className="mt-3 max-w-lg text-4xl font-extrabold leading-[0.98] tracking-tight text-[#10284c] sm:text-5xl lg:text-[3.6rem]">
                Design it.<br />Print it.<br />Make it yours.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#24466f] sm:text-base sm:leading-7">
                Bring your brand to life with custom products, standout merch and packaging made for your next big idea.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-[#0875f5] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#075fd0]">
                  Shop all products <span aria-hidden="true">→</span>
                </Link>
                <Link to="/catalog" className="rounded-xl border border-white/80 bg-white/75 px-5 py-3 text-sm font-bold text-[#10284c] hover:bg-white">Start designing</Link>
              </div>
              <div className="mt-8 hidden flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-[#24466f] sm:flex">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15}/> High quality printing</span>
                <span className="inline-flex items-center gap-1.5"><Truck size={15}/> Fast, reliable delivery</span>
                <span className="inline-flex items-center gap-1.5"><PenLine size={15}/> Easy online design</span>
              </div>
            </div>
            <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[360px] lg:h-[390px]">
              <div className="absolute bottom-0 left-[8%] h-[70%] w-[76%] rounded-[40%] bg-white/25 blur-2xl" />
              <ProductImage src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85" alt="Custom printed hoodie" className="absolute left-[23%] top-[3%] h-[77%] w-[43%] rounded-2xl object-cover shadow-2xl ring-4 ring-white/60 sm:rounded-3xl" />
              <ProductImage src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=85" alt="Custom drink bottle" className="absolute bottom-[2%] left-[2%] h-[47%] w-[24%] rounded-2xl object-cover shadow-xl ring-4 ring-white/70" />
              <ProductImage src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=85" alt="Branded cap" className="absolute bottom-[2%] right-[6%] h-[42%] w-[34%] rounded-2xl object-cover shadow-xl ring-4 ring-white/70" />
              <ProductImage src="https://images.unsplash.com/photo-1597484661643-2d57e7a3aca6?auto=format&fit=crop&w=600&q=85" alt="Reusable tote bag" className="absolute right-[0%] top-[3%] h-[45%] w-[27%] rounded-2xl object-cover shadow-xl ring-4 ring-white/70" />
              <div className="absolute left-[38%] top-[31%] rotate-[-3deg] rounded-lg border-2 border-dashed border-[#0875f5] bg-white/90 px-4 py-3 text-center text-xs font-extrabold leading-tight text-[#10284c] shadow-lg sm:px-5 sm:py-4 sm:text-sm">Your<br/>Design<br/>Here</div>
              <div className="absolute bottom-0 left-[34%] rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-[#10284c] shadow-lg sm:text-xs">Made for your brand ✦</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 py-4" aria-label="Featured collection">
          <span className="h-2 w-2 rounded-full bg-[#10284c]" /><span className="h-2 w-2 rounded-full bg-[#d5dce8]" /><span className="h-2 w-2 rounded-full bg-[#d5dce8]" /><span className="h-2 w-2 rounded-full bg-[#d5dce8]" /><span className="h-2 w-2 rounded-full bg-[#d5dce8]" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <Link to="/catalog" className="text-sm font-medium text-brand">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link key={c.name} to={`/catalog?category=${c.slug}`} className="group text-center">
              <div className="aspect-square overflow-hidden rounded-2xl bg-paper">
                <ProductImage
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-sm font-medium">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 lg:grid-cols-2 lg:px-6">
        <Promo
          title="Make a lasting first impression"
          kicker="Business cards"
          to="/catalog?category=business-cards"
          cta="Shop business cards"
          image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80"
          tone="from-[#ecfdf3] to-[#d1fae5]"
        />
        <Promo
          title="Wear your brand proudly"
          kicker="Custom T-shirts"
          to="/catalog?category=apparel"
          cta="Shop apparel"
          image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
          tone="from-[#e0f2fe] to-[#bae6fd]"
        />
      </section>

      <ProductRail
        title="Popular products"
        items={shown}
        tabs={tabs}
        tab={tab}
        onTab={setTab}
        to="/catalog"
      />

      <ProductRail title="Trending now" items={trending} to="/catalog" />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-2 lg:px-6">
        <Promo
          title="Small details. Big impact."
          kicker="Stickers & labels"
          to="/catalog?category=stickers"
          cta="Shop stickers"
          image="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=80"
          tone="from-[#0b1b3a] to-[#16356e]"
          dark
        />
        <Promo
          title="Custom packaging for your brand"
          kicker="Packaging & boxes"
          to="/catalog?category=packaging"
          cta="Shop packaging"
          image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b6da?auto=format&fit=crop&w=900&q=80"
          tone="from-[#fff7ed] to-[#ffedd5]"
        />
      </section>

      <ProductRail title="New arrivals" items={arrivals} to="/catalog" />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {[
          { icon: PenLine, t: "Easy online design", d: "Upload a logo, set type, and preview on the product." },
          { icon: Truck, t: "Fast delivery", d: "Metro India in 3–5 days on most stationery runs." },
          { icon: BadgeCheck, t: "High quality print", d: "Calibrated colour, real paper stocks, honest proofs." },
          { icon: Package, t: "No minimum on merch", d: "Order one hoodie or two thousand cards." },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl border border-line bg-paper px-5 py-6">
            <f.icon className="text-brand" size={22} />
            <p className="mt-3 font-semibold">{f.t}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-paper py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Trusted by businesses and creators</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote key={r.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
                <StarRow value={r.rating} />
                <p className="mt-3 text-sm leading-6">{r.text}</p>
                <p className="mt-4 text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.role}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white sm:px-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-semibold">Get inspired and get 10% off</h2>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Subscribe for restocks, paper launches, new products and design tips. First-order code in the
                welcome mail.
              </p>
            </div>
            {joined ? (
              <p className="flex items-center gap-2 text-sm">
                <Clock size={16} /> You’re on the list.
              </p>
            ) : (
              <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="Work email"
                  className="w-full rounded-full bg-white/10 px-4 py-2.5 text-sm outline-none ring-1 ring-white/20 placeholder:text-white/50"
                />
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Promo({
  title,
  kicker,
  to,
  cta,
  image,
  tone,
  dark,
}: {
  title: string;
  kicker: string;
  to: string;
  cta: string;
  image: string;
  tone: string;
  dark?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`grid overflow-hidden rounded-3xl bg-gradient-to-br ${tone} sm:grid-cols-2`}
    >
      <div className={`flex flex-col justify-center p-8 ${dark ? "text-white" : ""}`}>
        <p className={`text-xs font-semibold ${dark ? "text-white/70" : "text-muted"}`}>{kicker}</p>
        <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{title}</h3>
        <span className={`mt-5 inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${dark ? "bg-white text-navy" : "bg-navy text-white"}`}>
          {cta}
        </span>
      </div>
      <ProductImage src={image} alt="" className="h-56 w-full object-cover sm:h-full" />
    </Link>
  );
}

function ProductRail({
  title,
  items,
  tabs: railTabs,
  tab,
  onTab,
  to,
}: {
  title: string;
  items: typeof products;
  tabs?: { id: string; label: string }[];
  tab?: string;
  onTab?: (id: string) => void;
  to: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link to={to} className="text-sm font-medium text-brand">
          View all
        </Link>
      </div>
      {railTabs && onTab && (
        <div className="mt-4 flex flex-wrap gap-2">
          {railTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${tab === t.id ? "bg-navy text-white" : "bg-paper text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        {items.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
