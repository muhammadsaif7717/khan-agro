import RecordTab from "@/components/RecordTab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "দান | Khan Agro Farm" };

export default function DonationPage() {
  return (
    <RecordTab
      type="donation"
      titleKey="addDonation"
      placeholderKey="donationPlaceholder"
      accentClass="text-orange-400"
      borderHoverClass="hover:border-orange-500/30"
      buttonLabelKey="donationConfirm"
    />
  );
}
