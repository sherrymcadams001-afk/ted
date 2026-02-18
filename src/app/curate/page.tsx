"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Briefcase,
  Cake,
  Gift,
  ChevronRight,
  Star,
  Clock,
  Users,
  MessageCircle,
} from "lucide-react";

const iconMap: Record<string, typeof Briefcase> = { Briefcase, Cake, Gift };

const categories = [
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "bakery", label: "Bakery", icon: Cake },
  { id: "gifting", label: "Gifting", icon: Gift },
] as const;

type CategoryId = (typeof categories)[number]["id"];

type MenuItem = {
  id: string;
  name: string;
  description: string;
  badge?: string | null;
  serves?: string | null;
  leadTime?: string | null;
  image: string;
  imagePrompt: string;
};

type CategoryData = { headline: string; sub: string; icon: string; items: MenuItem[] };
type MenuData = Record<string, CategoryData>;

export default function CuratePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("corporate");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curate")
      .then((r) => r.json())
      .then((d) => setMenuData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = menuData?.[activeCategory];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-14">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
          Our Offerings
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ivory md:text-4xl lg:text-5xl">
          Curate Your Experience
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ivory/40 md:text-base">
          Explore what we do best — then chat with our concierge to make it happen
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex justify-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium transition-all md:px-6 md:text-sm",
                isActive
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20 hover:text-ivory/60"
              )}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      {data && (
        <div className="mb-6">
          <h2 className="font-serif text-xl text-ivory md:text-2xl">{data.headline}</h2>
          <p className="mt-1 text-xs text-ivory/30 md:text-sm">{data.sub}</p>
        </div>
      )}

      {/* Menu Grid — wide on desktop */}
      <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
        {(data?.items ?? []).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative overflow-hidden rounded-xl border border-gold/8 bg-gold/[0.02] text-left transition-all hover:border-gold/20 hover:bg-gold/[0.04]"
          >
            {/* Image banner */}
            {item.image && (
              <div className="relative h-40 w-full md:h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
              </div>
            )}
            <div className="relative p-5 md:p-6 lg:p-7">
              {item.badge && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold">
                  <Star size={8} className="fill-gold" />
                  {item.badge}
                </span>
              )}
              <h3 className="pr-20 font-serif text-base font-medium text-ivory group-hover:text-gold transition-colors md:text-lg">
                {item.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ivory/30 md:text-sm md:line-clamp-3">
                {item.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-ivory/25">
                  {item.serves && (
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {item.serves}
                    </span>
                  )}
                  {item.leadTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {item.leadTime}
                    </span>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className="text-ivory/10 group-hover:text-gold/40 transition-colors"
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl border border-gold/10 bg-gradient-to-r from-gold/[0.04] to-transparent p-6 text-center md:flex md:items-center md:justify-between md:text-left md:p-8">
        <div>
          <p className="font-serif text-lg text-ivory md:text-xl">
            Ready to place an order?
          </p>
          <p className="mt-1 text-xs text-ivory/30 md:text-sm">
            Our concierge will help you with quantities, custom requests &amp; everything in between
          </p>
        </div>
        <Link href="/concierge" className="mt-4 inline-block md:mt-0">
          <Button className="gap-2">
            <MessageCircle size={14} />
            Chat With Us
          </Button>
        </Link>
      </div>

      {/* Item Detail Drawer */}
      <Drawer
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DrawerContent className="max-h-[85vh]">
          {selectedItem && (
            <>
              {/* Drawer image header */}
              {selectedItem.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
                </div>
              )}
              <DrawerHeader>
                <DrawerTitle className="font-serif text-xl">
                  {selectedItem.name}
                </DrawerTitle>
                <DrawerDescription className="text-ivory/40">
                  {selectedItem.description}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-3">
                  {selectedItem.serves && (
                    <div className="flex items-center gap-1.5 rounded-full bg-ivory/5 px-3 py-1.5 text-xs text-ivory/40">
                      <Users size={12} />
                      {selectedItem.serves}
                    </div>
                  )}
                  {selectedItem.leadTime && (
                    <div className="flex items-center gap-1.5 rounded-full bg-ivory/5 px-3 py-1.5 text-xs text-ivory/40">
                      <Clock size={12} />
                      {selectedItem.leadTime} lead time
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-lg bg-gold/[0.03] p-3">
                  <p className="text-xs leading-relaxed text-ivory/30">
                    All orders include premium packaging. Corporate branding
                    and custom dietary accommodations available on request.
                    Chat with our concierge for a personalised quote.
                  </p>
                </div>
              </div>
              <DrawerFooter>
                <Link href="/concierge" className="w-full">
                  <Button className="w-full gap-2">
                    <MessageCircle size={14} />
                    Get a Quote
                  </Button>
                </Link>
                <DrawerClose className="w-full">
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
