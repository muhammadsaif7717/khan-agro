"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Calculator, 
  Trash2, 
  RotateCcw, 
  ArrowLeft,
  Copy,
  Percent,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CalculatorPage() {
  const { t, language } = useApp();

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCalcClick = (val: string) => {
    if (val === "AC") {
      setCalcInput("");
      setCalcResult("");
    } else if (val === "C") {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === "=") {
      try {
        if (!calcInput) return;
        
        // Parse and safely evaluate percent (%) by replacing with /100
        const sanitized = calcInput
          .replace(/[^0-9+\-*/.()%]/g, "")
          .replace(/%/g, "/100");
        
        if (!sanitized) return;

        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${sanitized}`)();
        
        if (res === undefined || isNaN(res) || !isFinite(res)) {
          setCalcResult("Error");
        } else {
          const finalRes = Number(res.toFixed(4)).toString();
          setCalcResult(finalRes);
          setCalcHistory((prev) => [`${calcInput} = ${finalRes}`, ...prev].slice(0, 15));
        }
      } catch {
        setCalcResult("Error");
      }
    } else {
      // Input Validation
      const lastChar = calcInput.slice(-1);
      const isOperator = ["+", "-", "*", "/"].includes(val);
      const isLastOperator = ["+", "-", "*", "/"].includes(lastChar);
      
      // Prevent consecutive operators
      if (isOperator && isLastOperator) return;

      setCalcInput((prev) => prev + val);
    }
  };

  const handleToggleSign = () => {
    if (calcResult && calcResult !== "Error") {
      if (calcResult.startsWith("-")) {
        setCalcResult(calcResult.substring(1));
      } else {
        setCalcResult("-" + calcResult);
      }
      return;
    }

    if (!calcInput) {
      setCalcInput("-");
      return;
    }

    // Match the last numerical sequence at the end of the input (possibly signed)
    const match = calcInput.match(/(-?[0-9.]+)$/);
    if (match) {
      const lastNum = match[0];
      const rest = calcInput.slice(0, -lastNum.length);
      if (lastNum.startsWith("-")) {
        setCalcInput(rest + lastNum.substring(1));
      } else {
        setCalcInput(rest + "-" + lastNum);
      }
    } else {
      setCalcInput((prev) => prev + "-");
    }
  };

  const handleHistoryClick = (item: string) => {
    const parts = item.split("=");
    if (parts.length > 0) {
      setCalcInput(parts[0].trim());
      setCalcResult("");
    }
  };

  const handleCopyHistory = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <Calculator className="w-6 h-6 text-emerald-400 animate-spin-slow" /> 
          {language === "bn" ? "অ্যাডভান্সড হিসাবরক্ষক ক্যালকুলেটর" : "Advanced Accounting Calculator"}
        </h2>
        <span className="text-[10px] text-slate-450 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full">
          {language === "bn" ? "অ্যাকাউন্টিং মোড" : "Accounting Mode"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Main Advanced Calculator Layout Card */}
        <Card className="md:col-span-7 bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl rounded-3xl p-5 overflow-hidden">
          
          {/* LED Display Screen */}
          <div className="bg-[#070b13] border border-slate-800/60 rounded-2xl p-4 text-right mb-5 relative min-h-[110px] flex flex-col justify-end shadow-inner">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black absolute top-2 left-3">
              LED DIGITAL SCREEN
            </span>
            <div className="text-slate-400 font-mono text-base tracking-wide break-all min-h-[24px]">
              {calcInput || "0"}
            </div>
            <div className="text-emerald-400 font-mono text-3xl font-black mt-2 break-all">
              {calcResult || "0"}
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Row 1: AC, Parentheses, Percentage */}
            <Button onClick={() => handleCalcClick("AC")} variant="destructive" className="h-12 text-sm font-black rounded-xl hover:scale-102 transition-transform">
              AC
            </Button>
            <Button onClick={() => handleCalcClick("(")} variant="secondary" className="h-12 text-sm font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">
              (
            </Button>
            <Button onClick={() => handleCalcClick(")")} variant="secondary" className="h-12 text-sm font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">
              )
            </Button>
            <Button onClick={() => handleCalcClick("%")} variant="secondary" className="h-12 text-sm font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </Button>

            {/* Row 2: 7, 8, 9, Division */}
            <Button onClick={() => handleCalcClick("7")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">7</Button>
            <Button onClick={() => handleCalcClick("8")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">8</Button>
            <Button onClick={() => handleCalcClick("9")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">9</Button>
            <Button onClick={() => handleCalcClick("/")} variant="secondary" className="h-12 text-lg font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">/</Button>

            {/* Row 3: 4, 5, 6, Multiplication */}
            <Button onClick={() => handleCalcClick("4")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">4</Button>
            <Button onClick={() => handleCalcClick("5")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">5</Button>
            <Button onClick={() => handleCalcClick("6")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">6</Button>
            <Button onClick={() => handleCalcClick("*")} variant="secondary" className="h-12 text-lg font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">*</Button>

            {/* Row 4: 1, 2, 3, Subtraction */}
            <Button onClick={() => handleCalcClick("1")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">1</Button>
            <Button onClick={() => handleCalcClick("2")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">2</Button>
            <Button onClick={() => handleCalcClick("3")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">3</Button>
            <Button onClick={() => handleCalcClick("-")} variant="secondary" className="h-12 text-lg font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">-</Button>

            {/* Row 5: 0, Dot, Sign Toggle (+/-), Addition */}
            <Button onClick={() => handleCalcClick("0")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">0</Button>
            <Button onClick={() => handleCalcClick(".")} variant="default" className="h-12 text-sm font-bold rounded-xl hover:scale-102 transition-transform">.</Button>
            <Button onClick={handleToggleSign} variant="default" className="h-12 text-sm font-bold rounded-xl text-emerald-400 hover:scale-102 transition-transform">+/-</Button>
            <Button onClick={() => handleCalcClick("+")} variant="secondary" className="h-12 text-lg font-black rounded-xl text-emerald-400 hover:scale-102 transition-transform">+</Button>

            {/* Row 6: C (Backspace), = (Equals) */}
            <Button onClick={() => handleCalcClick("C")} variant="secondary" className="h-12 text-sm font-black rounded-xl flex items-center justify-center col-span-2 hover:scale-102 transition-transform">
              <ArrowLeft className="w-4 h-4 text-emerald-400 mr-1" /> Backspace
            </Button>
            <Button onClick={() => handleCalcClick("=")} variant="emerald" className="h-12 text-lg font-black rounded-xl col-span-2 hover:scale-102 transition-transform">
              =
            </Button>
          </div>
        </Card>

        {/* Dynamic Reuse History Dashboard Card */}
        <Card className="md:col-span-5 flex flex-col max-h-[420px] bg-[#0e1626]/60 backdrop-blur border-slate-800/80 shadow-2xl rounded-3xl p-5 overflow-hidden">
          <CardHeader className="p-0 pb-3 border-b border-slate-800/60">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5 font-black">
                <RotateCcw className="w-4 h-4 text-slate-450" /> 
                {language === "bn" ? "হিসাবের ইতিহাস" : "Calculation History"}
              </span>
              {calcHistory.length > 0 && (
                <Button onClick={() => setCalcHistory([])} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
            <p className="text-[9px] text-slate-450 mt-1 font-semibold uppercase tracking-wider">
              {language === "bn" ? "পুনরায় ব্যবহার করতে আইটেমের উপর ক্লিক করুন" : "Click on any item to reload or reuse"}
            </p>
          </CardHeader>
          <CardContent className="overflow-y-auto p-0 pt-4 flex-1">
            <div className="space-y-2">
              {calcHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between font-mono text-xs text-slate-300 py-2.5 px-3 rounded-xl border border-transparent hover:border-slate-850 hover:bg-[#070b13]/55 transition-all cursor-pointer"
                  onClick={() => handleHistoryClick(item)}
                >
                  <span className="break-all select-all flex-1 font-bold pr-2">{item}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyHistory(item, idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all shrink-0"
                    title="Copy calculation"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
              {calcHistory.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-20">
                  {language === "bn" ? "কোনো ইতিহাস নেই।" : "No calculations recorded."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
