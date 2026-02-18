import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllSiteContent, updateSiteContent } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const d1 = await getCloudflareDb();
    const items = await getAllSiteContent(d1);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const d1 = await getCloudflareDb();
    const body = await req.json();

    // Accept { key, value } or [{ key, value }, ...]
    const updates: { key: string; value: string }[] = Array.isArray(body) ? body : [body];

    let updated = 0;
    for (const { key, value } of updates) {
      if (typeof key !== "string" || typeof value !== "string") continue;
      const ok = await updateSiteContent(key, value, d1);
      if (ok) updated++;
    }

    return NextResponse.json({ updated });
  } catch {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
