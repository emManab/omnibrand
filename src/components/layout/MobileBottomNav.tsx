import { Heart, Home, LayoutGrid, Sparkles, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Categories", to: "/catalog", icon: LayoutGrid, end: false },
  { label: "Design", to: "/catalog", icon: Sparkles, end: false },
  { label: "Wishlist", to: "/login", icon: Heart, end: false },
  { label: "Account", to: "/account", icon: UserRound, end: false },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  return <nav aria-label="Mobile navigation" className="mobile-bottom-nav">
    {links.map((item, index) => <NavLink key={item.label} to={item.to} end={item.end} onClick={index === 2 ? (e) => { e.preventDefault(); navigate("/catalog"); } : undefined} className={({isActive}) => cn("mobile-bottom-nav__item", isActive && "is-active")}>
      <item.icon aria-hidden="true" size={21} strokeWidth={index === 0 ? 2.4 : 2} />
      <span>{item.label}</span>
    </NavLink>)}
  </nav>;
}
