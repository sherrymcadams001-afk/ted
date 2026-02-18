import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { z } from "zod";
import { findUserByEmail, createUser } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["private", "enterprise"]).default("private"),
  company: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const d1 = await getCloudflareDb();

    // Check if user already exists
    const existing = await findUserByEmail(data.email, d1);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      company: data.company ?? null,
    }, d1);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
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
