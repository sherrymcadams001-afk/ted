import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { findUserById, updateUserProfile } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

const profileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email().max(120).optional(),
  phone: z.string().max(40).optional().nullable(),
  avatar: z.string().url().max(500).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const d1 = await getCloudflareDb();
  const user = await findUserById(session.user.id, d1);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      avatar: user.avatar ?? null,
    },
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    const d1 = await getCloudflareDb();
    const updated = await updateUserProfile(
      session.user.id,
      {
        name: data.name,
        email: data.email,
        phone: data.phone ?? undefined,
        avatar: data.avatar ?? undefined,
      },
      d1
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone ?? null,
        avatar: updated.avatar ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
