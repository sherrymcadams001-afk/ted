import { Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-gold/10 bg-obsidian px-6 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Top Row */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between md:items-start">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-2xl font-bold text-gold">
              Tedlyns
            </span>
            <span className="text-[10px] italic text-ivory/30">
              Indulge Yourself
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gold/50 mb-1">
                Explore
              </span>
              <a href="/curate" className="text-ivory/40 hover:text-gold transition-colors">
                Corporate
              </a>
              <a href="/curate" className="text-ivory/40 hover:text-gold transition-colors">
                Gifting
              </a>
              <a href="/curate" className="text-ivory/40 hover:text-gold transition-colors">
                Bakery
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gold/50 mb-1">
                Company
              </span>
              <a href="/tribe" className="text-ivory/40 hover:text-gold transition-colors">
                Ted&apos;s Tribe
              </a>
              <a href="/account" className="text-ivory/40 hover:text-gold transition-colors">
                Account
              </a>
              <a href="/concierge" className="text-ivory/40 hover:text-gold transition-colors">
                Concierge
              </a>
            </div>
          </div>

          {/* Certifications */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-burgundy/15 bg-burgundy/[0.04] px-4 py-2.5">
              <Shield size={16} className="text-burgundy-300" />
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-ivory/60">
                  Nigerian Red Cross
                </span>
                <span className="text-[9px] text-ivory/30">
                  Certified Partner
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-ivory/20">
              <Heart size={10} className="text-burgundy-300" />
              <span className="text-[10px]">Kindred Spirits Initiative</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gold/5" />

        {/* Bottom Row */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] text-ivory/25">
            &copy; {new Date().getFullYear()} Tedlyns Concept. All rights
            reserved.
          </p>
          <p className="text-[10px] text-ivory/15">
            Abuja, Nigeria — Culinary Logistics & Curated Experiences
          </p>
        </div>
      </div>
    </footer>
  );
}
