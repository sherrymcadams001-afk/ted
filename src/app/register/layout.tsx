import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Tedlyns — create your account to indulge.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
