import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "আয় | Khan Agro Farm" };

export default function IncomePage() {
  return (
    <RecordTab
      type="income"
      titleKey="addIncome"
      placeholderKey="incomePlaceholder"
      accentClass="text-emerald-400"
      borderHoverClass="hover:border-emerald-500/30"
      buttonLabelKey="incomeConfirm"
    />
  );
}
