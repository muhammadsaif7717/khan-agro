import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "রি-ইনভেস্টমেন্ট | Khan Agro Farm" };

export default function ReinvestmentPage() {
  return (
    <RecordTab
      type="reinvestment"
      titleKey="addReinvestment"
      placeholderKey="reinvestmentPlaceholder"
      accentClass="text-amber-400"
      borderHoverClass="hover:border-amber-500/30"
      buttonLabelKey="reinvestmentConfirm"
    />
  );
}
