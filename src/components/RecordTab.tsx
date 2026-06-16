"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { FarmData, RecordItem } from "@/lib/types";
import { Search, CheckCircle2, Trash2, Calendar, TrendingUp, TrendingDown, Gift, Landmark, Briefcase, Coins, Undo2, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslationKey } from "@/lib/translations";

interface RecordTabProps {
  type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">;
  titleKey: TranslationKey;
  placeholderKey: TranslationKey;
  accentClass: string;         // e.g. "text-emerald-400"
  borderHoverClass: string;    // e.g. "hover:border-emerald-500/30"
  buttonLabelKey: TranslationKey;
}

const ICON_MAP = {
  income: TrendingUp,
  expense: TrendingDown,
  donation: Gift,
  withdraw: Landmark,
  investment: Briefcase,
  reinvestment: Coins,
  returnedCash: Undo2,
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function filterRecords(list: RecordItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [...list].reverse().map((item, i) => ({ item, origIdx: list.length - 1 - i }));
  return [...list]
    .map((item, origIdx) => ({ item, origIdx }))
    .filter(({ item }) =>
      item.text.toLowerCase().includes(q) ||
      item.date.includes(q) ||
      String(item.amount).includes(q)
    )
    .reverse();
}

export default function RecordTab({
  type, titleKey, placeholderKey, accentClass, borderHoverClass, buttonLabelKey,
}: RecordTabProps) {
  const {
    isDbConnected,
    addItem,
    deleteItem,
    income,
    expense,
    donation,
    withdraw,
    investment,
    reinvestment,
    returnedCash,
    savedTotals,
    saveAndResetCategory,
    deleteSavedTotal,
    t,
    language,
    showConfirm
  } = useApp();

  const [activeType, setActiveType] = useState<Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">>(type);
  const [form, setForm] = useState<{
    text: string;
    amount: string;
    date: string;
    investmentType?: "investment" | "reinvestment";
  }>({
    text: "",
    amount: "",
    date: getTodayDate(),
    investmentType: type === "reinvestment" ? "reinvestment" : "investment"
  });
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [resetNote, setResetNote] = useState("");

  // Sync activeType when type prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveType(type);
    setForm(prev => ({
      ...prev,
      investmentType: type === "reinvestment" ? "reinvestment" : "investment"
    }));
  }, [type]);



  const Icon = ICON_MAP[activeType] || Briefcase;
  
  // Pick the correct list based on activeType
  const listMap: Record<Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, RecordItem[]> = {
    income, expense, donation, withdraw, investment, reinvestment, returnedCash
  };
  const list: RecordItem[] = listMap[activeType] || [];

  const filtered = filterRecords(list, query);
  const total = list.reduce((s, i) => s + i.amount, 0);
  const filteredTotal = filtered.reduce((s, { item }) => s + item.amount, 0);

  // Saved Totals calculation
  const savedList = savedTotals[activeType] || [];
  const savedTotalSum = savedList.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = total + savedTotalSum;

  const percent = total > 0 ? (filteredTotal / total) * 100 : 0;
  const formattedPercent = percent.toFixed(2);
  const localizedPercent = language === "bn"
    ? formattedPercent.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) + "%"
    : formattedPercent + "%";

  const currentAccentClass = (activeType === "investment") 
    ? "text-purple-400" 
    : (activeType === "reinvestment") 
      ? "text-amber-400" 
      : accentClass;

  const currentBorderHoverClass = (activeType === "investment")
    ? "hover:border-purple-500/30"
    : (activeType === "reinvestment")
      ? "hover:border-amber-500/30"
      : borderHoverClass;

  const handleAdd = async () => {
    if (!form.text.trim() || !form.amount) {
      showConfirm({
        message: t("pleaseFillAll"),
        type: "info",
        singleButton: true,
        onConfirm: () => {}
      });
      return;
    }
    setIsSaving(true);
    const submitType = activeType;
    await addItem(submitType, form.text, Number(form.amount), form.date || getTodayDate());
    setForm(prev => ({
      ...prev,
      text: "",
      amount: "",
      date: getTodayDate()
    }));
    setIsSaving(false);
  };

  const handleDelete = async (origIdx: number) => {
    showConfirm({
      message: t("confirmDelete"),
      type: "danger",
      onConfirm: async () => {
        await deleteItem(activeType, origIdx);
      }
    });
  };

  const handleSaveReset = async () => {
    if (total === 0) return;
    showConfirm({
      message: language === "bn" ? "আপনি কি নিশ্চিতভাবে এই মোট হিসাব সেভ করে সক্রিয় তালিকা রিসেট করতে চান?" : "Are you sure you want to save this total and reset active list?",
      type: "danger",
      onConfirm: async () => {
        await saveAndResetCategory(activeType, resetNote);
        setResetNote("");
      }
    });
  };

  const handleSavedDelete = async (idx: number) => {
    showConfirm({
      message: t("confirmDelete"),
      type: "danger",
      onConfirm: async () => {
        await deleteSavedTotal(activeType, idx);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Icon className={`w-6 h-6 ${currentAccentClass}`} /> 
            {activeType === "investment" ? t("navInvestment") : activeType === "reinvestment" ? t("navReinvestment") : t(titleKey)}
          </h2>
        </div>

        <div className="text-right flex items-center gap-6">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">{t("grandTotal")}</span>
            <span className={`text-lg font-black ${currentAccentClass}`}>{t("takaSymbol")} {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column (Form Card & Save & Reset Card) ── */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-0">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide text-text-primary">
                {t("recordEntry")}
              </CardTitle>
              <CardDescription>{t("recordEntryDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                  {activeType === "investment"
                    ? (language === "bn" ? "ব্যক্তির নাম" : "Investor's Name")
                    : t("descLabel")}
                </label>
                <Input
                  type="text"
                  placeholder={activeType === "investment" ? t("investmentPlaceholder") : activeType === "reinvestment" ? t("reinvestmentPlaceholder") : t(placeholderKey)}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>


              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                  {t("amountLabel")}
                </label>
                <Input
                  type="number"
                  placeholder={t("amountPlaceholder")}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                  {t("dateLabel")}
                </label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={isDbConnected === false || isSaving}
                variant="emerald"
                className="w-full h-11 text-xs rounded-xl mt-3 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {activeType === "investment" ? t("investmentConfirm") : activeType === "reinvestment" ? t("reinvestmentConfirm") : t(buttonLabelKey)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* ── Right Column (Records List & Saved History) ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-surface border-border focus:border-emerald-500 rounded-xl"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="w-4 h-4" />
            </span>
          </div>

          {query.trim() !== "" && (
            <div className="flex flex-col gap-2.5 px-4 py-3.5 bg-surface/80 border border-border rounded-xl animate-fade-in shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${currentAccentClass.replace("text-", "bg-")} shadow-[0_0_8px_currentColor] animate-pulse`} />
                  <span>
                    {language === "bn"
                      ? `${filtered.length} টি রেকর্ড পাওয়া গেছে`
                      : `${filtered.length} records found`}
                  </span>
                </span>
                <span className={`${currentAccentClass} font-black text-sm`}>
                  {language === "bn" ? "মোট: " : "Total: "} {t("takaSymbol")} {filteredTotal.toLocaleString()}
                </span>
              </div>
              
              {activeType === "investment" && total > 0 && (
                <div className="text-[11px] text-text-muted border-t border-border/60 pt-2 flex items-center justify-between font-bold">
                  <span>
                    {language === "bn" ? "বিনিয়োগকারী হিসাব বিশ্লেষণ" : "Investor Share Analysis"}
                  </span>
                  <span className="text-purple-400 font-extrabold">
                    {language === "bn" 
                      ? `এটি মোট বিনিয়োগের ${localizedPercent}` 
                      : `This is ${localizedPercent} of total investments`}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">
              {language === "bn" ? "চলতি সক্রিয় রেকর্ডসমূহ" : "Active Records"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(({ item, origIdx }) => (
                <Card
                  key={origIdx}
                  className={`p-4 bg-surface/80 flex justify-between items-center transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${currentBorderHoverClass}`}
                >
                  <div>
                    <p className="font-bold text-xs text-text-primary">{item.text}</p>
                    <p className={`font-black text-sm mt-0.5 ${currentAccentClass}`}>{t("takaSymbol")} {item.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> {item.date || ""}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(origIdx)}
                    disabled={isDbConnected === false}
                    variant="destructive"
                    size="icon"
                    className="rounded-xl shrink-0 h-9 w-9 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-text-muted text-sm py-8 bg-surface/40 rounded-xl border border-border/40">
                  {t("noRecords")}
                </p>
              )}
            </div>
          </div>

          {/* ── Saved Totals History Section ── */}
          {savedList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/80">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                {t("savedTotalsTitle")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                {savedList.map((savedItem, sIdx) => (
                  <Card
                    key={sIdx}
                    className="p-4 bg-surface/40 border-border flex justify-between items-center transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div>
                      <p className="font-bold text-xs text-text-primary">{savedItem.note}</p>
                      <p className={`font-black text-sm mt-0.5 ${currentAccentClass}`}>{t("takaSymbol")} {savedItem.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5" /> {savedItem.date || ""}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSavedDelete(sIdx)}
                      disabled={isDbConnected === false}
                      variant="destructive"
                      size="icon"
                      className="rounded-xl shrink-0 h-9 w-9 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
