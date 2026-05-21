"use client";

import { useApp } from "@/context/AppContext";
import { 
  BarChart3, 
  ClipboardList, 
  PieChart, 
  Scale, 
  Database, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Gift,
  Landmark,
  Briefcase,
  Coins,
  Undo2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordItem, FarmData } from "@/lib/types";

const BADGE_MAP = {
  navIncome: {
    icon: TrendingUp,
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    textClass: "text-emerald-400",
  },
  navExpense: {
    icon: TrendingDown,
    badgeClass: "text-red-400 bg-red-500/10 border-red-500/20",
    textClass: "text-red-400",
  },
  navDonation: {
    icon: Gift,
    badgeClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    textClass: "text-orange-400",
  },
  navWithdraw: {
    icon: Landmark,
    badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    textClass: "text-cyan-400",
  },
  navInvestment: {
    icon: Briefcase,
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    textClass: "text-purple-400",
  },
  navReinvestment: {
    icon: Coins,
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    textClass: "text-amber-400",
  },
  navReturnedCash: {
    icon: Undo2,
    badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    textClass: "text-rose-400",
  },
};

export default function DashboardContent() {
  const {
    income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals,
    isDbConnected, lastSaved, t, language, addItem
  } = useApp();

  const handleResetReturnedCash = async (amount: number) => {
    if (amount <= 0) return;
    if (!confirm(language === "bn" ? "আপনি কি নিশ্চিতভাবে রিটার্ন ক্যাশ 0 করতে চান?" : "Are you sure you want to reset Returned Cash to 0?")) return;
    const today = new Date().toISOString().split("T")[0];
    await addItem("returnedCash", language === "bn" ? "রিসেট" : "Reset", amount, today);
  };

  // Helper to calculate grand total (current active + saved history total)
  const getGrandTotalForType = (type: keyof FarmData, list: RecordItem[]) => {
    const activeTotal = list.reduce((s, i) => s + i.amount, 0);
    const savedList = savedTotals[type] || [];
    const savedTotal = savedList.reduce((s, i) => s + i.amount, 0);
    return activeTotal + savedTotal;
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalIncome         = getGrandTotalForType("income", income);
  const totalExpense        = getGrandTotalForType("expense", expense);
  const totalDonation       = getGrandTotalForType("donation", donation);
  const totalWithdraw       = getGrandTotalForType("withdraw", withdraw);
  const totalInvestment     = getGrandTotalForType("investment", investment);
  const totalReinvestment   = getGrandTotalForType("reinvestment", reinvestment);
  const totalReturnedCash   = getGrandTotalForType("returnedCash", returnedCash);

  const profit = totalIncome - totalExpense; // total profit = total income - total expense
  const recentProfit = profit - (totalDonation + totalWithdraw); // recent profit = total profit - (donation + withdrawal)
  const returnedCashVal = (totalIncome - profit) - totalReturnedCash; // returned cash offset
  const calcCashBalanceVal = totalReinvestment - totalExpense; // cash balance = reinvestment - total expence

  // ── Summary Cards ────────────────────────────────────────────────────────────
  const summaryCards = [
    { labelKey: "totalIncome" as const,         value: totalIncome,         color: "border-l-emerald-500", textColor: "text-emerald-400", glowClass: "glow-income" },
    { labelKey: "totalExpense" as const,        value: totalExpense,        color: "border-l-red-500",     textColor: "text-red-400",     glowClass: "glow-expense" },
    { labelKey: "totalProfit" as const,         value: profit,              color: "border-l-yellow-500",  textColor: profit >= 0 ? "text-yellow-400" : "text-red-400", glowClass: "glow-profit" },
    { labelKey: "recentProfit" as const,        value: recentProfit,        color: "border-l-teal-500",    textColor: recentProfit >= 0 ? "text-teal-400" : "text-red-400", glowClass: "glow-recent-profit" },
    { labelKey: "totalDonation" as const,       value: totalDonation,       color: "border-l-orange-500",  textColor: "text-orange-400",  glowClass: "glow-donation" },
    { labelKey: "totalWithdraw" as const,       value: totalWithdraw,       color: "border-l-cyan-500",    textColor: "text-cyan-400",    glowClass: "glow-withdraw" },
    { labelKey: "calcReturnCash" as const,      value: returnedCashVal,     color: "border-l-rose-500",    textColor: returnedCashVal >= 0 ? "text-rose-400" : "text-red-400", glowClass: "glow-return-cash" },
    { labelKey: "totalInvestment" as const,     value: totalInvestment,     color: "border-l-purple-500",  textColor: "text-purple-400",  glowClass: "glow-investment" },
    { labelKey: "totalReinvestment" as const,   value: totalReinvestment,   color: "border-l-amber-500",   textColor: "text-amber-400",   glowClass: "glow-reinvestment" },
    { labelKey: "calcCashBalance" as const,     value: calcCashBalanceVal,  color: "border-l-indigo-500",  textColor: calcCashBalanceVal >= 0 ? "text-indigo-400" : "text-red-400", glowClass: "glow-cash-balance" },
  ];

  // ── Recent Transactions ──────────────────────────────────────────────────────
  const recentTransactions = [
    ...income.map(i => ({ typeKey: "navIncome" as const,       text: i.text, amount: i.amount, date: i.date, colorClass: "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30" })),
    ...expense.map(i => ({ typeKey: "navExpense" as const,     text: i.text, amount: i.amount, date: i.date, colorClass: "text-red-400 bg-red-950/40 border border-red-900/30" })),
    ...donation.map(i => ({ typeKey: "navDonation" as const,   text: i.text, amount: i.amount, date: i.date, colorClass: "text-orange-400 bg-orange-950/40 border border-orange-900/30" })),
    ...withdraw.map(i => ({ typeKey: "navWithdraw" as const,   text: i.text, amount: i.amount, date: i.date, colorClass: "text-cyan-400 bg-cyan-950/40 border border-cyan-900/30" })),
    ...returnedCash.map(i => ({ typeKey: "navReturnedCash" as const, text: i.text, amount: i.amount, date: i.date, colorClass: "text-rose-400 bg-rose-950/40 border border-rose-900/30" })),
    ...investment.map(i => ({ typeKey: "navInvestment" as const, text: i.text, amount: i.amount, date: i.date, colorClass: "text-purple-400 bg-purple-950/40 border border-purple-900/30" })),
    ...reinvestment.map(i => ({ typeKey: "navReinvestment" as const, text: i.text, amount: i.amount, date: i.date, colorClass: "text-amber-400 bg-amber-950/40 border border-amber-900/30" })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <BarChart3 className="w-6 h-6 text-emerald-400 animate-pulse" /> {t("dashboardTitle")}
        </h2>
      </div>

      {/* ── Summary Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3">
        {summaryCards.map((card) => (
          <Card
            key={card.labelKey}
            className={`border-l-4 ${card.color} p-4 flex flex-col justify-between hover:scale-102 hover:shadow-lg transition-all duration-300 ${card.glowClass} relative group`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
                {t(card.labelKey)}
              </span>
              {card.labelKey === "calcReturnCash" && card.value > 0 && (
                <button
                  onClick={() => handleResetReturnedCash(card.value)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-[8px] px-2 py-0.5 rounded cursor-pointer"
                  title="Reset to 0"
                >
                  Reset
                </button>
              )}
            </div>
            <p className={`text-sm sm:text-md font-black mt-3 ${card.textColor}`}>
              {t("takaSymbol")} {card.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Recent Transactions & Stats Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-8 flex flex-col">
          <CardHeader className="pb-3 border-0">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
              <ClipboardList className="w-4 h-4 text-slate-400" /> {t("recentTransactions")}
            </CardTitle>
            <CardDescription>{t("recentTransactionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {recentTransactions.map((item, idx) => {
                const config = BADGE_MAP[item.typeKey];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-800/40 last:border-0 hover:translate-x-1 transition-transform duration-200 group">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${config.badgeClass}`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{t(item.typeKey)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-200 group-hover:text-white transition-colors">
                          {item.text}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3 h-3 text-slate-500" /> {item.date}
                        </p>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${config.textClass} ml-3 shrink-0`}>
                      {t("takaSymbol")} {item.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <p className="text-center text-slate-500 text-xs py-12">{t("noTransactions")}</p>
              )}
            </div>
            {lastSaved && (
              <p className="text-[9px] text-slate-500 text-right mt-4 font-bold tracking-wide uppercase">
                {t("syncDb", { time: lastSaved })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats side column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Profit margin */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" /> {t("profitMargin")}
              </p>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-black ${profit >= 0 ? "text-yellow-400" : "text-red-400"}`}>
                  {totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <div className="mt-3.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${profit >= 0 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(Math.abs(totalIncome > 0 ? (profit / totalIncome) * 100 : 0), 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expense ratio */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> {t("incomeVsExpense")}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold mt-1.5">
                <span className="text-emerald-400">{t("navIncome")} {t("takaSymbol")}{totalIncome.toLocaleString()}</span>
                <span className="text-slate-600">vs</span>
                <span className="text-red-400">{t("navExpense")} {t("takaSymbol")}{totalExpense.toLocaleString()}</span>
              </div>
              <div className="mt-4.5 h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                {totalIncome + totalExpense > 0 && (
                  <>
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }} />
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(totalExpense / (totalIncome + totalExpense)) * 100}%` }} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DB Status */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> {t("dbStatus")}
              </p>
              <div className={`flex items-center gap-2 text-sm font-bold ${isDbConnected ? "text-emerald-400" : "text-red-400"}`}>
                <span className={`w-2 h-2 rounded-full ${isDbConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"} pulse-dot`} />
                {isDbConnected ? t("dbActive") : t("dbOfflineShort")}
              </div>
              <p className="text-[10px] text-slate-500 mt-3 font-semibold">
                {t("recordsCount", { count: income.length + expense.length + donation.length + withdraw.length + returnedCash.length + investment.length + reinvestment.length })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
