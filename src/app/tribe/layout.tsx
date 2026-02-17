import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ted's Tribe",
  description:
    "Profits with Purpose — Tedlyns CSR mission, Kindred Spirits community, and Nigerian Red Cross partnership.",
};

export default function TribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
