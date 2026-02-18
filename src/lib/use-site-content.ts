"use client";

import { useState, useEffect } from "react";

/**
 * Fetch admin-editable site content for a page section.
 * Returns a merged map of defaults + DB overrides.
 * Each page makes ONE fetch → Cloudflare edge-cached (60s TTL).
 */
export function useSiteContent(
  page: string,
  defaults: Record<string, string>
): { content: Record<string, string>; loading: boolean } {
  const [content, setContent] = useState<Record<string, string>>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?page=${encodeURIComponent(page)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, string>) => {
        if (cancelled) return;
        // Merge: DB values override defaults, but keep defaults for any missing keys
        setContent((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return { content, loading };
}
