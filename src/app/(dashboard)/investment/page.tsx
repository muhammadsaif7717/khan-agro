import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ইনভেস্টমেন্ট | Khan Agro Farm" };

export default function InvestmentPage() {
  return (
    <RecordTab
      type="investment"
      titleKey="addInvestment"
      placeholderKey="investmentPlaceholder"
      accentClass="text-purple-400"
      borderHoverClass="hover:border-purple-500/30"
      buttonLabelKey="investmentConfirm"
    />
  );
}
