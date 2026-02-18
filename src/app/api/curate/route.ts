import { NextResponse } from "next/server";
import { getAllMenuItems, getSiteContentByPage } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

const defaultCategoryMeta: Record<string, { headline: string; sub: string; icon: string }> = {
  corporate: {
    headline: "Corporate Catering",
    sub: "Boardroom-ready menus for Abuja\u2019s top organisations. We show up correct, every time.",
    icon: "Briefcase",
  },
  bakery: {
    headline: "Artisan Bakery",
    sub: "Handcrafted with the kind of attention your grandmother would approve of. Every bite tells a story.",
    icon: "Cake",
  },
  gifting: {
    headline: "Curated Gifts",
    sub: "Thoughtfully assembled hampers that say what words cannot. For the people who matter most.",
    icon: "Gift",
  },
};

export async function GET() {
  try {
    const d1 = await getCloudflareDb();
    const items = await getAllMenuItems(d1);
    const content = await getSiteContentByPage("curate", d1);

    // Build category meta from DB content, falling back to defaults
    const categoryMeta: Record<string, { headline: string; sub: string; icon: string }> = {};
    for (const [cat, defaults] of Object.entries(defaultCategoryMeta)) {
      categoryMeta[cat] = {
        headline: content[`curate.${cat}.headline`] || defaults.headline,
        sub: content[`curate.${cat}.subtitle`] || defaults.sub,
        icon: defaults.icon,
      };
    }

    // Group by category
    const grouped: Record<string, { headline: string; sub: string; icon: string; items: typeof items }> = {};

    for (const [cat, meta] of Object.entries(categoryMeta)) {
      grouped[cat] = { ...meta, items: items.filter((i) => i.category === cat) };
    }

    return NextResponse.json(grouped, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("GET /api/curate error:", err);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
