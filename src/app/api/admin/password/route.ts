import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { findUserById, updateUserPassword } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";
import { verifyPassword, hashPassword } from "@/lib/password";

export const runtime = "edge";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const d1 = await getCloudflareDb();
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new passwords are required" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const user = await findUserById(session.user.id!, d1);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const hashed = await hashPassword(newPassword);
    await updateUserPassword(user.id, hashed, d1);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
