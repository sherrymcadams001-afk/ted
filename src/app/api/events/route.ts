import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import {
  getEventsByUserId,
  createEvent,
  deleteEvent,
  getAllEvents,
} from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  type: z.enum(["corporate", "family"]).default("family"),
  relationship: z.string().optional(),
});

// GET — list events for current user (or all for admin)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const d1 = await getCloudflareDb();
  const isAdmin = (session.user as { role: string }).role === "admin";
  const events = isAdmin
    ? await getAllEvents(d1)
    : await getEventsByUserId(session.user.id, d1);

  return NextResponse.json({ events });
}

// POST — create a new event
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = eventSchema.parse(body);

    const d1 = await getCloudflareDb();
    const event = await createEvent({
      userId: session.user.id,
      name: data.name,
      date: data.date,
      type: data.type,
      relationship: data.relationship ?? null,
    }, d1);

    return NextResponse.json({ event }, { status: 201 });
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

// DELETE — remove an event
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  const d1 = await getCloudflareDb();
  const success = await deleteEvent(id, session.user.id, d1);
  if (!success) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
