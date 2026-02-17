/**
 * Birthday Protocol Worker
 * ========================
 * Cloudflare Cron Trigger — scans events for birthdays within the next 7 days
 * and marks them as "notified". In production, this would trigger an email,
 * WhatsApp message, or push notification to the concierge team.
 *
 * Schedule: daily at 8:00 AM WAT (07:00 UTC)
 *
 * wrangler.jsonc addition needed:
 * "triggers": { "crons": ["0 7 * * *"] }
 *
 * For now, this is a standalone script demonstrating the pattern.
 * The in-memory store won't persist across Worker invocations —
 * production will use D1 queries directly.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Env {
  DB: any; // D1Database — typed via @cloudflare/workers-types in production
}

interface BirthdayEvent {
  id: string;
  name: string;
  date: string;
  userId: string;
  userName: string;
  userEmail: string;
  relationship: string;
}

export default {
  async scheduled(
    _controller: unknown,
    env: Env,
    _ctx: unknown
  ): Promise<void> {
    console.log("[Birthday Worker] Running daily scan...");

    const now = new Date();
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    // Normalise to MM-DD for anniversary matching
    const todayMMDD = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const endMMDD = `${String(inSevenDays.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(inSevenDays.getDate()).padStart(2, "0")}`;

    try {
      // Query D1 for events whose MM-DD falls within the window
      // and haven't been notified this year
      const currentYear = now.getFullYear();
      const results = await env.DB.prepare(
        `SELECT e.id, e.name, e.date, e.relationship, e.user_id,
                u.name as user_name, u.email as user_email
         FROM events e
         JOIN users u ON e.user_id = u.id
         WHERE substr(e.date, 6, 5) BETWEEN ? AND ?
           AND (e.notified_at IS NULL OR substr(e.notified_at, 1, 4) != ?)`
      )
        .bind(todayMMDD, endMMDD, String(currentYear))
        .all();

      const birthdays = (results.results || []) as BirthdayEvent[];
      console.log(
        `[Birthday Worker] Found ${birthdays.length} upcoming birthdays`
      );

      for (const bday of birthdays) {
        // In production: send notification (email/push/WhatsApp)
        console.log(
          `[Birthday Worker] 🎂 ${bday.name} — ${bday.date} (client: ${bday.userName})`
        );

        // Mark as notified
        await env.DB.prepare(
          `UPDATE events SET notified_at = ? WHERE id = ?`
        )
          .bind(now.toISOString(), bday.id)
          .run();
      }

      console.log("[Birthday Worker] Scan complete.");
    } catch (err) {
      console.error("[Birthday Worker] Error:", err);
    }
  },
};
