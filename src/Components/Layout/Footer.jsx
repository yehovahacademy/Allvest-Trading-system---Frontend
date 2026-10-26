
import { NavLink } from "react-router-dom";
import { ChartNoAxesCombined } from "lucide-react";

const defaultLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Markets", href: "/markets" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Orders", href: "/orders" },
];

export default function Footer({
  brand = "NexaTrade",
  links = defaultLinks,
}) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0B1220]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <ChartNoAxesCombined size={19} />
            </span>
            <span className="text-base font-semibold text-white">
              {brand}<span className="text-emerald-400">.</span>
            </span>
          </NavLink>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map(({ label, href }) => (
              <NavLink
                key={href}
                to={href}
                className="text-sm text-slate-400 transition hover:text-emerald-300"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>
          <p>Built with React & FastAPI.</p>
        </div>
      </div>
    </footer>
  );
}
