import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * POST /api/admin/upload
 * Accepts multipart form-data with a "file" field.
 * Stores in Cloudflare R2 bucket and returns the public URL.
 * Falls back to base64 data-URL for local dev (no R2 binding).
 */
export const runtime = "edge";

interface R2Bucket {
  put(key: string, body: ArrayBuffer | ReadableStream, options?: Record<string, unknown>): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: Record<string, string> } | null>;
}

async function getR2Bucket(): Promise<R2Bucket | null> {
  try {
    const { getRequestContext } = await import(
      /* webpackIgnore: true */ "@cloudflare/next-on-pages"
    );
    const ctx = getRequestContext() as unknown as { env: { MENU_IMAGES: R2Bucket } };
    return ctx.env.MENU_IMAGES ?? null;
  } catch {
    return null;
  }
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
    const r2 = await getR2Bucket();

    if (r2) {
      // Production: store in R2
      const contentType =
        ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "png" ? "image/png"
        : ext === "webp" ? "image/webp"
        : "image/avif";

      await r2.put(`menu/${filename}`, bytes, {
        httpMetadata: { contentType },
      });

      // Return the public R2 URL (via custom domain or r2.dev)
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
