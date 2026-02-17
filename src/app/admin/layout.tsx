import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Pass — Admin",
  description: "Tedlyns admin dashboard. Operations overview.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
