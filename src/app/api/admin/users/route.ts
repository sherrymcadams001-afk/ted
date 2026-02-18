import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

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
  const users = await getAllUsers(d1);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      company: u.company ?? null,
      role: u.role,
    })),
  });
}
