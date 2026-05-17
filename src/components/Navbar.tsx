"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Landmark, 
  Briefcase,
  Calculator
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/",          icon: LayoutDashboard, key: "navDashboard" as const },
  { href: "/income",    icon: TrendingUp,      key: "navIncome" as const },
  { href: "/expense",   icon: TrendingDown,    key: "navExpense" as const },
  { href: "/donation",  icon: Gift,            key: "navDonation" as const },
  { href: "/withdraw",  icon: Landmark,        key: "navWithdraw" as const },
  { href: "/investment",icon: Briefcase,       key: "navInvestment" as const },
  { href: "/calculator",icon: Calculator,      key: "navCalculator" as const },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-4xl w-[98%] sm:w-fit">
      <nav className="h-[68px] sm:h-[80px] bg-[#0e1626]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl flex items-stretch select-none px-2 sm:px-6 gap-0.5 sm:gap-3 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 sm:flex-initial sm:px-5 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all hover:scale-105 active:scale-95 relative rounded-xl ${
                isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span className="text-[7.5px] sm:text-[11.5px] tracking-tight sm:tracking-normal font-semibold sm:font-bold whitespace-nowrap">{t(item.key)}</span>
              {isActive && <span className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
