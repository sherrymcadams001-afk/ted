"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Heart,
  BookOpen,
  Users,
  Award,
  HandHeart,
  GraduationCap,
  MapPin,
  ArrowRight,
  Quote,
} from "lucide-react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl font-bold text-gold tabular-nums md:text-4xl">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

const pillars = [
  {
    icon: HandHeart,
    title: "Meal Outreach",
    description:
      "We partner with local shelters and schools to provide nutritious meals to those in need across Abuja's communities.",
    color: "text-gold",
    bg: "bg-gold/[0.06]",
    border: "border-gold/15",
  },
  {
    icon: GraduationCap,
    title: "Culinary Training",
    description:
      "Our apprenticeship program equips young Nigerians with professional catering skills and small-business know-how.",
    color: "text-teal",
    bg: "bg-teal/[0.06]",
    border: "border-teal/15",
  },
  {
    icon: Heart,
    title: "Red Cross Partnership",
    description:
      "A portion of every Tedlyns order supports the Nigerian Red Cross Society's emergency relief and disaster response.",
    color: "text-burgundy-300",
    bg: "bg-burgundy/[0.06]",
    border: "border-burgundy/15",
  },
];

const testimonials = [
  {
    quote:
      "Tedlyns didn't just cater our conference — they fed our entire shelter for a month. That's the kind of business Nigeria needs.",
    author: "Amina B.",
    role: "Director, Hope House Abuja",
  },
  {
    quote:
      "The apprenticeship changed my life. I now run my own small catering outfit and employ two people.",
    author: "Chukwuemeka O.",
    role: "Tedlyns Alumni, Class of 2024",
  },
];

export default function TribePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-14">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-burgundy-300/80">
          Profits With Purpose
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ivory md:text-4xl">
          Ted&apos;s Tribe
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ivory/40">
          Every Tedlyns experience contributes to something larger — feeding
          communities, training futures, and building a Nigeria where no
          celebration goes unshared.
        </p>
      </div>

      {/* Founder Story */}
      <div className="mb-12 rounded-2xl border border-gold/10 bg-gradient-to-br from-gold/[0.04] to-transparent p-6 md:p-8">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold/10 font-serif text-2xl font-bold text-gold">
            EE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-gold/50" />
              <p className="text-[10px] uppercase tracking-wider text-gold/50">
                The Origin Story
              </p>
            </div>
            <h2 className="mt-1 font-serif text-lg text-ivory">
              Ere Erhiaghe — Founder & Head Chef
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/40">
              &quot;I started Tedlyns with a simple belief: food is more than sustenance —
              it&apos;s how we celebrate, connect, and care for each other. Growing up in
              Abuja, I saw how a shared meal could bridge any divide. Ted&apos;s Tribe is
              my promise that every plate we serve creates ripples of good beyond the
              table.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Kindred Spirits */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Users size={16} className="text-teal/60" />
          <h2 className="font-serif text-xl text-ivory">Kindred Spirits</h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ivory/40">
          Kindred Spirits is our community initiative — a network of clients,
          partners, and volunteers united by the conviction that every Nigerian
          deserves a seat at the table. When you order with Tedlyns, you
          automatically become a Kindred Spirit.
        </p>

        {/* Pillars */}
        <div className="grid gap-3 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={cn(
                  "rounded-xl border p-5",
                  pillar.bg,
                  pillar.border
                )}
              >
                <Icon size={20} className={cn("mb-3", pillar.color)} />
                <h3 className="font-serif text-base text-ivory">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ivory/30">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Counters */}
      <div className="mb-12 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl border border-gold/10 bg-gold/[0.03] py-6">
          <AnimatedCounter target={2400} suffix="+" />
          <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/30">
            Meals Donated
          </p>
        </div>
        <div className="rounded-xl border border-teal/10 bg-teal/[0.03] py-6">
          <AnimatedCounter target={150} suffix="+" />
          <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/30">
            Students Trained
          </p>
        </div>
        <div className="rounded-xl border border-burgundy/10 bg-burgundy/[0.03] py-6">
          <AnimatedCounter target={12} />
          <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/30">
            Communities
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Award size={16} className="text-gold/50" />
          <h2 className="font-serif text-xl text-ivory">Voices</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-ivory/5 bg-ivory/[0.02] p-5"
            >
              <Quote size={16} className="mb-2 text-gold/20" />
              <p className="text-sm italic leading-relaxed text-ivory/50">
                &quot;{t.quote}&quot;
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gold/10" />
                <div className="text-right">
                  <p className="text-xs font-medium text-ivory/60">
                    {t.author}
                  </p>
                  <p className="text-[10px] text-ivory/25">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Badge */}
      <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-burgundy/10 bg-burgundy/[0.03] p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10">
          <Heart size={20} className="text-burgundy-300" />
        </div>
        <p className="font-serif text-base text-ivory">
          Official Partner — Nigerian Red Cross Society
        </p>
        <p className="text-xs text-ivory/30">
          FCT Chapter · Since 2023
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-gold/10 bg-gradient-to-r from-gold/[0.04] to-transparent p-6 text-center">
        <p className="font-serif text-lg text-ivory">Become a Kindred Spirit</p>
        <p className="mt-1 text-xs text-ivory/30">
          Every order you place contributes to the mission
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <a href="/curate">
            <Button className="gap-2">
              <MapPin size={14} />
              Place an Order
            </Button>
          </a>
          <a href="/concierge">
            <Button variant="outline" className="gap-2">
              <ArrowRight size={14} />
              Learn More
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
