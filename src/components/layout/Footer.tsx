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
        <Link to="/" className="inline-flex items-center text-[2rem] font-extrabold leading-none tracking-[-0.045em] text-[#102748]" aria-label="Printify home">Printify</Link>
        <p className="mt-4 max-w-[260px] text-[0.8125rem] leading-6 text-[#66758b]">Custom printing for businesses, creators and everyone in between.</p>
        <div className="mt-4 flex items-center gap-3 text-[#273b58]">
          <a href="https://www.instagram.com/" aria-label="Instagram" className="hover:text-[#0875f5]"><Instagram size={15}/></a>
          <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="hover:text-[#0875f5]"><Linkedin size={15}/></a>
          <a href="https://www.youtube.com/" aria-label="YouTube" className="hover:text-[#0875f5]"><Youtube size={16}/></a>
          <a href="https://x.com/" aria-label="X" className="text-xs font-extrabold hover:text-[#0875f5]">𝕏</a>
        </div>
      </div>
      {cols.map(col=><div key={col.title}><p className="text-[0.75rem] font-extrabold text-[#1b2d49]">{col.title}</p><ul className="mt-3 space-y-2">{col.links.map(([label,href])=><li key={label}><Link to={href} className="text-[0.75rem] text-[#68778c] transition hover:text-[#0875f5]">{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="border-t border-[#edf0f5]"><div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 py-3 text-[0.6875rem] text-[#8894a6] sm:px-6 lg:px-7"><span>© {new Date().getFullYear()} Printify. All rights reserved.</span><span className="inline-flex items-center gap-1.5"><svg aria-label="India flag" role="img" viewBox="0 0 18 12" className="h-3 w-[18px] overflow-hidden rounded-[1px] ring-1 ring-black/10"><rect width="18" height="4" fill="#FF9933"/><rect y="4" width="18" height="4" fill="#fff"/><rect y="8" width="18" height="4" fill="#138808"/><circle cx="9" cy="6" r="1.35" fill="none" stroke="#000080" strokeWidth=".55"/><path d="M9 4.65V7.35M7.65 6H10.35M8.05 5.05 9.95 6.95M9.95 5.05 8.05 6.95" stroke="#000080" strokeWidth=".25"/></svg><span>India (₹ INR)</span><ArrowUpRight size={10}/></span></div></div>
  </footer>;
}
