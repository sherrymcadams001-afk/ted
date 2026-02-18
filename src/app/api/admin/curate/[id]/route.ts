import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMenuItemById, updateMenuItem, deleteMenuItem } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/admin/curate/[id] — update a menu item */
export async function PUT(req: Request, ctx: Ctx) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    const d1 = await getCloudflareDb();
    const existing = await getMenuItemById(id, d1);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    for (const key of ["category", "name", "description", "badge", "serves", "leadTime", "image", "imagePrompt", "sortOrder"] as const) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await updateMenuItem(id, updates, d1);
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("PUT /api/admin/curate/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** DELETE /api/admin/curate/[id] — delete a menu item */
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    const d1 = await getCloudflareDb();
    const deleted = await deleteMenuItem(id, d1);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/curate/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
