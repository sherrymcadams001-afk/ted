"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  UtensilsCrossed,
  Heart,
  User,
  MessageCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const defaultNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/curate", label: "Curate", icon: UtensilsCrossed },
  { href: "/tribe", label: "Tribe", icon: Heart },
  { href: "/concierge", label: "Chat", icon: MessageCircle },
  { href: "/account", label: "Account", icon: User },
];

const adminNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/curate", label: "Curate", icon: UtensilsCrossed },
  { href: "/tribe", label: "Tribe", icon: Heart },
  { href: "/concierge", label: "Chat", icon: MessageCircle },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navItems = session?.user?.role === "admin" ? adminNav : defaultNav;

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex md:hidden",
        "border-t border-gold/10",
        "bg-black/80 backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex w-full items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors duration-200",
                isActive
                  ? "text-gold"
                  : "text-ivory/50 hover:text-ivory/80 active:text-gold/70"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors duration-200",
                  isActive ? "text-gold" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
