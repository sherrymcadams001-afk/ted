"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/curate", label: "Curate" },
  { href: "/tribe", label: "Tribe" },
  { href: "/account", label: "Account" },
];

export function DesktopHeader() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden md:flex",
        "h-16 items-center justify-between px-8",
        "bg-obsidian/90 backdrop-blur-md",
        "border-b border-gold/20"
      )}
    >
      {/* Wordmark */}
      <Link href="/" className="flex flex-col">
        <span className="font-serif text-xl font-bold tracking-wide text-gold">
          Tedlyns
        </span>
        <span className="text-[10px] italic text-ivory/40 -mt-1">
          Indulge Yourself
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-8" aria-label="Desktop navigation">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isActive
                  ? "text-gold"
                  : "text-ivory/70 hover:text-gold/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
