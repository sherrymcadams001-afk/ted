"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay blocked — fine, video stays paused
      });
    }
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ── Video Background ── */}
      <div className="absolute inset-0 z-0">
        {/* 
          Using /vid.mp4 as the cinematic food loop.
          Ideal: slow-motion macro shots, deep shadows, warm tones.
          Recommended: 1080p h.264 MP4, < 15MB, 10-20s loop.
        */}
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
          poster="/hero-poster.jpg"
        >
          <source src="/vid.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-obsidian/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-transparent" />
      </div>

      {/* ── Fallback Background (no video) ── */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-obsidian">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)]" />
        </div>
      )}

      {/* ── Content Overlay ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className={cn(
              "font-serif font-bold tracking-wider text-ivory",
              "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
              "drop-shadow-[0_2px_20px_rgba(212,175,55,0.15)]"
            )}
          >
            Tedlyns
          </h1>
          <p className="text-[11px] tracking-[0.35em] uppercase text-ivory/40 md:text-xs">
            Concept
          </p>
        </div>

        {/* Tagline */}
        <p
          className={cn(
            "font-serif italic text-gold/90",
            "text-lg sm:text-xl md:text-2xl lg:text-3xl",
            "tracking-wide"
          )}
        >
          Indulge Yourself
        </p>

        {/* Gold Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gold/30 sm:w-16" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
          <div className="h-px w-12 bg-gold/30 sm:w-16" />
        </div>

        {/* Subtitle */}
        <p className="max-w-lg text-sm leading-relaxed text-ivory/50 sm:text-base md:text-lg">
          Abuja&apos;s premier culinary logistics — corporate catering, artisan
          bakes, and curated gifting.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
          <Link href="/curate">
            <Button variant="outline" size="lg" className="min-w-[200px] border-gold/40 text-gold hover:bg-gold/10">
              Corporate Solutions
            </Button>
          </Link>
          <Link href="/curate">
            <Button size="lg" className="min-w-[200px] bg-burgundy text-ivory hover:bg-burgundy-400 border border-burgundy-400/20">
              Retail Collections
            </Button>
          </Link>
        </div>
      </div>

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
      <div className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 md:bottom-8">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/30">
            Explore
          </span>
          <div className="h-8 w-px animate-pulse bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
