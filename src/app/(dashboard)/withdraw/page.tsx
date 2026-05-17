import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "উত্তোলন | Khan Agro Farm" };

export default function WithdrawPage() {
  return (
    <RecordTab
      type="withdraw"
      titleKey="addWithdraw"
      placeholderKey="withdrawPlaceholder"
      accentClass="text-cyan-400"
      borderHoverClass="hover:border-cyan-500/30"
      buttonLabelKey="withdrawConfirm"
    />
  );
}
