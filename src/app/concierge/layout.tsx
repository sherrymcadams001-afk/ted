import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concierge",
  description: "Your direct line to the Chef. Live chat with Tedlyns concierge.",
};

export default function ConciergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
