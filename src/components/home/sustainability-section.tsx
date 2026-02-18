"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const statReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.12,
      ease: EASE,
    },
  }),
};

export function SustainabilitySection() {
  return (
    <section className="relative px-6 py-20 md:py-28 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(128,0,32,0.06)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-16 lg:gap-24">
          {/* Left: Message — slides in from left */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex-1 text-center md:text-left"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-burgundy-300 mb-3">
              Profits with Purpose
            </p>
            <h2 className="font-serif text-3xl font-bold text-ivory md:text-4xl lg:text-5xl">
              Ted&apos;s Tribe
            </h2>
            <p className="mt-4 text-sm text-ivory/40 max-w-md mx-auto md:mx-0 md:text-base leading-relaxed">
              Every order you place does more than satisfy a craving — it feeds
              someone in need, trains a young chef, and supports communities
              across Abuja. That&apos;s the Tedlyns promise.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/tribe">
                <Button variant="outline" className="gap-2">
                  <Heart size={14} />
                  Learn About Our Mission
                </Button>
              </Link>
              <Link href="/curate">
                <Button variant="ghost" className="gap-2 text-ivory/50">
                  Place an Order
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Quick stats — slides in from right with staggered children */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-3 gap-4 md:flex md:flex-col md:gap-4 md:min-w-[200px]"
          >
            {[
              { value: "2,400+", label: "Meals Donated", color: "text-gold", border: "border-gold/10", bg: "bg-gold/[0.03]" },
              { value: "150+", label: "Chefs Trained", color: "text-teal", border: "border-teal/10", bg: "bg-teal/[0.03]" },
              { value: "12", label: "Communities", color: "text-burgundy-300", border: "border-burgundy/10", bg: "bg-burgundy/[0.03]" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={statReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-xl border ${stat.border} ${stat.bg} p-4 text-center md:p-5`}
              >
                <p className={`font-serif text-2xl font-bold ${stat.color} md:text-3xl`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/30">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
