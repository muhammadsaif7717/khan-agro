import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "রিটার্ন ক্যাশ | Khan Agro Farm" };

export default function ReturnedCashPage() {
  return (
    <RecordTab
      type="returnedCash"
      titleKey="addReturnedCash"
      placeholderKey="returnedCashPlaceholder"
      accentClass="text-rose-400"
      borderHoverClass="hover:border-rose-500/30"
      buttonLabelKey="returnedCashConfirm"
    />
  );
}
