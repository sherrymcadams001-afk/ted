import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { countAdminUsers, deleteUserAsAdmin, findUserById, getAllUsers } from "@/db";
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

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  let userId: string | null = searchParams.get("id") ?? searchParams.get("userId");

  if (!userId) {
    try {
      const body = (await req.json()) as { id?: string; userId?: string };
      userId = body?.id ?? body?.userId ?? null;
    } catch {
      // ignore
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const d1 = await getCloudflareDb();
  const target = await findUserById(userId, d1);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "admin") {
    const adminCount = await countAdminUsers(d1);
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
    }
  }

  const success = await deleteUserAsAdmin(userId, d1);
  if (!success) {
    return NextResponse.json({ error: "Could not delete user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
