"use client";

import { useState } from "react";
import {
  Briefcase,
  Gift,
  Cake,
  ChevronRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  accent: string;
  gradient: string;
}

const services: Service[] = [
  {
    id: "corporate",
    title: "Corporate",
    subtitle: "AGM Breakfasts & Tea Breaks",
    description:
      "Elevate your corporate events with bespoke catering. From executive breakfasts to full-day conference packages, every detail is curated for distinction.",
    icon: Briefcase,
    features: [
      "Standing order contracts",
      "Executive breakfast packages",
      "Conference & AGM catering",
      "Tea break service subscriptions",
      "Staff event coordination",
    ],
    accent: "text-gold",
    gradient: "from-gold/10 to-transparent",
  },
  {
    id: "gifting",
    title: "Gifting",
    subtitle: "Curated Souvenirs & Hampers",
    description:
      "Thoughtfully assembled gift boxes and hampers for every occasion — birthdays, anniversaries, corporate appreciation, and festive seasons.",
    icon: Gift,
    features: [
      "Custom hamper assembly",
      "Corporate gift packages",
      "Birthday & celebration boxes",
      "Seasonal collections",
      "Branded packaging options",
    ],
    accent: "text-burgundy-300",
    gradient: "from-burgundy/10 to-transparent",
  },
  {
    id: "bakery",
    title: "Bakery",
    subtitle: "Artisan Cakes & Parfaits",
    description:
      "Handcrafted cakes, parfaits, and brownies made with premium ingredients. Each creation is a work of edible art, designed to indulge.",
    icon: Cake,
    features: [
      "Custom celebration cakes",
      "Artisan parfait jars",
      "Signature brownie boxes",
      "Pastry platters",
      "Dessert catering",
    ],
    accent: "text-teal",
    gradient: "from-teal/10 to-transparent",
  },
];

function ServiceCard({
  service,
  onSelect,
}: {
  service: Service;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl p-6 text-left",
        "border border-gold/10 bg-obsidian",
        "transition-all duration-300",
        "hover:border-gold/25 hover:bg-gold/[0.03]",
        "active:scale-[0.98]",
        "cursor-pointer w-full"
      )}
    >
      {/* Subtle gradient on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          service.gradient
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-xl",
          "border border-gold/10 bg-gold/5"
        )}
      >
        <service.icon size={22} className={service.accent} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="relative flex flex-col gap-1.5">
        <h3
          className={cn(
            "font-serif text-xl font-semibold text-ivory",
            "group-hover:text-gold transition-colors duration-300"
          )}
        >
          {service.title}
        </h3>
        <p className="text-sm text-ivory/40 leading-relaxed">
          {service.subtitle}
        </p>
      </div>

      {/* Arrow */}
      <div className="relative mt-auto flex items-center gap-1 pt-2 text-xs text-gold/50 group-hover:text-gold/80 transition-colors">
        <span>Explore</span>
        <ChevronRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

function ServiceDrawer({
  service,
  open,
  onClose,
}: {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!service) return null;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                "bg-gold/10 border border-gold/10"
              )}
            >
              <service.icon
                size={20}
                className={service.accent}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <DrawerTitle>{service.title}</DrawerTitle>
              <p className="text-xs text-ivory/40">{service.subtitle}</p>
            </div>
          </div>
          <DrawerDescription className="pt-2">
            {service.description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {/* Features */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-gold/60">
              What We Offer
            </p>
            {service.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gold/5 bg-ivory/[0.02] px-4 py-3"
              >
                <Star size={12} className="text-gold/40 shrink-0" />
                <span className="text-sm text-ivory/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <Button className="w-full">
            Enquire Now
          </Button>
          <DrawerClose className="w-full">
            <Button variant="ghost" className="w-full text-ivory/50">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function ServiceMatrix() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelect = (service: Service) => {
    setSelectedService(service);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    // Delay clearing selection so drawer close animation plays
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section className="relative px-6 py-20 md:py-28">
      {/* Section Header */}
      <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/60 mb-3">
          What We Do
        </p>
        <h2 className="font-serif text-3xl font-bold text-ivory md:text-4xl lg:text-5xl">
          The Tedlyns Experience
        </h2>
        <p className="mt-4 text-sm text-ivory/40 max-w-md mx-auto md:text-base">
          Three verticals, one standard of excellence.
        </p>
      </div>

      {/* Service Grid */}
      <div className="mx-auto max-w-4xl grid gap-4 md:grid-cols-3 md:gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={() => handleSelect(service)}
          />
        ))}
      </div>

      {/* Service Detail Drawer */}
      <ServiceDrawer
        service={selectedService}
        open={drawerOpen}
        onClose={handleClose}
      />
    </section>
  );
}
