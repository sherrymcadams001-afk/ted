"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/curate", label: "Curate" },
  { href: "/tribe", label: "Ted's Tribe" },
];

export function DesktopHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden md:flex",
        "h-16 items-center justify-between px-8 lg:px-12",
        "bg-obsidian/90 backdrop-blur-md",
        "border-b border-gold/20"
      )}
    >
      {/* Wordmark */}
      <Link href="/" className="flex flex-col items-start">
        <span className="font-serif text-xl font-bold tracking-wide text-gold leading-tight">
          Tedlyns
        </span>
        <span className="text-[9px] lowercase tracking-widest text-ivory/30 leading-none">
          a Tedlyn's concept
        </span>
      </Link>

      {/* Primary Navigation */}
      <nav className="flex items-center gap-1" aria-label="Desktop navigation">
        {publicLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-gold bg-gold/5"
                  : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Authenticated Links */}
        {isLoggedIn && (
          <>
            <Link
              href="/concierge"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/concierge")
                  ? "text-gold bg-gold/5"
                  : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
              )}
            >
              Concierge
            </Link>

            {isAdmin ? (
              <Link
                href="/admin"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/admin")
                    ? "text-gold bg-gold/5"
                    : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
                )}
              >
                Admin
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/dashboard")
                    ? "text-gold bg-gold/5"
                    : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
                )}
              >
                Dashboard
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Auth Section */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Link
            href="/account"
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all",
              pathname === "/account"
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-gold/15 text-ivory/60 hover:border-gold/30 hover:text-ivory"
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
            <span className="hidden lg:inline max-w-[120px] truncate">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <ChevronDown size={12} className="text-ivory/30" />
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-ivory/60 hover:text-ivory transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/10 transition-all"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
