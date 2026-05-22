"use client";

import { useApp } from "@/context/AppContext";
import { 
  BarChart3, 
  History,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordItem, FarmData } from "@/lib/types";

export default function DashboardContent() {
  const {
    income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals,
    t, language, setReturnedCashOffset, deleteHistorySession
  } = useApp();

  const handleResetReturnedCash = async (amount: number) => {
    if (amount <= 0) return;
    if (!confirm(language === "bn" ? "আপনি কি নিশ্চিতভাবে রিটার্ন ক্যাশ 0 করতে চান?" : "Are you sure you want to reset Returned Cash to 0?")) return;
    await setReturnedCashOffset(amount);
  };

  // Helper to calculate active total (ignoring saved history)
  const getGrandTotalForType = (type: keyof FarmData, list: RecordItem[]) => {
    return list.reduce((s, i) => s + i.amount, 0);
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalIncome         = getGrandTotalForType("income", income);
  const totalExpense        = getGrandTotalForType("expense", expense);
  const totalDonation       = getGrandTotalForType("donation", donation);
  const totalWithdraw       = getGrandTotalForType("withdraw", withdraw);
  const totalInvestment     = getGrandTotalForType("investment", investment);
  const totalReinvestment   = getGrandTotalForType("reinvestment", reinvestment);

  const resetOffsetList = savedTotals["returnedCashOffset"] || [];
  const totalResetOffset = resetOffsetList.reduce((s, i) => s + i.amount, 0);

  const profit = totalIncome - totalExpense; // total profit = total income - total expense
  const recentProfit = profit - (totalDonation + totalWithdraw); // recent profit = total profit - (donation + withdrawal)
  const returnedCashVal = (totalIncome - profit) - totalResetOffset; // returned cash = (total income - total profit) - offset
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

  // ── Compute History Sessions ──────────────────────────────────────────────────
  const sessionsMap: Record<string, { date: string; note: string; [key: string]: string | number }> = {};
  const categories = ["income", "expense", "donation", "withdraw", "investment", "reinvestment", "returnedCash"] as const;

  categories.forEach((cat) => {
    const items = savedTotals[cat] || [];
    items.forEach((item) => {
      const key = `${item.date}-${item.note}`;
      if (!sessionsMap[key]) {
        sessionsMap[key] = { date: item.date, note: item.note || "" };
        categories.forEach(c => sessionsMap[key][c] = 0);
      }
      (sessionsMap[key][cat] as number) += item.amount;
    });
  });

  const historySessions = Object.values(sessionsMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeleteSession = async (date: string, note: string) => {
    if (!confirm(language === "bn" ? "এই ইতিহাস মুছে ফেলতে চান?" : "Delete this history record?")) return;
    await deleteHistorySession(date, note);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
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
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-tight">
                {t(card.labelKey)}
              </span>
              {card.labelKey === "calcReturnCash" && (
                <button
                  onClick={() => handleResetReturnedCash(card.value)}
                  className="bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors"
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

      {/* ── History Section ────────────────────────────────────────────────────── */}
      {historySessions.length > 0 && (
        <Card className="mt-8 border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-text-primary">
              <History className="w-5 h-5 text-indigo-400" /> {t("historyTitle")}
            </CardTitle>
            <CardDescription>{t("historyDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-surface-hover/50 text-xs uppercase font-bold text-text-muted">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">{t("dateLabel")}</th>
                    <th className="px-4 py-3">{t("descLabel")}</th>
                    <th className="px-4 py-3 text-emerald-400">{t("navIncome")}</th>
                    <th className="px-4 py-3 text-red-400">{t("navExpense")}</th>
                    <th className="px-4 py-3 text-yellow-400">{t("totalProfit")}</th>
                    <th className="px-4 py-3 text-purple-400">{t("navDonation")}</th>
                    <th className="px-4 py-3 text-orange-400">{t("navWithdraw")}</th>
                    <th className="px-4 py-3 text-blue-400">{t("navInvestment")}</th>
                    <th className="px-4 py-3 text-cyan-400">{t("navReinvestment")}</th>
                    <th className="px-4 py-3 text-rose-400">{t("navReturnedCash")}</th>
                    <th className="px-4 py-3 rounded-tr-lg text-text-muted text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {historySessions.map((session, idx) => {
                    const inc = session.income as number;
                    const exp = session.expense as number;
                    const prof = inc - exp;
                    return (
                      <tr key={idx} className="hover:bg-surface-hover/50 transition-colors group">
                        <td className="px-4 py-4 font-medium whitespace-nowrap">{session.date}</td>
                        <td className="px-4 py-4 text-xs text-text-muted">{session.note}</td>
                        <td className="px-4 py-4 font-bold text-emerald-400">{t("takaSymbol")}{inc.toLocaleString()}</td>
                        <td className="px-4 py-4 font-bold text-red-400">{t("takaSymbol")}{exp.toLocaleString()}</td>
                        <td className={`px-4 py-4 font-bold ${prof >= 0 ? "text-yellow-400" : "text-red-400"}`}>{t("takaSymbol")}{prof.toLocaleString()}</td>
                        <td className="px-4 py-4">{t("takaSymbol")}{(session.donation as number).toLocaleString()}</td>
                        <td className="px-4 py-4">{t("takaSymbol")}{(session.withdraw as number).toLocaleString()}</td>
                        <td className="px-4 py-4">{t("takaSymbol")}{(session.investment as number).toLocaleString()}</td>
                        <td className="px-4 py-4">{t("takaSymbol")}{(session.reinvestment as number).toLocaleString()}</td>
                        <td className="px-4 py-4">{t("takaSymbol")}{(session.returnedCash as number).toLocaleString()}</td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleDeleteSession(session.date, session.note as string)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-200 opacity-60 group-hover:opacity-100"
                            title={language === "bn" ? "মুছুন" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
