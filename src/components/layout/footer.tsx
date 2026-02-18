import Link from "next/link";
import { Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-gold/10 bg-obsidian">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand — col 1-4 */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <Link href="/" className="flex flex-col items-center md:items-start">
              <span className="font-serif text-2xl font-bold tracking-wide text-gold leading-tight">
                Tedlyns
              </span>
              <span className="text-[9px] lowercase tracking-widest text-ivory/30 leading-none mt-0.5">
                a Tedlyn's concept
              </span>
            </Link>
            <p className="mt-4 max-w-[260px] text-xs text-ivory/25 leading-relaxed text-center md:text-left">
              From boardrooms to birthday parties — we bring the flavour,
              you bring the people.
            </p>
          </div>

          {/* Offerings — col 5-6 */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/50 font-medium">
              Offerings
            </span>
            <Link href="/curate" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              Corporate Catering
            </Link>
            <Link href="/curate" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              Gifting &amp; Hampers
            </Link>
            <Link href="/curate" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              Artisan Bakery
            </Link>
          </div>

          {/* Company — col 7-8 */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/50 font-medium">
              Company
            </span>
            <Link href="/tribe" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              Ted&apos;s Tribe
            </Link>
            <Link href="/concierge" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              Chat With Us
            </Link>
            <Link href="/account" className="text-[13px] text-ivory/40 hover:text-gold transition-colors">
              My Account
            </Link>
          </div>

          {/* Certifications — col 9-12 */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-burgundy/15 bg-burgundy/[0.03] px-5 py-3">
              <Shield size={18} className="text-burgundy-300 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-ivory/60 leading-tight">
                  Nigerian Red Cross
                </span>
                <span className="text-[10px] text-ivory/30">
                  Certified Partner
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-ivory/20">
              <Heart size={10} className="text-burgundy-300" />
              <span className="text-[10px] tracking-wide">Kindred Spirits Initiative</span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mt-12 mb-6 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

        {/* ── Bottom Row ── */}
        <div className="flex flex-col items-center gap-1.5 text-center md:flex-row md:justify-between">
          <p className="text-[11px] text-ivory/25">
            &copy; {new Date().getFullYear()} Tedlyns Concept. All rights reserved.
          </p>
          <p className="text-[10px] text-ivory/15 tracking-wide">
            Abuja, Nigeria — Culinary Logistics &amp; Curated Experiences
          </p>
        </div>
      </div>
    </footer>
  );
}
