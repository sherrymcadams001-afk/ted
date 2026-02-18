import { NextResponse } from "next/server";

export const runtime = "edge";

interface R2Bucket {
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

/**
 * GET /cdn/menu/[...path]
 * Serves images from R2 bucket. Falls back to 404 in local dev.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = `menu/${path.join("/")}`;

  const r2 = await getR2Bucket();
  if (!r2) {
    return new NextResponse("R2 not available", { status: 404 });
  }

  const object = await r2.get(key);
  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "png" ? "image/png"
    : ext === "webp" ? "image/webp"
    : ext === "avif" ? "image/avif"
    : "application/octet-stream";

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
