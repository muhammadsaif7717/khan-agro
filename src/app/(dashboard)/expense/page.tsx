import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ব্যয় | Khan Agro Farm" };

export default function ExpensePage() {
  return (
    <RecordTab
      type="expense"
      titleKey="addExpense"
      placeholderKey="expensePlaceholder"
      accentClass="text-red-400"
      borderHoverClass="hover:border-red-500/30"
      buttonLabelKey="expenseConfirm"
    />
  );
}
