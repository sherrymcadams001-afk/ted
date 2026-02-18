"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/use-site-content";

const HERO_DEFAULTS: Record<string, string> = {
  "home.hero.tagline": "Indulge Yourself",
  "home.hero.subtitle": "Where every dish tells a story and every gathering becomes an occasion. Abuja\u2019s finest culinary logistics \u2014 seamless from our kitchen to your table.",
  "home.hero.video": "/vid.mp4",
  "home.hero.poster": "/hero-poster.jpg",
  "home.hero.cta1_text": "Corporate Solutions",
  "home.hero.cta1_link": "/curate?view=corporate",
  "home.hero.cta2_text": "Retail Collections",
  "home.hero.cta2_link": "/curate?view=retail",
};

/* ── Staggered reveal orchestration ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const scaleFade = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const dividerExpand = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

export function HeroSection() {
  const { content: c } = useSiteContent("home", HERO_DEFAULTS);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ── Video Background ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-1000",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onLoadedData={() => setIsLoaded(true)}
          poster={c["home.hero.poster"]}
        >
          <source src={c["home.hero.video"]} type="video/mp4" />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-obsidian/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-transparent" />
      </div>

      {/* ── Fallback Background ── */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-obsidian">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)]" />
        </div>
      )}

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-6 text-center"
      >
        {/* Tagline — the hero statement */}
        <motion.h1
          variants={scaleFade}
          className={cn(
            "font-serif italic text-gold",
            "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
            "tracking-wide drop-shadow-[0_2px_20px_rgba(212,175,55,0.2)]"
          )}
        >
          {c["home.hero.tagline"]}
        </motion.h1>

        {/* Gold Divider */}
        <motion.div variants={dividerExpand} className="flex items-center gap-3 origin-center">
          <div className="h-px w-12 bg-gold/30 sm:w-16" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
          <div className="h-px w-12 bg-gold/30 sm:w-16" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="max-w-lg text-sm leading-relaxed text-ivory/50 sm:text-base md:text-lg"
        >
          {c["home.hero.subtitle"]}
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href={c["home.hero.cta1_link"]}>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
            >
              {c["home.hero.cta1_text"]}
            </Button>
          </Link>
          <Link href={c["home.hero.cta2_link"]}>
            <Button
              size="lg"
              className="gap-2 bg-burgundy text-ivory hover:bg-burgundy-400 shadow-lg shadow-burgundy/20"
            >
              {c["home.hero.cta2_text"]}
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Mute/Unmute Toggle ── */}
      <button
        onClick={() => {
          setIsMuted(!isMuted);
          if (videoRef.current) videoRef.current.muted = !isMuted;
        }}
        className={cn(
          "absolute bottom-28 right-4 z-20 md:bottom-8",
          "flex h-10 w-10 items-center justify-center rounded-full",
          "bg-obsidian/50 backdrop-blur-sm border border-gold/10",
          "text-ivory/50 hover:text-gold transition-colors cursor-pointer"
        )}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 md:bottom-8"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/30">
            Explore
          </span>
          <div className="h-8 w-px animate-pulse bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
