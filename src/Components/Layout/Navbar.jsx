import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  ArrowDownUp,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

const defaultLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Markets", href: "/markets", icon: Activity },
  { label: "Portfolio", href: "/portfolio", icon: BriefcaseBusiness },
  { label: "Orders", href: "/orders", icon: ArrowDownUp },
];

export default function Navbar({
  brand = "NexaTrade",
  links = defaultLinks,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getLinkClass = ({ isActive }, mobile = false) =>
    [
      "rounded-xl text-sm font-medium transition-colors",
      mobile ? "flex items-center gap-3 px-4 py-3" : "px-4 py-2.5",
      isActive
        ? "bg-emerald-400/10 text-emerald-300"
        : "text-slate-400 hover:bg-white/5 hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B1220]/90 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"
        aria-label="Main navigation"
      >
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07140F]">
            <ChartNoAxesCombined size={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            {brand}
            <span className="text-emerald-400">.</span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              className={(props) => getLinkClass(props)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Status badge – keep only if it’s intentional product UI */}
        <div className="hidden md:flex">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Trading System
          </span>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/[0.08] px-5 py-3 md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {links.map(({ label, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === "/"}
                className={(props) => getLinkClass(props, true)}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}