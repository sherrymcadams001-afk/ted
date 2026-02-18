import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllMenuItems, createMenuItem } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

/** GET /api/admin/curate — list all menu items (admin only) */
export async function GET() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const d1 = await getCloudflareDb();
    const items = await getAllMenuItems(d1);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/admin/curate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST /api/admin/curate — create a new menu item */
export async function POST(req: Request) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { category, name, description, badge, serves, leadTime, image, imagePrompt, sortOrder } = body;

    if (!category || !name || !description) {
      return NextResponse.json({ error: "category, name, and description are required" }, { status: 400 });
    }

    const d1 = await getCloudflareDb();
    const item = await createMenuItem(
      { category, name, description, badge, serves, leadTime, image: image ?? "", imagePrompt: imagePrompt ?? "", sortOrder: sortOrder ?? 0 },
      d1
    );

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/curate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
