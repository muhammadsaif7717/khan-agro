"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Calculator, 
  Trash2, 
  RotateCcw, 
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CalculatorPage() {
  const { t } = useApp();

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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <Calculator className="w-6 h-6 text-emerald-400 animate-spin-slow" /> {t("navCalculator")}
        </h2>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Calculator Card */}
        <Card className="md:col-span-7 bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl rounded-3xl p-5 overflow-hidden">
          {/* Screen */}
          <div className="bg-[#070b13] border border-slate-800/60 rounded-2xl p-4 text-right mb-5 relative min-h-[92px] flex flex-col justify-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black absolute top-2 left-3">
              Digital Display
            </span>
            <div className="text-slate-450 font-mono text-sm tracking-wide break-all min-h-[20px] select-none">
              {calcInput || "0"}
            </div>
            <div className="text-emerald-400 font-mono text-3xl font-black mt-1 break-all select-all">
              {calcResult || "0"}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* AC, Back, Division, Multiplication */}
            <Button onClick={() => handleCalcClick("AC")} variant="destructive" className="h-12 text-sm font-bold rounded-xl">AC</Button>
            <Button onClick={() => handleCalcClick("C")} variant="secondary" className="h-12 text-sm font-bold rounded-xl flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button onClick={() => handleCalcClick("/")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">/</Button>
            <Button onClick={() => handleCalcClick("*")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">*</Button>

            {/* 7, 8, 9, Subtraction */}
            <Button onClick={() => handleCalcClick("7")} variant="default" className="h-12 text-sm font-bold rounded-xl">7</Button>
            <Button onClick={() => handleCalcClick("8")} variant="default" className="h-12 text-sm font-bold rounded-xl">8</Button>
            <Button onClick={() => handleCalcClick("9")} variant="default" className="h-12 text-sm font-bold rounded-xl">9</Button>
            <Button onClick={() => handleCalcClick("-")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">-</Button>

            {/* 4, 5, 6, Addition */}
            <Button onClick={() => handleCalcClick("4")} variant="default" className="h-12 text-sm font-bold rounded-xl">4</Button>
            <Button onClick={() => handleCalcClick("5")} variant="default" className="h-12 text-sm font-bold rounded-xl">5</Button>
            <Button onClick={() => handleCalcClick("6")} variant="default" className="h-12 text-sm font-bold rounded-xl">6</Button>
            <Button onClick={() => handleCalcClick("+")} variant="secondary" className="h-12 text-lg font-bold rounded-xl">+</Button>

            {/* 1, 2, 3, Equals */}
            <Button onClick={() => handleCalcClick("1")} variant="default" className="h-12 text-sm font-bold rounded-xl">1</Button>
            <Button onClick={() => handleCalcClick("2")} variant="default" className="h-12 text-sm font-bold rounded-xl">2</Button>
            <Button onClick={() => handleCalcClick("3")} variant="default" className="h-12 text-sm font-bold rounded-xl">3</Button>
            <Button onClick={() => handleCalcClick("=")} variant="emerald" className="h-28 text-lg font-bold rounded-xl row-span-2 flex items-center justify-center">=</Button>

            {/* 0, Dot */}
            <Button onClick={() => handleCalcClick("0")} variant="default" className="h-12 text-sm font-bold rounded-xl col-span-2">0</Button>
            <Button onClick={() => handleCalcClick(".")} variant="default" className="h-12 text-sm font-bold rounded-xl">.</Button>
          </div>
        </Card>

        {/* History Card */}
        <Card className="md:col-span-5 flex flex-col max-h-[350px] md:max-h-[420px] bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl rounded-3xl p-5 overflow-hidden">
          <CardHeader className="p-0 pb-3 border-b border-slate-850">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-400" /> {t("calcHistory")}
              </span>
              {calcHistory.length > 0 && (
                <Button onClick={() => setCalcHistory([])} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto p-0 pt-4 flex-1">
            <div className="space-y-2">
              {calcHistory.map((item, idx) => (
                <div key={idx} className="font-mono text-xs text-slate-300 py-2 border-b border-slate-800/40 last:border-0 break-all select-all">
                  {item}
                </div>
              ))}
              {calcHistory.length === 0 && (
                <p className="text-slate-550 text-xs text-center py-16">{t("calcNoHistory")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
