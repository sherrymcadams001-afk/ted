import { NextRequest, NextResponse } from "next/server";
import { getSiteContentByPage } from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page");
  if (!page) {
    return NextResponse.json({ error: "Missing page param" }, { status: 400 });
  }

  try {
    const d1 = await getCloudflareDb();
    const content = await getSiteContentByPage(page, d1);

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({});
  }
}
