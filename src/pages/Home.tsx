import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Clock, Package, PenLine, Truck, ChevronRight, ChevronLeft, Star, Instagram, Linkedin, Youtube } from "lucide-react";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

const tabs = [
  { id: "all", label: "All" },
  { id: "business-cards", label: "Business Cards" },
  { id: "apparel", label: "Apparel" },
  { id: "stickers", label: "Stickers & Labels" },
  { id: "packaging", label: "Packaging" },
  { id: "marketing", label: "Marketing Materials" },
  { id: "gifts", label: "Gifts" },
];

const reviews = [
  { name: "Rohan Mehta", role: "Small Business Owner", text: "Amazing quality and super fast delivery! Our business cards turned out perfectly.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
  { name: "Priya Sharma", role: "Event Planner", text: "Loved the custom t-shirts for our event. Great print quality and easy ordering process.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" },
  { name: "Arjun Verma", role: "Entrepreneur", text: "Best place for custom printing. The packaging boxes were exactly what we needed.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
];

export function Home() {
  const [tab, setTab] = useState("all");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const popular = products.filter((p) => p.featured);
  const shown = tab === "all" ? popular : products.filter((p) => p.category === tab);
  const trending = products.filter((p) => p.trending);
  const arrivals = products.filter((p) => p.newArrival);
  function subscribe(e: FormEvent) { e.preventDefault(); if (email.includes("@")) setJoined(true); }

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-7">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#dceeff] via-[#c5e0ff] to-[#9fc9ff]">
          <div className="absolute -right-12 top-0 -z-10 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <div className="grid min-h-[260px] items-center gap-2 px-5 py-5 sm:min-h-[300px] sm:px-8 lg:min-h-[390px] lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#24466f] sm:text-[11px]">Custom printing for every idea</p>
              <h1 className="mt-2 max-w-lg text-[2rem] font-extrabold leading-[0.96] tracking-tight text-[#10284c] sm:text-4xl lg:text-[3.15rem]">Design it.<br/>Print it.<br/>Make it yours.</h1>
              <p className="mt-3 max-w-sm text-[11px] leading-5 text-[#24466f] sm:text-sm sm:leading-6">High quality custom products for your business, events and everyday moments.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-[#0875f5] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#075fd0] sm:text-xs">Shop All Products <span aria-hidden="true">→</span></Link>
              </div>
              <div className="mt-5 hidden flex-wrap gap-x-4 gap-y-2 text-[9px] font-semibold text-[#24466f] sm:flex lg:mt-7">
                <span className="inline-flex items-center gap-1"><BadgeCheck size={12}/> High Quality Printing</span>
                <span className="inline-flex items-center gap-1"><Truck size={12}/> Fast & Reliable Delivery</span>
                <span className="inline-flex items-center gap-1"><PenLine size={12}/> Design Online in Minutes</span>
              </div>
            </div>
            <div className="relative mx-auto h-[200px] w-full max-w-[600px] sm:h-[270px] lg:h-[350px]">
              <div className="absolute bottom-0 left-[8%] h-[70%] w-[76%] rounded-[40%] bg-white/35 blur-2xl"/>
              <ProductImage src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=90" alt="Custom hoodie" className="absolute left-[22%] top-[2%] h-[82%] w-[45%] rounded-xl object-cover object-center shadow-xl ring-4 ring-white/60 sm:rounded-2xl"/>
              <ProductImage src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=90" alt="Custom water bottle" className="absolute bottom-[3%] left-[1%] h-[44%] w-[25%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <ProductImage src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=90" alt="Custom cap" className="absolute bottom-[2%] right-[8%] h-[42%] w-[32%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <ProductImage src="https://images.unsplash.com/photo-1597484661643-2d57e7a3aca6?auto=format&fit=crop&w=500&q=90" alt="Canvas tote bag" className="absolute right-[0%] top-[3%] h-[43%] w-[27%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <div className="absolute left-[37%] top-[29%] rotate-[-3deg] rounded-md border-2 border-dashed border-[#0875f5] bg-white/90 px-3 py-2 text-center text-[10px] font-extrabold leading-tight text-[#10284c] shadow-lg sm:px-4 sm:py-3 sm:text-xs">Your<br/>Design<br/>Here</div>
              <div className="absolute bottom-0 left-[34%] rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-bold text-[#10284c] shadow-lg">Made for your brand ✦</div>
            </div>
          </div>
          <button aria-label="Previous featured slide" className="absolute left-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-600 shadow sm:left-2"><ChevronLeft size={16}/></button>
          <button aria-label="Next featured slide" className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-600 shadow sm:right-2"><ChevronRight size={16}/></button>
        </div>
        <div className="flex items-center justify-center gap-1.5 py-3" aria-label="Featured collection"><span className="h-1.5 w-1.5 rounded-full bg-[#10284c]"/>{[1,2,3,4].map(n=><span key={n} className="h-1.5 w-1.5 rounded-full bg-[#d5dce8]"/>)}</div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
        <SectionHeading title="Shop by Category" to="/catalog"/>
        <div className="category-strip mt-3 flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => <Link key={c.name} to={`/catalog?category=${c.slug}`} className="group w-[78px] shrink-0 text-center sm:w-[100px]">
            <div className="aspect-square overflow-hidden rounded-xl bg-[#f3f5f8]"><ProductImage src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105"/></div>
            <p className="mt-1.5 text-[9px] font-semibold leading-3 text-[#24334d] sm:text-[10px]">{c.name}</p>
          </Link>)}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:px-7">
        <Promo title="Make a lasting first impression" kicker="Business Cards" to="/catalog?category=business-cards" cta="Shop Business Cards" image="https://images.unsplash.com/photo-1623305465231-d884ce752d59?auto=format&fit=crop&w=900&q=85" tone="from-[#fff0e7] to-[#ffdfcf]"/>
        <Promo title="Wear your brand proudly" kicker="Custom Apparel" to="/catalog?category=apparel" cta="Shop Apparel" image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85" tone="from-[#e6f9dc] to-[#c9f1b9]"/>
      </section>

      <ProductRail title="Popular Products" items={shown} tabs={tabs} tab={tab} onTab={setTab} to="/catalog"/>
      <ProductRail title="Trending Now" items={trending} to="/catalog"/>

      <section className="mx-auto grid max-w-[1440px] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:px-7">
        <Promo title="Small Details. Big Impact." kicker="Stickers & Labels" to="/catalog?category=stickers" cta="Shop Stickers" image="https://images.unsplash.com/photo-1621252756235-7f37e5e5125e?auto=format&fit=crop&w=900&q=85" tone="from-[#102748] to-[#183c69]" dark/>
        <Promo title="Custom Packaging for Your Brand" kicker="Packaging & Boxes" to="/catalog?category=packaging" cta="Shop Packaging" image="https://images.unsplash.com/photo-1771848194269-2e3b89b6465b?auto=format&fit=crop&w=900&q=85" tone="from-[#f0f3fa] to-[#e4eafa]"/>
      </section>

      <ProductRail title="New Arrivals" items={arrivals} to="/catalog"/>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
        <div className="grid gap-3 rounded-2xl bg-[#f3f7ff] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
          {[
            { icon: PenLine, t: "Easy Online Design", d: "Create with ready templates or upload your own design." },
            { icon: Truck, t: "Fast Delivery", d: "Reliable shipping across India." },
            { icon: BadgeCheck, t: "High Quality Print", d: "Vibrant and durable prints." },
            { icon: Package, t: "No Minimum Orders", d: "Order just what you need." },
          ].map((f) => <div key={f.t} className="flex items-center gap-3 rounded-xl px-2 py-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d8eaff] text-[#0875f5]"><f.icon size={18}/></span><div><p className="text-[11px] font-bold text-[#162d50]">{f.t}</p><p className="mt-1 text-[10px] leading-4 text-[#667995]">{f.d}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7">
        <SectionHeading title="Trusted by Businesses and Creators" to="/help" linkLabel="See All Reviews"/>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {reviews.map((r) => <blockquote key={r.name} className="rounded-xl border border-[#e6eaf2] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5"><img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" loading="lazy"/><div><p className="text-[11px] font-bold text-[#182b48]">{r.name}</p><p className="text-[9px] text-muted">{r.role}</p></div></div>
            <div className="mt-2 flex gap-0.5 text-[#ffad0a]" aria-label="5 out of 5 stars">{[1,2,3,4,5].map(n=><Star key={n} size={11} fill="currentColor" strokeWidth={0}/>)}</div>
            <p className="mt-2 text-[10px] leading-4 text-[#46556d]">{r.text}</p>
          </blockquote>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
        <div className="overflow-hidden rounded-2xl bg-[#0c1d3c] px-5 py-6 text-white sm:px-8 sm:py-7">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]"><div><h2 className="text-lg font-extrabold sm:text-xl">Get Inspired and Get 10% Off</h2><p className="mt-1 text-[10px] text-white/70 sm:text-xs">Subscribe to our newsletter for exclusive offers, new products and design tips.</p></div>
          {joined ? <p className="text-sm font-semibold">You’re on the list. Thanks for subscribing!</p> : <form onSubmit={subscribe} className="flex w-full gap-1.5 sm:w-[360px]"><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="Enter your email address" className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2.5 text-[10px] text-[#14284b] outline-none placeholder:text-slate-400"/><button className="rounded-lg bg-[#0875f5] px-4 py-2.5 text-[10px] font-bold text-white hover:bg-[#075fd0]">Subscribe</button></form>}</div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({title,to,linkLabel="View All"}:{title:string;to:string;linkLabel?:string}) {
  return <div className="flex items-center justify-between gap-3"><h2 className="text-base font-extrabold tracking-tight text-[#182b48] sm:text-lg">{title}</h2><Link to={to} className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#0875f5] sm:text-xs">{linkLabel} <span aria-hidden="true">→</span></Link></div>;
}

function Promo({title,kicker,to,cta,image,tone,dark}:{title:string;kicker:string;to:string;cta:string;image:string;tone:string;dark?:boolean}) {
  return <Link to={to} className={`grid min-h-[150px] overflow-hidden rounded-xl bg-gradient-to-br ${tone} sm:min-h-[175px] sm:grid-cols-[1fr_0.95fr]`}>
    <div className={`flex flex-col items-start justify-center p-4 sm:p-5 lg:p-6 ${dark?"text-white": "text-[#162d50]"}`}><p className={`text-[9px] font-bold uppercase tracking-wide ${dark?"text-white/70":"text-[#52657e]"}`}>{kicker}</p><h3 className="mt-1.5 max-w-[240px] text-lg font-extrabold leading-[1.05] tracking-tight sm:text-xl">{title}</h3><span className={`mt-3 inline-flex rounded-lg px-3 py-2 text-[9px] font-bold ${dark?"bg-white text-[#102748]":"bg-[#0875f5] text-white"}`}>{cta} <span className="ml-1">→</span></span></div>
    <ProductImage src={image} alt="" className="h-full min-h-[150px] w-full object-cover sm:min-h-0"/>
  </Link>;
}

function ProductRail({title,items,tabs:railTabs,tab,onTab,to}:{title:string;items:typeof products;tabs?:{id:string;label:string}[];tab?:string;onTab?:(id:string)=>void;to:string}) {
  return <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
    <SectionHeading title={title} to={to}/>
    {railTabs&&onTab&&<div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">{railTabs.map(t=><button key={t.id} onClick={()=>onTab(t.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold sm:text-[10px] ${tab===t.id?"bg-[#102748] text-white":"bg-[#f1f4f9] text-[#56657a] hover:bg-[#e6edf8]"}`}>{t.label}</button>)}</div>}
    <div className="product-rail mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">{items.slice(0,6).map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>;
}
