"use client";

import { useState } from "react";
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
  Utensils,
  Phone,
} from "lucide-react";

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
  price: string;
  badge?: string;
  serves?: string;
  leadTime?: string;
  image?: string;
};

const menuData: Record<CategoryId, { headline: string; sub: string; items: MenuItem[] }> = {
  corporate: {
    headline: "Corporate Catering",
    sub: "Boardroom-ready menus for Abuja's finest organisations",
    items: [
      {
        id: "c1",
        name: "Executive Lunch Box",
        description:
          "Jollof rice, grilled chicken, plantain, coleslaw & chapman. Premium packaging with branded sleeve.",
        price: "₦8,500",
        serves: "1 person",
        leadTime: "48 hrs",
        badge: "Best Seller",
      },
      {
        id: "c2",
        name: "Conference Platter",
        description:
          "Assorted small chops, puff-puff, samosa, spring rolls, and dipping sauces. Serves 8-10 guests.",
        price: "₦35,000",
        serves: "8–10",
        leadTime: "72 hrs",
      },
      {
        id: "c3",
        name: "Breakfast Spread",
        description:
          "Croissants, fruit platter, yogurt parfaits, freshly squeezed juice & drip coffee. White-glove setup.",
        price: "₦45,000",
        serves: "10–12",
        leadTime: "48 hrs",
      },
      {
        id: "c4",
        name: "Full-Day Event Package",
        description:
          "Breakfast, lunch & refreshments. Dedicated service team, chinaware, and branded menu cards.",
        price: "₦250,000",
        serves: "50+",
        leadTime: "1 week",
        badge: "Premium",
      },
    ],
  },
  bakery: {
    headline: "Artisan Bakery",
    sub: "Handcrafted cakes and pastries, baked with obsessive attention to detail",
    items: [
      {
        id: "b1",
        name: "Signature Celebration Cake",
        description:
          "Three-tier fondant masterpiece with custom design consultation. Flavours: red velvet, chocolate, vanilla, carrot.",
        price: "From ₦85,000",
        serves: "30–40 slices",
        leadTime: "5 days",
        badge: "Signature",
      },
      {
        id: "b2",
        name: "Cupcake Collection",
        description:
          "Box of 12 gourmet cupcakes with buttercream rosettes. Corporate branding available.",
        price: "₦18,000",
        serves: "12 pieces",
        leadTime: "48 hrs",
      },
      {
        id: "b3",
        name: "Chin Chin Gift Jar",
        description:
          "Crunchy artisan chin chin in a premium glass jar with gold ribbon. Perfect hostess gift.",
        price: "₦5,500",
        serves: "Sharing",
        leadTime: "24 hrs",
        badge: "Popular",
      },
      {
        id: "b4",
        name: "Bread & Pastry Box",
        description:
          "Assorted Danish, croissants, banana bread, and meat pie. Fresh-baked morning delivery.",
        price: "₦12,000",
        serves: "6–8 pieces",
        leadTime: "24 hrs",
      },
    ],
  },
  gifting: {
    headline: "Curated Gifts",
    sub: "Thoughtfully assembled hampers that say what words cannot",
    items: [
      {
        id: "g1",
        name: "The Indulgence Box",
        description:
          "Premium chocolate truffles, artisan chin chin, wine, scented candle & personalised card in a gold box.",
        price: "₦65,000",
        leadTime: "72 hrs",
        badge: "Luxury",
      },
      {
        id: "g2",
        name: "Birthday Bundle",
        description:
          "Celebration cake (8-inch), cupcake box, balloon arrangement & a bottle of bubbly.",
        price: "₦55,000",
        leadTime: "72 hrs",
        badge: "Best Seller",
      },
      {
        id: "g3",
        name: "Corporate Welcome Kit",
        description:
          "Branded tote, artisan snack box, welcome card & company-curated treats for new hires.",
        price: "₦25,000",
        serves: "1 person",
        leadTime: "1 week",
      },
      {
        id: "g4",
        name: "Eid / Christmas Hamper",
        description:
          "Seasonal hamper with dates, cookies, juice, nuts, rice & premium packaging. Bulk pricing available.",
        price: "From ₦40,000",
        leadTime: "1 week",
      },
    ],
  },
};

export default function CuratePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("corporate");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const data = menuData[activeCategory];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-14">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
          The Menu
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ivory md:text-4xl">
          Curate Your Experience
        </h1>
        <p className="mt-2 text-sm text-ivory/40">
          Select a category to explore our offerings
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
                "flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all",
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
      <div className="mb-6">
        <h2 className="font-serif text-xl text-ivory">{data.headline}</h2>
        <p className="mt-1 text-xs text-ivory/30">{data.sub}</p>
      </div>

      {/* Menu Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {data.items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative flex flex-col rounded-xl border border-gold/8 bg-gold/[0.02] p-5 text-left transition-all hover:border-gold/20 hover:bg-gold/[0.04]"
          >
            {item.badge && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold">
                <Star size={8} className="fill-gold" />
                {item.badge}
              </span>
            )}
            <h3 className="pr-20 font-serif text-base font-medium text-ivory group-hover:text-gold transition-colors">
              {item.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ivory/30">
              {item.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gold">{item.price}</span>
              <ChevronRight
                size={14}
                className="text-ivory/10 group-hover:text-gold/40 transition-colors"
              />
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl border border-gold/10 bg-gradient-to-r from-gold/[0.04] to-transparent p-6 text-center">
        <p className="font-serif text-lg text-ivory">Ready to order?</p>
        <p className="mt-1 text-xs text-ivory/30">
          Speak to our concierge for custom menus, bulk orders &amp; event planning
        </p>
        <a href="/concierge">
          <Button className="mt-4 gap-2">
            <Phone size={14} />
            Contact Concierge
          </Button>
        </a>
      </div>

      {/* Item Detail Drawer */}
      <Drawer
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DrawerContent className="max-h-[85vh]">
          {selectedItem && (
            <>
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
                  <div className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-xs text-gold">
                    <span className="font-bold">{selectedItem.price}</span>
                  </div>
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
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-gold/[0.03] p-3">
                  <Utensils size={14} className="mt-0.5 text-gold/40" />
                  <p className="text-xs leading-relaxed text-ivory/30">
                    All orders include premium packaging. Corporate branding
                    and custom dietary accommodations available on request.
                  </p>
                </div>
              </div>
              <DrawerFooter>
                <a href="/concierge" className="w-full">
                  <Button className="w-full gap-2">
                    <Phone size={14} />
                    Order via Concierge
                  </Button>
                </a>
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
