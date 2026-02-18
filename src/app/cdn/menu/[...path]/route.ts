import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /cdn/menu/[...path]
 * Proxies images from Supabase Storage public bucket.
 * Falls back to 404 in local dev (no Supabase config).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filename = path.join("/");

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return new NextResponse("Storage not available", { status: 404 });
  }

  // Supabase public bucket URL pattern
  const objectUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${filename}`;

  const upstream = await fetch(objectUrl);
  if (!upstream.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "png" ? "image/png"
    : ext === "webp" ? "image/webp"
    : ext === "avif" ? "image/avif"
    : "application/octet-stream";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
