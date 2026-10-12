import { Link } from "react-router-dom";

const cols = [
  {
    title: "Shop",
    links: [
      ["All products", "/catalog"],
      ["Business cards", "/catalog?category=business-cards"],
      ["Apparel", "/catalog?category=apparel"],
      ["Packaging", "/catalog?category=packaging"],
      ["Stickers", "/catalog?category=stickers"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Design editor", "/help"],
      ["Shipping & delivery", "/help"],
      ["Artwork guidelines", "/help"],
      ["Returns", "/help"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Printify", "/help"],
      ["Production", "/help"],
      ["For studios", "/help"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/help"],
      ["Terms", "/help"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-6 lg:px-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
              P
            </span>
            <span className="text-lg font-semibold">Printify</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            Custom printing for businesses, creators and growing brands. Bring your ideas to life on products people love.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-4 text-xs text-muted lg:px-6">
          <span>© {new Date().getFullYear()} Printify. All rights reserved.</span>
          <span>Printed in India</span>
        </div>
      </div>
    </footer>
  );
}
