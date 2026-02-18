/* ═══════════════════════════════════════════════
   Cloudflare D1 — Runtime Helper
   Returns the raw D1 binding or null for local dev
   ═══════════════════════════════════════════════ */

/** Minimal D1 types (avoids @cloudflare/workers-types dependency) */
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1 {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface CloudflareEnv {
  DB: D1;
  tedlynsdb: D1;
}

// Static ESM import — the module is installed, so webpack resolves it.
// At runtime, getRequestContext() throws when there's no CF context (local dev).

/**
 * Get the D1 database binding from Cloudflare Pages runtime.
 * Returns null when running under `next dev` (no Cloudflare context).
 *
 * Uses dynamic import() with webpackIgnore so the bundler skips resolution.
 * At runtime on CF Pages the module is available; locally it throws → null.
 */
export async function getCloudflareDb(): Promise<D1 | null> {
  let getRequestContext: undefined | (() => unknown);
  try {
    ({ getRequestContext } = await import("@cloudflare/next-on-pages"));
  } catch {
    // Local dev: module isn't available / context isn't present.
    return null;
  }

  let ctx: { env?: Partial<CloudflareEnv> };
  try {
    ctx = getRequestContext() as unknown as { env?: Partial<CloudflareEnv> };
  } catch {
    // Local dev: no request context.
    return null;
  }

  const env = (ctx?.env ?? {}) as Partial<CloudflareEnv> & Record<string, unknown>;
  const db = (env.DB as D1 | undefined) ?? (env.tedlynsdb as D1 | undefined) ?? null;
  if (!db) {
    // On Pages/Workers, missing DB binding causes signup/login to appear to work
    // but actually uses the in-memory fallback, which resets between requests.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Cloudflare D1 binding is missing. Add a D1 binding named 'DB' (preferred) or 'tedlynsdb' in your Pages project settings."
      );
    }
    return null;
  }

  return db;
}
