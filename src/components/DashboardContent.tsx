"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  BarChart3, 
  LineChart, 
  ClipboardList, 
  PieChart, 
  Scale, 
  Database, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Gift,
  Landmark,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TooltipState {
  month: string;
  type: "income" | "expense";
  value: number;
  x: number;
  y: number;
}

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
};

export default function DashboardContent() {
  const {
    income, expense, donation, withdraw, investment,
    isDbConnected, lastSaved, t,
  } = useApp();

  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalIncome     = income.reduce((s, i) => s + i.amount, 0);
  const totalExpense    = expense.reduce((s, i) => s + i.amount, 0);
  const totalDonation   = donation.reduce((s, i) => s + i.amount, 0);
  const totalWithdraw   = withdraw.reduce((s, i) => s + i.amount, 0);
  const totalInvestment = investment.reduce((s, i) => s + i.amount, 0);
  const profit      = totalIncome - totalExpense;
  const cashBalance = profit - totalDonation - totalWithdraw;

  // ── Summary Cards ────────────────────────────────────────────────────────────
  const summaryCards = [
    { labelKey: "totalIncome" as const,         value: totalIncome,     color: "border-l-emerald-500", textColor: "text-emerald-400", glowClass: "glow-income" },
    { labelKey: "totalExpense" as const,        value: totalExpense,    color: "border-l-red-500",     textColor: "text-red-400",     glowClass: "glow-expense" },
    { labelKey: "totalDonation" as const,       value: totalDonation,   color: "border-l-orange-500",  textColor: "text-orange-400",  glowClass: "glow-donation" },
    { labelKey: "totalWithdraw" as const,       value: totalWithdraw,   color: "border-l-cyan-500",    textColor: "text-cyan-400",    glowClass: "glow-withdraw" },
    { labelKey: "totalProfit" as const,         value: profit,          color: "border-l-yellow-500",  textColor: profit >= 0 ? "text-yellow-400" : "text-red-400", glowClass: "glow-profit" },
    { labelKey: "cashBalance" as const,         value: cashBalance,     color: "border-l-teal-500",    textColor: cashBalance >= 0 ? "text-teal-400" : "text-red-400", glowClass: "glow-cash" },
    { labelKey: "totalInvestment" as const,    value: totalInvestment, color: "border-l-purple-500",  textColor: "text-purple-400",  glowClass: "glow-investment" },
  ];

  // ── Recent Transactions ──────────────────────────────────────────────────────
  const recentTransactions = [
    ...income.map(i => ({ typeKey: "navIncome" as const,       text: i.text, amount: i.amount, date: i.date, colorClass: "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30" })),
    ...expense.map(i => ({ typeKey: "navExpense" as const,    text: i.text, amount: i.amount, date: i.date, colorClass: "text-red-400 bg-red-950/40 border border-red-900/30" })),
    ...donation.map(i => ({ typeKey: "navDonation" as const,     text: i.text, amount: i.amount, date: i.date, colorClass: "text-orange-400 bg-orange-950/40 border border-orange-900/30" })),
    ...withdraw.map(i => ({ typeKey: "navWithdraw" as const,text: i.text, amount: i.amount, date: i.date, colorClass: "text-cyan-400 bg-cyan-950/40 border border-cyan-900/30" })),
    ...investment.map(i => ({ typeKey: "navInvestment" as const,text: i.text, amount: i.amount, date: i.date, colorClass: "text-purple-400 bg-purple-950/40 border border-purple-900/30" })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // ── Chart Data (last 6 months) ────────────────────────────────────────────────
  const getChartData = () => {
    const monthsData: Record<string, { income: number; expense: number }> = {};
    const parseMonth = (d: string) => (d ? d.substring(0, 7) : "");

    income.forEach(item => {
      const m = parseMonth(item.date); if (!m) return;
      if (!monthsData[m]) monthsData[m] = { income: 0, expense: 0 };
      monthsData[m].income += item.amount;
    });
    expense.forEach(item => {
      const m = parseMonth(item.date); if (!m) return;
      if (!monthsData[m]) monthsData[m] = { income: 0, expense: 0 };
      monthsData[m].expense += item.amount;
    });

    return Object.keys(monthsData)
      .sort()
      .slice(-6)
      .map(m => {
        const [year, month] = m.split("-");
        return { month: `${month}/${year.slice(2)}`, rawMonth: m, ...monthsData[m] };
      });
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.flatMap(d => [d.income, d.expense]), 1000);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <BarChart3 className="w-6 h-6 text-emerald-400 animate-pulse" /> {t("dashboardTitle")}
        </h2>
      </div>

      {/* ── Summary Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {summaryCards.map((card) => (
          <Card
            key={card.labelKey}
            className={`border-l-4 ${card.color} p-4 flex flex-col justify-between hover:scale-102 hover:shadow-lg transition-all duration-300 ${card.glowClass}`}
          >
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
              {t(card.labelKey)}
            </span>
            <p className={`text-lg font-black mt-3 ${card.textColor}`}>
              {t("takaSymbol")} {card.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Chart + Recent ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Monthly Chart */}
        {chartData.length > 0 && (
          <Card className="lg:col-span-8">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-0">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                  <LineChart className="w-4 h-4 text-slate-400" /> {t("monthlyChartTitle")}
                </CardTitle>
                <CardDescription>{t("monthlyChartDesc")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full h-[230px]">
                <svg className="w-full h-full" viewBox="0 0 360 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[20, 65, 110, 155].map(y => (
                    <line key={y} x1="40" y1={y} x2="340" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray={y === 155 ? undefined : "3"} />
                  ))}
                  {/* Y axis labels */}
                  <text x="32" y="24" fill="#64748b" fontSize="8" textAnchor="end">{t("takaSymbol")}{maxVal.toLocaleString()}</text>
                  <text x="32" y="69" fill="#64748b" fontSize="8" textAnchor="end">{t("takaSymbol")}{(maxVal * 0.7).toLocaleString()}</text>
                  <text x="32" y="114" fill="#64748b" fontSize="8" textAnchor="end">{t("takaSymbol")}{(maxVal * 0.3).toLocaleString()}</text>
                  <text x="32" y="159" fill="#64748b" fontSize="8" textAnchor="end">{t("takaSymbol")}0</text>

                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>

                  {chartData.map((data, idx) => {
                    const x = 50 + idx * 48;
                    const bw = 14;
                    const ih = (data.income / maxVal) * 135;
                    const eh = (data.expense / maxVal) * 135;
                    return (
                      <g key={data.month}>
                        <rect x={x} y={155 - ih} width={bw} height={ih} fill="url(#incGrad)" rx="3"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onMouseEnter={() => setActiveTooltip({ month: data.month, type: "income", value: data.income, x: x + 7, y: 155 - ih })}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />
                        <rect x={x + 16} y={155 - eh} width={bw} height={eh} fill="url(#expGrad)" rx="3"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onMouseEnter={() => setActiveTooltip({ month: data.month, type: "expense", value: data.expense, x: x + 23, y: 155 - eh })}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />
                        <text x={x + 15} y="174" fill="#64748b" fontSize="8" textAnchor="middle">{data.month}</text>
                      </g>
                    );
                  })}
                </svg>

                {activeTooltip && (
                  <div
                    className="absolute z-10 bg-[#0e1626] border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-xl text-center text-xs space-y-0.5 -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{ left: `${(activeTooltip.x / 360) * 100}%`, top: `${(activeTooltip.y / 200) * 100 - 4}%` }}
                  >
                    <p className="text-slate-400 font-bold text-[9px]">{activeTooltip.month}</p>
                    <p className={`font-black ${activeTooltip.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {activeTooltip.type === "income" ? t("navIncome") : t("navExpense")}: {t("takaSymbol")}{activeTooltip.value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-6 text-[10px] font-bold pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600 block" />
                  <span className="text-slate-300 uppercase tracking-wider">{t("totalIncome")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 block" />
                  <span className="text-slate-300 uppercase tracking-wider">{t("totalExpense")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className={`${chartData.length > 0 ? "lg:col-span-4" : "lg:col-span-12"} flex flex-col`}>
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
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────────────── */}
      {(totalIncome > 0 || totalExpense > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="flex items-center gap-2 text-xs font-bold mt-1.5">
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
                {t("recordsCount", { count: income.length + expense.length + donation.length + withdraw.length + investment.length })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
