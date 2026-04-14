// src/pages/api/publish-scheduled.ts
// Publishes blog posts where scheduled_for <= NOW() and published = false
// Called by:
//   - Vercel cron (daily, free tier) via POST
//   - GitHub Actions (hourly, free) via GET or POST
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase";

export const prerender = false;

// ── Timing-safe string comparison ──
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ── Shared handler ──
async function handlePublishScheduled(request: Request): Promise<Response> {
  // ── Security: verify cron secret ──
  // Vercel sends: Authorization: Bearer <CRON_SECRET>
  // GitHub Actions sends: x-cron-secret: <CRON_SECRET>
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader   = request.headers.get("authorization");
    const secretHeader = request.headers.get("x-cron-secret");

    // Use timing-safe comparison
    const validBearer = authHeader ? safeCompare(authHeader, `Bearer ${cronSecret}`) : false;
    const validHeader = secretHeader ? safeCompare(secretHeader, cronSecret) : false;

    if (!validBearer && !validHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  try {
    const supabase = createAdminClient();
    const now      = new Date().toISOString();

    // ── Find all posts due for publishing ──
    const { data: duePosts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, scheduled_for")
      .eq("published", false)
      .not("scheduled_for", "is", null)
      .lte("scheduled_for", now);

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    if (!duePosts || duePosts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          published: [],
          message: "No posts due for publishing",
          checked_at: now,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Publish due posts ──
    const ids = duePosts.map((p) => p.id);

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        published:     true,
        scheduled_for: null,       // clear schedule after publishing
        pub_date:      now,        // set pub_date to now if not already set
      })
      .in("id", ids);

    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`);
    }

    const publishedTitles = duePosts.map((p) => p.title);

    console.log(
      `[Cron] Published ${ids.length} scheduled posts:`,
      publishedTitles
    );

    return new Response(
      JSON.stringify({
        success:      true,
        published:    publishedTitles,
        count:        ids.length,
        published_at: now,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Cron] publish-scheduled failed:", message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ── Support both GET (curl default) and POST (Vercel cron) ──
export const GET:  APIRoute = ({ request }) => handlePublishScheduled(request);
export const POST: APIRoute = ({ request }) => handlePublishScheduled(request);
