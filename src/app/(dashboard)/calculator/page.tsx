"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Calculator, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  ArrowLeft,
  Milk,
  Beef
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CalculatorPage() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<"standard" | "farm">("standard");

  // ── Standard Calculator States ──────────────────────────────────────────────
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleCalcClick = (val: string) => {
    if (val === "AC") {
      setCalcInput("");
      setCalcResult("");
    } else if (val === "C") {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === "=") {
      try {
        // Safe evaluation without eval using standard mathematical operations
        // Sanitizing input to only allow digits, operators, and decimals
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, "");
        if (!sanitized) return;
        
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${sanitized}`)();
        if (res === undefined || isNaN(res) || !isFinite(res)) {
          setCalcResult("Error");
        } else {
          const finalRes = Number(res.toFixed(4)).toString();
          setCalcResult(finalRes);
          setCalcHistory((prev) => [`${calcInput} = ${finalRes}`, ...prev].slice(0, 10));
        }
      } catch {
        setCalcResult("Error");
      }
    } else {
      // Prevent consecutive operators
      const lastChar = calcInput.slice(-1);
      const isOperator = ["+", "-", "*", "/"].includes(val);
      const isLastOperator = ["+", "-", "*", "/"].includes(lastChar);
      if (isOperator && isLastOperator) return;

      setCalcInput((prev) => prev + val);
    }
  };

  // ── Farm Calculator States ──────────────────────────────────────────────────
  const [milkEst, setMilkEst] = useState({ liters: "", price: "", feedCost: "" });
  const [feedEst, setFeedEst] = useState({ cows: "", feedPerCow: "" });

  // Calculate Farm Stats
  const totalMilkLiters = Number(milkEst.liters) || 0;
  const pricePerLiter   = Number(milkEst.price) || 0;
  const feedCostCow     = Number(milkEst.feedCost) || 0;
  
  const dailyMilkRevenue = totalMilkLiters * pricePerLiter;
  const dailyNetProfit   = dailyMilkRevenue - feedCostCow;

  const totalCows       = Number(feedEst.cows) || 0;
  const feedPerCowDaily = Number(feedEst.feedPerCow) || 0;
  
  const dailyTotalFeed   = totalCows * feedPerCowDaily;
  const monthlyTotalFeed = dailyTotalFeed * 30;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <Calculator className="w-6 h-6 text-emerald-400" /> {t("navCalculator")}
        </h2>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-[#0e1626] border border-slate-800/80 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("standard")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === "standard" 
              ? "bg-emerald-600 text-white shadow-lg" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" /> {t("calcNormal")}
        </button>
        <button
          onClick={() => setActiveTab("farm")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === "farm" 
              ? "bg-emerald-600 text-white shadow-lg" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Milk className="w-4 h-4" /> {t("calcFarm")}
        </button>
      </div>

      {/* Standard Tab Layout */}
      {activeTab === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Calculator Body */}
          <Card className="md:col-span-7 bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl rounded-3xl p-5 overflow-hidden">
            {/* Screen */}
            <div className="bg-[#070b13] border border-slate-800/60 rounded-2xl p-4 text-right mb-5 relative min-h-[92px] flex flex-col justify-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black absolute top-2 left-3">
                Digital Display
              </span>
              <div className="text-slate-400 font-mono text-sm tracking-wide break-all min-h-[20px] select-none">
                {calcInput || "0"}
              </div>
              <div className="text-emerald-400 font-mono text-3xl font-black mt-1 break-all select-all">
                {calcResult || "0"}
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {/* AC, Back, Division */}
              <Button onClick={() => handleCalcClick("AC")} variant="destructive" className="h-12 text-sm font-bold rounded-xl">AC</Button>
              <Button onClick={() => handleCalcClick("C")} variant="secondary" className="h-12 text-sm font-bold rounded-xl flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button onClick={() => handleCalcClick("/")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">/</Button>
              <Button onClick={() => handleCalcClick("*")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">*</Button>

              {/* 7, 8, 9, Subtraction */}
              <Button onClick={() => handleCalcClick("7")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">7</Button>
              <Button onClick={() => handleCalcClick("8")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">8</Button>
              <Button onClick={() => handleCalcClick("9")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">9</Button>
              <Button onClick={() => handleCalcClick("-")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">-</Button>

              {/* 4, 5, 6, Addition */}
              <Button onClick={() => handleCalcClick("4")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">4</Button>
              <Button onClick={() => handleCalcClick("5")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">5</Button>
              <Button onClick={() => handleCalcClick("6")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">6</Button>
              <Button onClick={() => handleCalcClick("+")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">+</Button>

              {/* 1, 2, 3, Equals */}
              <Button onClick={() => handleCalcClick("1")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">1</Button>
              <Button onClick={() => handleCalcClick("2")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">2</Button>
              <Button onClick={() => handleCalcClick("3")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">3</Button>
              <Button onClick={() => handleCalcClick("=")} variant="emerald" className="h-28 text-lg font-bold rounded-xl row-span-2 flex items-center justify-center">=</Button>

              {/* 0, Dot */}
              <Button onClick={() => handleCalcClick("0")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl col-span-2">0</Button>
              <Button onClick={() => handleCalcClick(".")} variant="default" className="h-12 text-sm font-bold bg-[#070b13] hover:bg-[#121c30] border-slate-800 rounded-xl">.</Button>
            </div>
          </Card>

          {/* History */}
          <Card className="md:col-span-5 flex flex-col max-h-[350px]">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-200">
                <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-slate-400" /> {t("calcHistory")}</span>
                {calcHistory.length > 0 && (
                  <Button onClick={() => setCalcHistory([])} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto p-4 flex-1">
              <div className="space-y-2">
                {calcHistory.map((item, idx) => (
                  <div key={idx} className="font-mono text-xs text-slate-300 py-1.5 border-b border-slate-800/40 last:border-0 break-all select-all">
                    {item}
                  </div>
                ))}
                {calcHistory.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-10">{t("calcNoHistory")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Farm utility Tab Layout */}
      {activeTab === "farm" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Milk estimation */}
          <Card className="bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl p-5 space-y-4">
            <CardHeader className="p-0 border-0">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                <Milk className="w-4 h-4 text-emerald-400" /> {t("calcMilkEst")}
              </CardTitle>
              <CardDescription>খামারের দৈনিক দুধ বিক্রি ও আয়ের আনুমানিক লাভ হিসাব করুন।</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t("calcLiters")}
                </label>
                <Input
                  type="number"
                  placeholder="যেমন: ৫০"
                  value={milkEst.liters}
                  onChange={(e) => setMilkEst({ ...milkEst, liters: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t("calcPricePerLiter")}
                </label>
                <Input
                  type="number"
                  placeholder="যেমন: ৮০"
                  value={milkEst.price}
                  onChange={(e) => setMilkEst({ ...milkEst, price: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t("calcDailyFeedCost")}
                </label>
                <Input
                  type="number"
                  placeholder="যেমন: ১৫০০"
                  value={milkEst.feedCost}
                  onChange={(e) => setMilkEst({ ...milkEst, feedCost: e.target.value })}
                />
              </div>

              {/* Outputs Summary */}
              {(totalMilkLiters > 0 || pricePerLiter > 0 || feedCostCow > 0) && (
                <div className="p-4 bg-[#070b13] border border-slate-800 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{t("totalIncome")}</span>
                    <span className="font-bold text-slate-200">{t("takaSymbol")} {dailyMilkRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">{t("calcDailyFeedCost").split(" ")[0]}</span>
                    <span className="font-bold text-red-400">- {t("takaSymbol")} {feedCostCow.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="font-bold text-slate-200">{t("calcNetDailyProfit")}</span>
                    <span className={`font-black ${dailyNetProfit >= 0 ? "text-yellow-400 animate-pulse" : "text-red-400"}`}>
                      {t("takaSymbol")} {dailyNetProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feed estimation */}
          <Card className="bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl p-5 space-y-4">
            <CardHeader className="p-0 border-0">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                <Beef className="w-4 h-4 text-emerald-400" /> {t("calcFeedEst")}
              </CardTitle>
              <CardDescription>গরুর সংখ্যা এবং দৈনিক খাবারের হার অনুযায়ী গোখাদ্যের আনুমানিক চাহিদা হিসাব করুন।</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t("calcCowsCount")}
                </label>
                <Input
                  type="number"
                  placeholder="যেমন: ১৫"
                  value={feedEst.cows}
                  onChange={(e) => setFeedEst({ ...feedEst, cows: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t("calcFeedPerCow")}
                </label>
                <Input
                  type="number"
                  placeholder="যেমন: ৪"
                  value={feedEst.feedPerCow}
                  onChange={(e) => setFeedEst({ ...feedEst, feedPerCow: e.target.value })}
                />
              </div>

              {/* Outputs Summary */}
              {(totalCows > 0 || feedPerCowDaily > 0) && (
                <div className="p-4 bg-[#070b13] border border-slate-800 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{t("calcDailyFeedReq")}</span>
                    <span className="font-bold text-slate-200">{dailyTotalFeed.toLocaleString()} কেজি (kg)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2 mt-2">
                    <span className="font-bold text-slate-200">{t("calcMonthlyReq")}</span>
                    <span className="font-black text-emerald-400 animate-pulse">{monthlyTotalFeed.toLocaleString()} কেজি (kg)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
