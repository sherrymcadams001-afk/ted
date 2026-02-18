"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Gift,
  Cake,
  ChevronRight,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
    title: "Corporate Catering",
    subtitle: "Boardroom-ready, always on point",
    description:
      "Whether it's your AGM breakfast, a client-facing tea break, or a full-day conference — we handle the food so you can handle the business. Abuja's top organisations trust us to show up correct, every single time.",
    icon: Briefcase,
    features: [
      "Standing order contracts for your office",
      "Executive breakfast & lunch packages",
      "Conference & AGM full-service catering",
      "Tea break subscriptions — we keep your team fuelled",
      "Staff events, end-of-year parties & retreats",
    ],
    accent: "text-gold",
    gradient: "from-gold/10 to-transparent",
  },
  {
    id: "gifting",
    title: "Curated Gifting",
    subtitle: "Say it with something special",
    description:
      "From corporate welcome kits to birthday hampers that make people's eyes shine — we put together gift boxes that tell a story. Every box is wrapped with intention, because the people in your life deserve that extra touch.",
    icon: Gift,
    features: [
      "Custom hamper assembly for any occasion",
      "Corporate gift packages & welcome kits",
      "Birthday & anniversary celebration boxes",
      "Eid, Christmas & seasonal collections",
      "Branded packaging for your organisation",
    ],
    accent: "text-burgundy-300",
    gradient: "from-burgundy/10 to-transparent",
  },
  {
    id: "bakery",
    title: "Artisan Bakery",
    subtitle: "Baked with obsession, served with love",
    description:
      "Handcrafted cakes, parfaits, and chin chin made with the kind of attention your grandmother would approve of. Every creation is a small masterpiece, because we believe life's sweetest moments deserve the very best.",
    icon: Cake,
    features: [
      "Custom celebration cakes — any size, any design",
      "Artisan parfait jars & dessert cups",
      "Signature chin chin & brownie gift jars",
      "Pastry platters for events & gatherings",
      "Dessert catering for weddings & parties",
    ],
    accent: "text-teal",
    gradient: "from-teal/10 to-transparent",
  },
];

function ServiceCard({
  service,
  onSelect,
  index,
}: {
  service: Service;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl p-6 text-left",
        "border border-gold/10 bg-obsidian",
        "transition-colors duration-300",
        "hover:border-gold/25 hover:bg-gold/[0.03]",
        "cursor-pointer w-full",
        "md:p-8 lg:p-10"
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
          "relative flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14",
          "border border-gold/10 bg-gold/5"
        )}
      >
        <service.icon size={22} className={service.accent} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="relative flex flex-col gap-1.5">
        <h3
          className={cn(
            "font-serif text-xl font-semibold text-ivory md:text-2xl",
            "group-hover:text-gold transition-colors duration-300"
          )}
        >
          {service.title}
        </h3>
        <p className="text-sm text-ivory/40 leading-relaxed md:text-base">
          {service.subtitle}
        </p>
      </div>

      {/* Arrow */}
      <div className="relative mt-auto flex items-center gap-1 pt-2 text-xs text-gold/50 group-hover:text-gold/80 transition-colors md:text-sm">
        <span>See what we offer</span>
        <ChevronRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </motion.button>
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
          <Link href="/concierge" className="w-full">
            <Button className="w-full">
              Chat With Our Concierge
            </Button>
          </Link>
          <Link href="/curate" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <ArrowRight size={14} />
              Explore Full Menu
            </Button>
          </Link>
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
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section className="relative px-6 py-20 md:py-28">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="mx-auto max-w-6xl text-center mb-12 md:mb-16"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/60 mb-3">
          What We Do
        </p>
        <h2 className="font-serif text-3xl font-bold text-ivory md:text-4xl lg:text-5xl">
          The Tedlyns Experience
        </h2>
        <p className="mt-4 text-sm text-ivory/40 max-w-lg mx-auto md:text-base">
          Three pillars, one standard of excellence. Whatever the occasion,
          we&apos;ve got you covered.
        </p>
      </motion.div>

      {/* Service Grid — fills desktop width */}
      <div className="mx-auto max-w-6xl grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
        {services.map((service, i) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={i}
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
