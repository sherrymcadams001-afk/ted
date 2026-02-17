"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ChatFAB() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/concierge")}
      className={cn(
        "fixed z-40 flex items-center justify-center",
        "bottom-24 right-4 md:bottom-8 md:right-8",
        "h-14 w-14 rounded-full",
        "bg-gold text-obsidian",
        "shadow-lg shadow-gold/20",
        "hover:bg-gold-500 active:bg-gold-600",
        "transition-all duration-200 hover:scale-105",
        "cursor-pointer"
      )}
      aria-label="Open Concierge Chat"
    >
      <MessageCircle size={24} strokeWidth={2} />
    </button>
  );
}
