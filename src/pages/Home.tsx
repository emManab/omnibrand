import { FormEvent, useState } from "react";
import { MobileHome } from "@/components/MobileHome";
import { Link } from "react-router-dom";
import { BadgeCheck, Truck, PenLine, ChevronRight, ChevronLeft, Play, ArrowRight } from "lucide-react";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { storefrontImages } from "@/data/storefrontImages";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { QuickReorder } from "@/components/QuickReorder";
import { LiveChat } from "@/components/LiveChat";

const tabs = [
  { id: "all", label: "All" },
  { id: "business-cards", label: "Business Cards" },
  { id: "apparel", label: "Apparel" },
  { id: "stickers", label: "Stickers & Labels" },
  { id: "packaging", label: "Packaging" },
  { id: "marketing", label: "Marketing Materials" },
  { id: "gifts", label: "Gifts" },
];

const heroSlides = [
  { eyebrow: "Custom printing for every idea", title: <>Design it.<br/>Print it.<br/>Make it yours.</>, description: "High quality custom products for your business, events and everyday moments.", cta: "Shop All Products", to: "/catalog", hoodie: "photo-1620799140188-3b2a02fd9a77", bottle: "photo-1602143407151-7111542de6e8", cap: "photo-1588850561407-ed78c282e89b", extra: "photo-1521572163474-6864f9cf17ab", label: "Made for your brand ✦" },
  { eyebrow: "Your brand, front and center", title: <>Wear your<br/>brand with<br/>confidence.</>, description: "Create custom t-shirts, hoodies and everyday apparel that stand out.", cta: "Shop Custom Apparel", to: "/catalog?category=apparel", hoodie: "photo-1521572163474-6864f9cf17ab", bottle: "photo-1556821840-3a63f95609a7", cap: "photo-1588850561407-ed78c282e89b", extra: "photo-1620799140188-3b2a02fd9a77", label: "Made to be worn ✦" },
  { eyebrow: "Make every first impression count", title: <>Big ideas.<br/>Beautiful<br/>business cards.</>, description: "Give your business a polished look with premium print essentials.", cta: "Shop Business Cards", to: "/catalog?category=business-cards", hoodie: "photo-1623305465231-d884ce752d59", bottle: "photo-1586281380349-632531db7ed4", cap: "photo-1544816155-12df9643f363", extra: "photo-1597484661643-2d57e7a3aca6", label: "Details make the difference ✦" },
  { eyebrow: "Packaging that feels like you", title: <>Unbox your<br/>brand's next<br/>big moment.</>, description: "Custom packaging and labels that make every delivery memorable.", cta: "Explore Packaging", to: "/catalog?category=packaging", hoodie: "photo-1607082349566-187342175e2f", bottle: "photo-1622560480654-d96214fdc887", cap: "photo-1602143407151-7111542de6e8", extra: "photo-1771848194269-2e3b89b6465b", label: "Packed with personality ✦" },
  { eyebrow: "Small details. Big impact.", title: <>Make it<br/>personal.<br/>Make it pop.</>, description: "From stickers to drinkware, turn everyday products into your own.", cta: "Explore All Products", to: "/catalog", hoodie: "photo-1621252756235-7f37e5e5125e", bottle: "photo-1602143407151-7111542de6e8", cap: "photo-1597484661643-2d57e7a3aca6", extra: "photo-1588850561407-ed78c282e89b", label: "Your idea, your style ✦" },
];

const creatorVideos = [
  { handle: "@printlybusiness", category: "Business Cards", title: "First look at our new business cards", duration: "0:32", image: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=720&q=85", query: "custom business card unboxing", to: "/catalog?category=business-cards" },
  { handle: "@smallbrandstudio", category: "Stickers & Labels", title: "Sticker order reveal", duration: "0:28", image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=720&q=85", query: "custom sticker unboxing", to: "/catalog?category=stickers" },
  { handle: "@thebrandmaker", category: "Packaging & Boxes", title: "Packaging that feels on-brand", duration: "0:45", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=720&q=85", query: "custom packaging unboxing small business", to: "/catalog?category=packaging" },
  { handle: "@wearyourbrand", category: "Custom Apparel", title: "Custom apparel reveal", duration: "0:31", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=85", query: "custom printed t shirt unboxing", to: "/catalog?category=apparel" },
  { handle: "@everydaycreative", category: "Office Stationery", title: "A fresh stationery setup", duration: "0:37", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=720&q=85", query: "custom printed stationery unboxing", to: "/catalog?category=stationery" },
];

export function Home() {
  const [tab, setTab] = useState("all");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const hero = heroSlides[heroIndex];
  const moveHero = (direction: number) => setHeroIndex((current) => (current + direction + heroSlides.length) % heroSlides.length);
  const popular = products.filter((p) => p.featured);
  const shown = tab === "all" ? popular : products.filter((p) => p.category === tab);
  const trending = products.filter((p) => p.trending);
  const arrivals = products.filter((p) => p.newArrival);
  function subscribe(e: FormEvent) { e.preventDefault(); if (email.includes("@")) setJoined(true); }

  return (
    <>
    <MobileHome />
    <div className="hidden bg-white md:block">
      <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-7">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#dceeff] via-[#c5e0ff] to-[#9fc9ff]">
          <div className="absolute -right-12 top-0 -z-10 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <div className="grid min-h-[260px] items-center gap-2 px-5 py-5 sm:min-h-[300px] sm:px-8 lg:min-h-[390px] lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
            <div className="relative z-10">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#24466f] sm:text-[0.8125rem]">{hero.eyebrow}</p>
              <h1 className="mt-2 max-w-lg text-[2rem] font-extrabold leading-[0.96] tracking-tight text-[#10284c] sm:text-4xl lg:text-[3.15rem]">{hero.title}</h1>
              <p className="mt-3 max-w-sm text-[0.8125rem] leading-5 text-[#24466f] sm:text-sm sm:leading-6">{hero.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={hero.to} className="inline-flex items-center gap-2 rounded-lg bg-[#0875f5] px-4 py-2.5 text-[0.8125rem] font-bold text-white shadow-sm transition hover:bg-[#075fd0] sm:text-xs">{hero.cta} <span aria-hidden="true">→</span></Link>
              </div>
              <div className="mt-5 hidden flex-wrap gap-x-4 gap-y-2 text-[0.6875rem] font-semibold text-[#24466f] sm:flex lg:mt-7">
                <span className="inline-flex items-center gap-1"><BadgeCheck size={12}/> High Quality Printing</span>
                <span className="inline-flex items-center gap-1"><Truck size={12}/> Fast & Reliable Delivery</span>
                <span className="inline-flex items-center gap-1"><PenLine size={12}/> Design Online in Minutes</span>
              </div>
            </div>
            <div className="relative mx-auto h-[200px] w-full max-w-[600px] sm:h-[270px] lg:h-[350px]">
              <div className="absolute bottom-0 left-[8%] h-[70%] w-[76%] rounded-[40%] bg-white/35 blur-2xl"/>
              <ProductImage src={`https://images.unsplash.com/${hero.hoodie}?auto=format&fit=crop&w=900&q=90`} alt="Custom hoodie" className="absolute left-[22%] top-[2%] h-[82%] w-[45%] rounded-xl object-cover object-center shadow-xl ring-4 ring-white/60 sm:rounded-2xl"/>
              <ProductImage src={`https://images.unsplash.com/${hero.bottle}?auto=format&fit=crop&w=500&q=90`} alt="Custom water bottle" className="absolute bottom-[3%] left-[1%] h-[44%] w-[25%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <ProductImage src={`https://images.unsplash.com/${hero.cap}?auto=format&fit=crop&w=500&q=90`} alt="Custom cap" className="absolute bottom-[2%] right-[8%] h-[42%] w-[32%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <ProductImage src={`https://images.unsplash.com/${hero.extra}?auto=format&fit=crop&w=500&q=90`} alt="Canvas tote bag" className="absolute right-[0%] top-[3%] h-[43%] w-[27%] rounded-xl object-cover shadow-lg ring-4 ring-white/70"/>
              <div className="absolute left-[37%] top-[29%] rotate-[-3deg] rounded-md border-2 border-dashed border-[#0875f5] bg-white/90 px-3 py-2 text-center text-[0.75rem] font-extrabold leading-tight text-[#10284c] shadow-lg sm:px-4 sm:py-3 sm:text-xs">Your<br/>Design<br/>Here</div>
              <div className="absolute bottom-0 left-[34%] rounded-lg bg-white px-2.5 py-1.5 text-[0.6875rem] font-bold text-[#10284c] shadow-lg">{hero.label}</div>
            </div>
          </div>
          <button type="button" aria-label="Previous featured slide" onClick={() => moveHero(-1)} className="absolute left-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-600 shadow transition hover:scale-105 hover:text-[#0875f5] sm:left-2"><ChevronLeft size={20}/></button>
          <button type="button" aria-label="Next featured slide" onClick={() => moveHero(1)} className="absolute right-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-600 shadow transition hover:scale-105 hover:text-[#0875f5] sm:right-2"><ChevronRight size={20}/></button>
        </div>
        <div className="flex items-center justify-center gap-2 py-3" aria-label="Featured collection">{heroSlides.map((item, index) => <button key={item.eyebrow} type="button" onClick={() => setHeroIndex(index)} aria-label={`Show featured slide ${index + 1}`} aria-current={heroIndex === index ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${heroIndex === index ? "w-2.5 bg-[#10284c]" : "w-2.5 bg-[#d5dce8] hover:bg-[#91a3bd]"}`} />)}</div>
      </section>

      <section className="w-full px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold tracking-tight text-[#182b48] sm:text-lg">Shop by Category</h2>
        </div>
        <div className="category-strip relative mt-3">
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 lg:grid-cols-9 lg:gap-x-3">
            {categories.map((c) => <Link key={c.name} to={`/catalog?category=${c.slug}`} className="group min-w-0 text-center">
              <div className="aspect-square overflow-hidden rounded-xl bg-[#f3f5f8] ring-1 ring-black/[0.025]">
                <ProductImage src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"/>
              </div>
              <p className="mx-auto mt-2 max-w-[125px] text-[0.6875rem] font-semibold leading-[1.2] text-[#182b48] sm:text-[0.75rem]">{c.name}</p>
            </Link>)}
          </div>
          <button type="button" aria-label="Browse categories" onClick={() => document.querySelector('.category-strip')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })} className="absolute -right-3 top-[34%] z-10 grid h-9 w-9 place-items-center rounded-full border border-[#edf0f5] bg-white text-[#102748] shadow-md transition hover:shadow-lg lg:hidden"><ChevronRight size={19}/></button>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:px-7">
        <Promo title="Make a lasting first impression" kicker="Business Cards" to="/catalog?category=business-cards" cta="Shop Business Cards" image={storefrontImages.promos.businessCards} tone="from-[#fff0e7] to-[#ffdfcf]"/>
        <Promo title="Wear your brand proudly" kicker="Custom Apparel" to="/catalog?category=apparel" cta="Shop Apparel" image={storefrontImages.promos.customApparel} tone="from-[#e6f9dc] to-[#c9f1b9]"/>
      </section>

      <QuickReorder />
      <ProductRail title="Popular Products" items={shown} tabs={tabs} tab={tab} onTab={setTab} to="/catalog"/>
      <ProductRecommendations title="Recommended for You" />
      <ProductRail title="Trending Now" items={trending} to="/catalog"/>

      <section className="mx-auto grid max-w-[1440px] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:px-7">
        <Promo title="Small Details. Big Impact." kicker="Stickers & Labels" to="/catalog?category=stickers" cta="Shop Stickers" image={storefrontImages.promos.stickers} tone="from-[#102748] to-[#183c69]" dark/>
        <Promo title="Custom Packaging for Your Brand" kicker="Packaging & Boxes" to="/catalog?category=packaging" cta="Shop Packaging" image={storefrontImages.promos.packaging} tone="from-[#f0f3fa] to-[#e4eafa]"/>
      </section>

      <ProductRail title="New Arrivals" items={arrivals} to="/catalog"/>

      <section className="creator-video-section mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.2em] text-[#0875f5] sm:text-xs">From our creators</p><h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#102748] sm:text-3xl lg:text-[2.5rem]">Real businesses. <span className="text-[#0875f5]">Real unboxings.</span></h2><p className="mt-2 text-sm text-[#66758b] sm:text-base">See ideas come to life with custom print products.</p></div>
          <a href="https://www.youtube.com/results?search_query=custom+printing+unboxing+small+business" target="_blank" rel="noreferrer" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-[#0875f5] transition hover:gap-3">View videos <ArrowRight size={17}/></a>
        </div>
        <div className="creator-video-rail mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {creatorVideos.map((video) => <article key={video.handle} className="group min-w-0 overflow-hidden rounded-2xl border border-[#e8edf5] bg-white shadow-[0_5px_22px_rgba(22,48,82,.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(22,48,82,.12)]">
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}`} target="_blank" rel="noreferrer" aria-label={`Find videos: ${video.title}`} className="relative block aspect-[4/5] overflow-hidden bg-[#edf2f8]">
              <img src={video.image} alt={video.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"/>
              <span className="absolute right-3 top-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">{video.duration}</span>
              <span className="absolute inset-0 grid place-items-center bg-[#0b1d36]/0 transition group-hover:bg-[#0b1d36]/15"><span className="grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition group-hover:scale-110"><Play size={23} fill="currentColor" className="ml-1"/></span></span>
            </a>
            <div className="p-3.5 sm:p-4">
              <p className="truncate text-sm font-bold text-[#102748]">{video.handle}</p><p className="mt-0.5 text-xs text-[#66758b]">{video.category}</p>
              <Link to={video.to} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0875f5] hover:gap-3">Shop this product <ArrowRight size={16}/></Link>
            </div>
          </article>)}
        </div>
        <p className="mt-3 text-[0.6875rem] text-[#8995a7]">Explore creator videos from across the web. Video thumbnails are illustrative; featured links open relevant video searches.</p>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
        <div className="overflow-hidden rounded-2xl bg-[#0c1d3c] px-5 py-6 text-white sm:px-8 sm:py-7">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]"><div><h2 className="text-lg font-extrabold sm:text-xl">Get Inspired and Get 10% Off</h2><p className="mt-1 text-[0.75rem] text-white/70 sm:text-xs">Subscribe to our newsletter for exclusive offers, new products and design tips.</p></div>
          {joined ? <p className="text-sm font-semibold">You’re on the list. Thanks for subscribing!</p> : <form onSubmit={subscribe} className="flex w-full gap-1.5 sm:w-[360px]"><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="Enter your email address" className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2.5 text-[0.75rem] text-[#14284b] outline-none placeholder:text-slate-400"/><button className="rounded-lg bg-[#0875f5] px-4 py-2.5 text-[0.75rem] font-bold text-white hover:bg-[#075fd0]">Subscribe</button></form>}</div>
        </div>
      </section>
      <LiveChat />
    </div>
    </>
  );
}

function SectionHeading({title,to,linkLabel="View All"}:{title:string;to:string;linkLabel?:string}) {
  return <div className="flex items-center justify-between gap-3"><h2 className="text-base font-extrabold tracking-tight text-[#182b48] sm:text-lg">{title}</h2><Link to={to} className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-bold text-[#0875f5] sm:text-xs">{linkLabel} <span aria-hidden="true">→</span></Link></div>;
}

function Promo({title,kicker,to,cta,image,tone,dark}:{title:string;kicker:string;to:string;cta:string;image:string;tone:string;dark?:boolean}) {
  return <Link to={to} className={`group relative isolate grid min-h-[220px] overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br ${tone} shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-[245px] sm:grid-cols-[0.92fr_1.08fr]`}>
    <div className={`relative z-10 flex flex-col items-start justify-center p-5 sm:p-6 lg:p-7 ${dark?"text-white": "text-[#162d50]"}`}><p className={`text-[0.65rem] font-extrabold uppercase tracking-[0.16em] ${dark?"text-white/75":"text-[#52657e]"}`}>{kicker}</p><h3 className="mt-2 max-w-[250px] text-xl font-extrabold leading-[1.04] tracking-tight sm:text-2xl">{title}</h3><p className={`mt-2 max-w-[230px] text-xs leading-5 ${dark?"text-white/75":"text-[#52657e]"}`}>{kicker === "Business Cards" ? "Premium finishes. A memorable first impression." : kicker === "Custom Apparel" ? "Wear your story with standout custom prints." : "Make your brand impossible to miss."}</p><span className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold shadow-sm transition group-hover:gap-3 ${dark?"bg-white text-[#102748]":"bg-[#0875f5] text-white"}`}>{cta} <ArrowRight size={15}/></span></div>
    <div className="relative min-h-[190px] overflow-hidden sm:min-h-0"><ProductImage src={image} alt={kicker} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"/><div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/[0.04] via-transparent to-transparent"/></div>
  </Link>;
}

function ProductRail({title,items,tabs:railTabs,tab,onTab,to}:{title:string;items:typeof products;tabs?:{id:string;label:string}[];tab?:string;onTab?:(id:string)=>void;to:string}) {
  return <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7">
    <SectionHeading title={title} to={to}/>
    {railTabs&&onTab&&<div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">{railTabs.map(t=><button key={t.id} onClick={()=>onTab(t.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold sm:text-[0.75rem] ${tab===t.id?"bg-[#102748] text-white":"bg-[#f1f4f9] text-[#56657a] hover:bg-[#e6edf8]"}`}>{t.label}</button>)}</div>}
    <div className="product-rail mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">{items.slice(0,6).map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>;
}
