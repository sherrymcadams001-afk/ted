import { NextResponse } from "next/server";
import { getAllMenuItems } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

const categoryMeta: Record<string, { headline: string; sub: string; icon: string }> = {
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

    // Group by category
    const grouped: Record<string, { headline: string; sub: string; icon: string; items: typeof items }> = {};

    for (const [cat, meta] of Object.entries(categoryMeta)) {
      grouped[cat] = { ...meta, items: items.filter((i) => i.category === cat) };
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("GET /api/curate error:", err);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
