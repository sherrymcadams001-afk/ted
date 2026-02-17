"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, GraduationCap, UtensilsCrossed, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER — Counts up on scroll into view
   Uses tabular-nums for stable layout
   ═══════════════════════════════════════════════ */

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════ */

interface Metric {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  icon: React.ElementType;
}

const metrics: Metric[] = [
  {
    label: "Meals Donated",
    value: 2400,
    suffix: "+",
    prefix: "",
    icon: UtensilsCrossed,
  },
  {
    label: "Students Trained",
    value: 150,
    suffix: "+",
    prefix: "",
    icon: GraduationCap,
  },
  {
    label: "Communities Reached",
    value: 12,
    suffix: "",
    prefix: "",
    icon: Heart,
  },
];

export function SustainabilitySection() {
  return (
    <section className="relative px-6 py-20 md:py-28 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(128,0,32,0.06)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-burgundy-300 mb-3">
            Profits with Purpose
          </p>
          <h2 className="font-serif text-3xl font-bold text-ivory md:text-4xl lg:text-5xl">
            Ted&apos;s Tribe
          </h2>
          <p className="mt-4 text-sm text-ivory/40 max-w-lg mx-auto md:text-base leading-relaxed">
            Every indulgence fuels a greater mission. A portion of every Tedlyns
            order supports the{" "}
            <span className="text-burgundy-300">Kindred Spirits</span> initiative
            — feeding communities, training young chefs, and nourishing futures.
          </p>
        </div>

        {/* CEO Story Card */}
        <div className="mb-12 md:mb-16 rounded-2xl border border-burgundy/20 bg-burgundy/[0.03] p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            {/* Placeholder Portrait */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-burgundy/20 bg-burgundy/10">
              <span className="font-serif text-2xl font-bold text-burgundy-300">
                EE
              </span>
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-serif text-lg font-semibold text-ivory mb-1">
                Ere Erhiaghe
              </h3>
              <p className="text-xs uppercase tracking-wider text-burgundy-300 mb-3">
                Founder & CEO
              </p>
              <p className="text-sm text-ivory/50 leading-relaxed">
                &ldquo;Food is more than sustenance — it&apos;s connection.
                Tedlyns was born from the belief that every meal shared is an
                opportunity to uplift. Through our Kindred Spirits mission, we
                channel the joy of indulgence into tangible change for
                communities across Nigeria.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3 md:gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl p-6",
                "border border-gold/10 bg-obsidian",
                "text-center"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy/10 border border-burgundy/10">
                <metric.icon size={18} className="text-burgundy-300" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-3xl font-bold text-ivory md:text-4xl">
                <AnimatedCounter
                  target={metric.value}
                  suffix={metric.suffix}
                  prefix={metric.prefix}
                />
              </span>
              <span className="text-xs uppercase tracking-wider text-ivory/40">
                {metric.label}
              </span>
            </div>
          ))}
        </div>

        {/* Red Cross Badge */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/10 border border-burgundy/15">
            <Shield size={16} className="text-burgundy-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-ivory/60">
              Nigerian Red Cross Certified
            </span>
            <span className="text-[10px] text-ivory/30">
              Food safety & humanitarian partnership
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
