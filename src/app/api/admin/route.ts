import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUpcomingBirthdays, getAllUsers, getAllConversations, getAllEvents } from "@/db";

// GET — admin-only global overview
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const users = getAllUsers();
  const events = getAllEvents();
  const conversations = getAllConversations();
  const upcomingBirthdays = getUpcomingBirthdays(7);

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      totalEvents: events.length,
      openChats: conversations.filter((c) => c.status === "open").length,
      upcomingBirthdays: upcomingBirthdays.length,
    },
    upcomingBirthdays,
    recentUsers: users.slice(-10).reverse().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      company: u.company,
      createdAt: u.createdAt,
    })),
  });
}
