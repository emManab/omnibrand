import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, PenLine, Play, ShieldCheck, Star, Truck } from "lucide-react";
import { categories, products } from "@/data/catalog";
import { storefrontImages } from "@/data/storefrontImages";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

const tiles = categories.map((category) => ({
  label: category.name,
  slug: category.slug,
  src: category.image,
}));
const creatorVideos = [
  { handle: "@printlybusiness", category: "Business Cards", title: "First look at our new business cards", duration: "0:32", image: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=720&q=85", query: "custom business card unboxing", to: "/catalog?category=business-cards" },
  { handle: "@smallbrandstudio", category: "Stickers & Labels", title: "Sticker order reveal", duration: "0:28", image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=720&q=85", query: "custom sticker unboxing", to: "/catalog?category=stickers" },
  { handle: "@thebrandmaker", category: "Packaging & Boxes", title: "Packaging that feels on-brand", duration: "0:45", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=720&q=85", query: "custom packaging unboxing small business", to: "/catalog?category=packaging" },
  { handle: "@wearyourbrand", category: "Custom Apparel", title: "Custom apparel reveal", duration: "0:31", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=85", query: "custom printed t shirt unboxing", to: "/catalog?category=apparel" },
  { handle: "@everydaycreative", category: "Office Stationery", title: "A fresh stationery setup", duration: "0:37", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=720&q=85", query: "custom printed stationery unboxing", to: "/catalog?category=stationery" },
];
const benefits = [
  {Icon:Truck,label:"Fast Delivery"},
  {Icon:Star,label:"High Quality Prints"},
  {Icon:PenLine,label:"Design Online"},
  {Icon:ShieldCheck,label:"No Minimum Order"},
];
function Title({children,to="/catalog",showLink=true}:{children:ReactNode;to?:string;showLink?:boolean}) {
  return <div className="flex items-center justify-between gap-2"><h2 className="text-[19px] font-extrabold tracking-tight text-[#101e39]">{children}</h2>{showLink&&<Link to={to} className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#0875f5]">View All <span aria-hidden="true">→</span></Link>}</div>;
}
function Banner({eyebrow,title,description,cta,to,src,tone}:{eyebrow:string;title:string;description?:string;cta:string;to:string;src:string;tone:string}) {
 return <Link to={to} className={`mobile-reference-banner ${tone}`}>
  <div className="relative z-10 flex flex-col items-start justify-center py-5 pl-5">
   <p className="text-[10px] font-bold uppercase tracking-[.09em] text-[#354967]">{eyebrow}</p>
   <h3 className="mt-1 text-[23px] font-extrabold leading-[1.05] tracking-tight text-[#0c1d3c]">{title}</h3>
   {description&&<p className="mt-2 text-[12px] leading-[1.35] text-[#33445d]">{description}</p>}
   <span className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#071b3d] px-4 py-2.5 text-[12px] font-bold text-white">{cta} <span>→</span></span>
  </div>
  <ProductImage src={src} alt="" className="h-full min-h-[205px] w-full object-cover object-center"/>
 </Link>;
}
function Rail({title,items}:{title:string;items:typeof products}) {
 return <section className="px-4 pt-7"><Title>{title}</Title><div className="mobile-reference-rail mt-3">{items.slice(0,8).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>;
}
export function MobileHome() {
 const revealRoot = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const root = revealRoot.current;
  if (!root) return;
  const items = root.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
   items.forEach((item) => item.classList.add("is-revealed"));
   return;
  }
  const observer = new IntersectionObserver((entries) => {
   entries.forEach((entry) => {
    if (entry.isIntersecting) {
     entry.target.classList.add("is-revealed");
     observer.unobserve(entry.target);
    }
   });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
  items.forEach((item) => observer.observe(item));
  return () => observer.disconnect();
 }, []);
 const popular = products.filter(p=>p.featured);
 const trending = products.filter(p=>p.trending);
 return <div ref={revealRoot} className="mobile-reference-home bg-white pb-5">
  <section className="px-4 pt-3">
   <div className="mobile-reference-hero relative overflow-hidden rounded-[15px] bg-gradient-to-br from-[#d9eaff] via-[#c5dfff] to-[#9fc7fa]">
    <div className="relative z-10 w-[54%] px-4 py-6">
     <h1 className="text-[29px] font-extrabold leading-[.98] tracking-[-.045em] text-[#0c1d3c]">Design it.<br/>Print it.<br/>Make it yours.</h1>
     <p className="mt-3 text-[13px] leading-[1.4] text-[#273c59]">Custom products for your business, events and everyday moments.</p>
     <Link to="/catalog" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0c1d3c] px-4 py-3 text-[13px] font-bold text-white">Shop Now <span>→</span></Link>
    </div>
    <div className="absolute inset-y-0 right-0 w-[48%]">
      <ProductImage src={storefrontImages.hero.hoodie} alt="White custom hoodie" className="absolute right-[9%] top-[9%] h-[70%] w-[75%] rounded-xl object-cover shadow-lg"/>
      <ProductImage src={storefrontImages.hero.bottle} alt="Water bottle" className="absolute bottom-[4%] left-[-8%] h-[39%] w-[35%] rounded-lg object-cover shadow-lg"/>
      <ProductImage src={storefrontImages.hero.cap} alt="Cap" className="absolute bottom-[2%] right-[0%] h-[31%] w-[49%] rounded-lg object-cover shadow-lg"/>
      <span className="absolute right-[20%] top-[36%] border-2 border-[#0875f5] bg-white/95 px-2 py-2 text-center text-[10px] font-black leading-tight text-[#0c1d3c]">YOUR<br/>DESIGN<br/>HERE</span>
    </div>
   </div>
   <div className="flex justify-center gap-1.5 py-3"><span className="h-2 w-2 rounded-full bg-[#0c1d3c]"/>{[1,2,3].map(i=><span key={i} className="h-2 w-2 rounded-full bg-[#d6dce7]"/>)}</div>
  </section>
  <section className="grid grid-cols-4 gap-2 px-4 py-4">{benefits.map(({Icon,label})=><div key={label} className="flex flex-col items-center gap-2 text-center"><Icon size={23} strokeWidth={1.9} className="text-[#102748]"/><span className="text-[11px] font-medium leading-[1.25] text-[#192c49]">{label}</span></div>)}</section>
  <section className="px-4 pb-3 pt-7"><Title showLink={false}>Shop by Category</Title><div className="mt-4 grid grid-cols-4 gap-x-2.5 gap-y-5">{tiles.map((tile,i)=><Link key={i} to={`/catalog?category=${tile.slug}`} className="min-w-0 text-center"><div className="aspect-square overflow-hidden rounded-xl bg-[#f1f3f7]"><ProductImage src={tile.src} alt={tile.label} className="h-full w-full object-cover"/></div><p className="mt-2 text-[11px] font-medium leading-[1.25] text-[#192c49]">{tile.label}</p></Link>)}</div></section>
  <section data-scroll-reveal className="space-y-4 px-4 pt-6"><Banner eyebrow="Business Cards" title="Make a lasting first impression." description="Premium cards for your brand, your way." cta="Shop Business Cards" to="/catalog?category=business-cards" src={storefrontImages.promos.businessCards} tone="mobile-reference-peach"/></section>
  <Rail title="Popular Products" items={popular}/>
  <Rail title="Trending Now" items={trending}/>
  <section data-scroll-reveal className="space-y-4 px-4 pt-6"><Banner eyebrow="Custom Apparel" title="Wear your brand proudly." description="T-shirts, hoodies, caps and more." cta="Shop Apparel" to="/catalog?category=apparel" src={storefrontImages.promos.customApparel} tone="mobile-reference-green"/></section>
  <section data-scroll-reveal className="mobile-creator-section px-4 pt-8">
   <div className="flex items-end justify-between gap-3">
    <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0875f5]">From our creators</p><h2 className="mt-1 text-[21px] font-extrabold leading-tight tracking-tight text-[#101e39]">Real businesses.<br/><span className="text-[#0875f5]">Real unboxings.</span></h2><p className="mt-2 max-w-[250px] text-[12px] leading-5 text-[#66758b]">Get inspired by the details behind standout brands.</p></div>
    <a href="https://www.youtube.com/results?search_query=custom+printing+unboxing+small+business" target="_blank" rel="noreferrer" className="mb-1 inline-flex min-h-11 shrink-0 items-center gap-1 text-[12px] font-bold text-[#0875f5]">View all <ArrowRight size={14}/></a>
   </div>
   <div className="mobile-creator-rail mt-4">
    {creatorVideos.map((video, index) => <article key={video.handle} data-scroll-reveal style={{"--reveal-delay": `${Math.min(index, 3) * 65}ms`} as CSSProperties} className="mobile-creator-card group overflow-hidden rounded-2xl border border-[#e7edf5] bg-white shadow-[0_5px_18px_rgba(16,40,76,.06)]">
     <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}`} target="_blank" rel="noreferrer" aria-label={`Find videos: ${video.title}`} className="relative block aspect-[4/5] overflow-hidden bg-[#edf2f8]">
      <img src={video.image} alt={video.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"/>
      <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white">{video.duration}</span>
      <span className="absolute inset-0 grid place-items-center bg-[#0b1d36]/10"><span className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-black/45 text-white shadow-lg backdrop-blur-sm"><Play size={18} fill="currentColor" className="ml-0.5"/></span></span>
     </a>
     <div className="p-3"><p className="truncate text-[12px] font-extrabold text-[#102748]">{video.handle}</p><p className="mt-1 text-[10px] text-[#66758b]">{video.category}</p><Link to={video.to} className="mt-2 inline-flex min-h-10 items-center gap-1 text-[11px] font-bold text-[#0875f5]">Shop this product <ArrowRight size={13}/></Link></div>
    </article>)}
   </div>
   <p className="mt-2 text-[10px] leading-4 text-[#8995a7]">Thumbnails are illustrative. Open a video search to explore creator unboxings.</p>
  </section>
  <section className="grid grid-cols-4 gap-2 px-4 py-7">{[{Icon:PenLine,label:"Easy Online Design"},{Icon:Truck,label:"Fast Delivery"},{Icon:BadgeCheck,label:"High Quality Prints"},{Icon:ShieldCheck,label:"No Minimum Orders"}].map(({Icon,label})=><div key={label} className="flex flex-col items-center gap-2 text-center"><Icon size={23} className="text-[#0875f5]"/><span className="text-[11px] font-medium leading-4">{label}</span></div>)}</section>
  <section data-scroll-reveal className="px-4 pb-6"><Title to="/help">Trusted by Businesses and Creators</Title><div className="mt-4 grid gap-3">{[{name:"Rohan Mehta",role:"Small Business Owner",text:"Amazing quality and super fast delivery! Our business cards turned out perfectly."},{name:"Priya Sharma",role:"Event Planner",text:"Loved the custom t-shirts for our event. Great print quality and easy ordering process."},{name:"Arjun Verma",role:"Entrepreneur",text:"Best place for custom printing. The packaging boxes were exactly what we needed."}].map(r=><blockquote key={r.name} className="rounded-xl border border-[#e6eaf2] bg-white p-3 shadow-sm"><p className="text-[13px] font-bold text-[#182b48]">{r.name} · {r.role}</p><div className="mt-1 text-[#ffad0a]">★★★★★</div><p className="mt-2 text-[12px] leading-4 text-[#46556d]">{r.text}</p></blockquote>)}</div></section>
  <section className="px-4 pb-5"><div className="rounded-2xl bg-[#0c1d3c] p-5 text-white"><h2 className="text-[20px] font-extrabold">Get Inspired and Get 10% Off</h2><p className="mt-2 text-[12px] leading-4 text-white/75">Subscribe for new products, exclusive offers and design tips.</p><form className="mt-4 flex gap-2" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;form.innerHTML='<p class=&quot;text-sm font-bold&quot;>Thanks for subscribing!</p>';}}><input name="email" type="email" required placeholder="Enter your email address" aria-label="Email address" className="min-w-0 flex-1 rounded-lg bg-white px-3 py-3 text-[12px] text-[#102748]"/><button className="rounded-lg bg-[#0875f5] px-3 text-[12px] font-bold">Subscribe</button></form></div></section>
 </div>;
}
