import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curate",
  description:
    "Explore Tedlyns corporate catering, artisan bakery, and curated gifting services in Abuja.",
};

export default function CurateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
