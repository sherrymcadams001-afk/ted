import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * POST /api/admin/upload
 * Accepts multipart form-data with a "file" field.
 * Stores in Supabase Storage bucket and returns the public URL.
 * Falls back to base64 data-URL for local dev (no Supabase config).
 */
export const runtime = "edge";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function POST(req: Request) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitise filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "avif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: `Unsupported format: .${ext}` }, { status: 400 });
    }

    const slug = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${slug}-${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const supabase = getSupabaseConfig();

    if (supabase) {
      // Production: upload to Supabase Storage
      const contentType =
        ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "png" ? "image/png"
        : ext === "webp" ? "image/webp"
        : "image/avif";

      const uploadRes = await fetch(
        `${supabase.url}/storage/v1/object/menu-images/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabase.key}`,
            "Content-Type": contentType,
            "x-upsert": "true",
          },
          body: bytes,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Supabase upload error:", errText);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }

      // Return the public URL path (served via our CDN proxy route)
      return NextResponse.json({ path: `/cdn/menu/${filename}` });
    }

    // Local dev fallback: return base64 data URL (image will display but not persist across restarts)
    const base64 = btoa(
      new Uint8Array(bytes).reduce((s, b) => s + String.fromCharCode(b), "")
    );
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return NextResponse.json({ path: `data:${mime};base64,${base64}` });
  } catch (err) {
    console.error("POST /api/admin/upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
