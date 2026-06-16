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
  Calculator,
  StickyNote,
  Wrench,
  Layers,
  Coins,
  Undo2
} from "lucide-react";
import { useState, useEffect } from "react";

export const NAV_ITEMS = [
  { href: "/",              icon: LayoutDashboard, key: "navDashboard" as const },
  { href: "/income",        icon: TrendingUp,      key: "navIncome" as const },
  { href: "/expense",       icon: TrendingDown,    key: "navExpense" as const },
  { href: "/donation",      icon: Gift,            key: "navDonation" as const },
  { href: "/withdraw",      icon: Landmark,        key: "navWithdraw" as const },
  { href: "/investment",    icon: Briefcase,       key: "navInvestment" as const },
  { href: "/reinvestment",  icon: Coins,           key: "navReinvestment" as const },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t, saveAndResetAll, showConfirm } = useApp();
  const [toolsOpen, setToolsOpen] = useState(false);

  const isToolActive = pathname === "/calculator" || pathname === "/notepad" || pathname === "/agro-count";

  // Close drop-up if user clicks anywhere outside of it
  useEffect(() => {
    if (!toolsOpen) return;
    const handleOutsideClick = () => {
      setToolsOpen(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [toolsOpen]);

  const handleToolsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToolsOpen(!toolsOpen);
  };

  const handleResetAndSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      message: t("resetConfirm"),
      type: "danger",
      onConfirm: async () => {
        setToolsOpen(false);
        await saveAndResetAll();
      }
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-4xl w-[98%] sm:w-fit">
      
      {/* Tools Drop-Up Menu */}
      {toolsOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-surface/95 border border-border/80 backdrop-blur-xl rounded-2xl shadow-2xl p-2 flex flex-col gap-1 absolute bottom-[76px] sm:bottom-[90px] right-2 sm:right-6 min-w-[170px] z-50 animate-fade-in"
        >
          {/* Notepad option */}
          <Link
            href="/notepad"
            onClick={() => setToolsOpen(false)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/notepad"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <StickyNote className="w-4 h-4 text-emerald-400" />
            <span>{t("navNotepad")}</span>
          </Link>

          {/* Calculator option */}
          <Link
            href="/calculator"
            onClick={() => setToolsOpen(false)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/calculator"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>{t("navCalculator")}</span>
          </Link>

          {/* Agro Count option */}
          <Link
            href="/agro-count"
            onClick={() => setToolsOpen(false)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/agro-count"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{t("navAgroCount")}</span>
          </Link>

          {/* Reset and Save option */}
          <button
            onClick={handleResetAndSave}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/30 text-left w-full"
          >
            <Undo2 className="w-4 h-4 text-rose-400" />
            <span>{t("navResetAndSave")}</span>
          </button>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="h-[68px] sm:h-[80px] bg-header-bg border border-border/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl flex items-stretch select-none px-2 sm:px-6 gap-0.5 sm:gap-3 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 sm:flex-initial sm:px-5 flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:scale-105 active:scale-95 relative rounded-xl ${
                isActive ? "text-emerald-400 font-bold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-emerald-400" : "text-text-muted"}`} />
              <span className="text-[7.5px] sm:text-[11.5px] tracking-tight sm:tracking-normal font-semibold sm:font-bold whitespace-nowrap">{t(item.key)}</span>
              {isActive && <span className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />}
            </Link>
          );
        })}

        {/* Tools Popover Button */}
        <button
          onClick={handleToolsToggle}
          className={`flex-1 sm:flex-initial sm:px-5 flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:scale-105 active:scale-95 relative rounded-xl ${
            isToolActive || toolsOpen
              ? "text-emerald-400 font-bold"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Wrench className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] transition duration-200 ${isToolActive || toolsOpen ? "text-emerald-400 scale-105" : "text-text-muted"}`} />
          <span className="text-[7.5px] sm:text-[11.5px] tracking-tight sm:tracking-normal font-semibold sm:font-bold whitespace-nowrap">{t("navTools")}</span>
          {isToolActive && (
            <span className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>
      </nav>
    </div>
  );
}
