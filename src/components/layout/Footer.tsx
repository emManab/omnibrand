import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube, ArrowUpRight } from "lucide-react";

const cols = [
  { title: "Shop", links: [["All Products", "/catalog"], ["Business Cards", "/catalog?category=business-cards"], ["Apparel", "/catalog?category=apparel"], ["Stickers & Labels", "/catalog?category=stickers"], ["Packaging", "/catalog?category=packaging"], ["Marketing Materials", "/catalog?category=marketing"]] },
  { title: "Help", links: [["Track Order", "/account"], ["Shipping & Delivery", "/help"], ["Returns & Refunds", "/help"], ["Design Guide", "/help"], ["FAQs", "/help"]] },
  { title: "Company", links: [["About Us", "/help"], ["Careers", "/help"], ["Blog", "/help"], ["Press", "/help"], ["Contact Us", "/help"]] },
  { title: "Legal", links: [["Terms & Conditions", "/help"], ["Privacy Policy", "/help"], ["Cookie Policy", "/help"]] },
];

export function Footer() {
  return <footer className="mt-5 border-t border-[#edf0f5] bg-white">
    <div className="mx-auto grid max-w-[1440px] gap-7 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.7fr_repeat(4,1fr)] lg:px-7 lg:py-10">
      <div>
        <Link to="/" className="inline-flex items-center" aria-label="Printify home"><img src="/printify-logo.svg" alt="Printify" width="132" height="30" className="h-8 w-auto" /></Link>
        <p className="mt-3 max-w-[230px] text-[0.75rem] leading-5 text-[#66758b]">Custom printing for businesses, creators and everyone in between.</p>
        <div className="mt-4 flex items-center gap-3 text-[#273b58]">
          <a href="https://www.instagram.com/" aria-label="Instagram" className="hover:text-[#0875f5]"><Instagram size={15}/></a>
          <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="hover:text-[#0875f5]"><Linkedin size={15}/></a>
          <a href="https://www.youtube.com/" aria-label="YouTube" className="hover:text-[#0875f5]"><Youtube size={16}/></a>
          <a href="https://x.com/" aria-label="X" className="text-xs font-extrabold hover:text-[#0875f5]">𝕏</a>
        </div>
      </div>
      {cols.map(col=><div key={col.title}><p className="text-[0.75rem] font-extrabold text-[#1b2d49]">{col.title}</p><ul className="mt-3 space-y-2">{col.links.map(([label,href])=><li key={label}><Link to={href} className="text-[0.75rem] text-[#68778c] transition hover:text-[#0875f5]">{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="border-t border-[#edf0f5]"><div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 py-3 text-[0.6875rem] text-[#8894a6] sm:px-6 lg:px-7"><span>© {new Date().getFullYear()} Printify. All rights reserved.</span><span className="inline-flex items-center gap-1">🇮🇳 India (₹ INR) <ArrowUpRight size={10}/></span></div></div>
  </footer>;
}
