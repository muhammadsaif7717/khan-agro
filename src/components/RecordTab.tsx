"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { FarmData, RecordItem } from "@/lib/types";
import { Search, CheckCircle2, Trash2, Calendar, TrendingUp, TrendingDown, Gift, Landmark, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslationKey } from "@/lib/translations";

interface RecordTabProps {
  type: keyof FarmData;
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
  const { isDbConnected, addItem, deleteItem, income, expense, donation, withdraw, investment, t } = useApp();

  const Icon = ICON_MAP[type];
  
  // Pick the correct list based on type
  const listMap: Record<keyof FarmData, RecordItem[]> = { income, expense, donation, withdraw, investment };
  const list: RecordItem[] = listMap[type];

  const [form, setForm] = useState({ text: "", amount: "", date: getTodayDate() });
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filtered = filterRecords(list, query);
  const total = list.reduce((s, i) => s + i.amount, 0);

  const handleAdd = async () => {
    if (!form.text.trim() || !form.amount) {
      alert(t("pleaseFillAll"));
      return;
    }
    setIsSaving(true);
    await addItem(type, form.text, Number(form.amount), form.date || getTodayDate());
    setForm({ text: "", amount: "", date: getTodayDate() });
    setIsSaving(false);
  };

  const handleDelete = async (origIdx: number) => {
    if (!confirm(t("confirmDelete"))) return;
    await deleteItem(type, origIdx);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <Icon className={`w-6 h-6 ${accentClass}`} /> {t(titleKey)}
        </h2>
        <span className={`text-sm font-black ${accentClass}`}>{t("takaSymbol")} {total.toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Shadcn Form Card ── */}
        <Card className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
          <CardHeader className="pb-3 border-0">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide text-slate-200">
              {t("recordEntry")}
            </CardTitle>
            <CardDescription>{t("recordEntryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t("descLabel")}
              </label>
              <Input
                type="text"
                placeholder={t(placeholderKey)}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
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
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
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
                  <CheckCircle2 className="w-4 h-4" /> {t(buttonLabelKey)}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Shadcn Records List ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-[#0e1626] border-slate-800 focus:border-emerald-500 rounded-xl"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(({ item, origIdx }) => (
              <Card
                key={origIdx}
                className={`p-4 bg-[#0e1626]/80 flex justify-between items-center transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${borderHoverClass}`}
              >
                <div>
                  <p className="font-bold text-xs text-slate-200">{item.text}</p>
                  <p className={`font-black text-sm mt-0.5 ${accentClass}`}>{t("takaSymbol")} {item.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
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
              <p className="col-span-full text-center text-slate-500 text-sm py-16">
                {t("noRecords")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
