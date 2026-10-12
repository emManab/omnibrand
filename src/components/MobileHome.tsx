import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, PenLine, ShieldCheck, Star, Truck } from "lucide-react";
import { products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`;
const tiles = [
  {label:"Business Cards",slug:"business-cards",src:image("photo-1623305465231-d884ce752d59")},
  {label:"Custom T-Shirts",slug:"apparel",src:image("photo-1521572163474-6864f9cf17ab")},
  {label:"Hoodies & Sweatshirts",slug:"apparel",src:image("photo-1556821840-3a63f95609a7")},
  {label:"Stickers & Labels",slug:"stickers",src:image("photo-1621252756235-7f37e5e5125e")},
  {label:"Caps & Hats",slug:"apparel",src:image("photo-1588850561407-ed78c282e89b")},
  {label:"Posters & Banners",slug:"marketing",src:image("photo-1586281380349-632531db7ed4")},
  {label:"Packaging & Boxes",slug:"packaging",src:image("photo-1771848194269-2e3b89b6465b")},
  {label:"Drinkware",slug:"gifts",src:image("photo-1602143407151-7111542de6e8")},
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
 const popular = products.filter(p=>p.featured);
 const trending = products.filter(p=>p.trending);
 return <div className="mobile-reference-home bg-white pb-5">
  <section className="px-4 pt-3">
   <div className="mobile-reference-hero relative overflow-hidden rounded-[15px] bg-gradient-to-br from-[#d9eaff] via-[#c5dfff] to-[#9fc7fa]">
    <div className="relative z-10 w-[54%] px-4 py-6">
     <h1 className="text-[29px] font-extrabold leading-[.98] tracking-[-.045em] text-[#0c1d3c]">Design it.<br/>Print it.<br/>Make it yours.</h1>
     <p className="mt-3 text-[13px] leading-[1.4] text-[#273c59]">Custom products for your business, events and everyday moments.</p>
     <Link to="/catalog" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0c1d3c] px-4 py-3 text-[13px] font-bold text-white">Shop Now <span>→</span></Link>
    </div>
    <div className="absolute inset-y-0 right-0 w-[48%]">
      <ProductImage src={image("photo-1620799140188-3b2a02fd9a77")} alt="White custom hoodie" className="absolute right-[9%] top-[9%] h-[70%] w-[75%] rounded-xl object-cover shadow-lg"/>
      <ProductImage src={image("photo-1602143407151-7111542de6e8")} alt="Water bottle" className="absolute bottom-[4%] left-[-8%] h-[39%] w-[35%] rounded-lg object-cover shadow-lg"/>
      <ProductImage src={image("photo-1588850561407-ed78c282e89b")} alt="Cap" className="absolute bottom-[2%] right-[0%] h-[31%] w-[49%] rounded-lg object-cover shadow-lg"/>
      <span className="absolute right-[20%] top-[36%] border-2 border-[#0875f5] bg-white/95 px-2 py-2 text-center text-[10px] font-black leading-tight text-[#0c1d3c]">YOUR<br/>DESIGN<br/>HERE</span>
    </div>
   </div>
   <div className="flex justify-center gap-1.5 py-3"><span className="h-2 w-2 rounded-full bg-[#0c1d3c]"/>{[1,2,3].map(i=><span key={i} className="h-2 w-2 rounded-full bg-[#d6dce7]"/>)}</div>
  </section>
  <section className="grid grid-cols-4 gap-2 px-4 py-4">{benefits.map(({Icon,label})=><div key={label} className="flex flex-col items-center gap-2 text-center"><Icon size={23} strokeWidth={1.9} className="text-[#102748]"/><span className="text-[11px] font-medium leading-[1.25] text-[#192c49]">{label}</span></div>)}</section>
  <section className="px-4 pb-3 pt-7"><Title showLink={false}>Shop by Category</Title><div className="mt-4 grid grid-cols-4 gap-x-2.5 gap-y-5">{tiles.map((tile,i)=><Link key={i} to={`/catalog?category=${tile.slug}`} className="min-w-0 text-center"><div className="aspect-square overflow-hidden rounded-xl bg-[#f1f3f7]"><ProductImage src={tile.src} alt={tile.label} className="h-full w-full object-cover"/></div><p className="mt-2 text-[11px] font-medium leading-[1.25] text-[#192c49]">{tile.label}</p></Link>)}</div></section>
  <section className="space-y-4 px-4 pt-6"><Banner eyebrow="Business Cards" title="Make a lasting first impression." description="Premium cards for your brand, your way." cta="Shop Business Cards" to="/catalog?category=business-cards" src={image("photo-1623305465231-d884ce752d59")} tone="mobile-reference-peach"/></section>
  <Rail title="Popular Products" items={popular}/>
  <Rail title="Trending Now" items={trending}/>
  <section className="space-y-4 px-4 pt-6"><Banner eyebrow="Custom Apparel" title="Wear your brand proudly." description="T-shirts, hoodies, caps and more." cta="Shop Apparel" to="/catalog?category=apparel" src={image("photo-1521572163474-6864f9cf17ab")} tone="mobile-reference-green"/></section>
  <section className="grid grid-cols-4 gap-2 px-4 py-7">{[{Icon:PenLine,label:"Easy Online Design"},{Icon:Truck,label:"Fast Delivery"},{Icon:BadgeCheck,label:"High Quality Prints"},{Icon:ShieldCheck,label:"No Minimum Orders"}].map(({Icon,label})=><div key={label} className="flex flex-col items-center gap-2 text-center"><Icon size={23} className="text-[#0875f5]"/><span className="text-[11px] font-medium leading-4">{label}</span></div>)}</section>
  <section className="px-4 pb-6"><Title to="/help">Trusted by Businesses and Creators</Title><div className="mt-4 grid gap-3">{[{name:"Rohan Mehta",role:"Small Business Owner",text:"Amazing quality and super fast delivery! Our business cards turned out perfectly."},{name:"Priya Sharma",role:"Event Planner",text:"Loved the custom t-shirts for our event. Great print quality and easy ordering process."},{name:"Arjun Verma",role:"Entrepreneur",text:"Best place for custom printing. The packaging boxes were exactly what we needed."}].map(r=><blockquote key={r.name} className="rounded-xl border border-[#e6eaf2] bg-white p-3 shadow-sm"><p className="text-[13px] font-bold text-[#182b48]">{r.name} · {r.role}</p><div className="mt-1 text-[#ffad0a]">★★★★★</div><p className="mt-2 text-[12px] leading-4 text-[#46556d]">{r.text}</p></blockquote>)}</div></section>
  <section className="px-4 pb-5"><div className="rounded-2xl bg-[#0c1d3c] p-5 text-white"><h2 className="text-[20px] font-extrabold">Get Inspired and Get 10% Off</h2><p className="mt-2 text-[12px] leading-4 text-white/75">Subscribe for new products, exclusive offers and design tips.</p><form className="mt-4 flex gap-2" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;form.innerHTML='<p class=&quot;text-sm font-bold&quot;>Thanks for subscribing!</p>';}}><input name="email" type="email" required placeholder="Enter your email address" aria-label="Email address" className="min-w-0 flex-1 rounded-lg bg-white px-3 py-3 text-[12px] text-[#102748]"/><button className="rounded-lg bg-[#0875f5] px-3 text-[12px] font-bold">Subscribe</button></form></div></section>
 </div>;
}
