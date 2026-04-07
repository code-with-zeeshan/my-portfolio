// src/pages/api/publish-scheduled.ts
// Vercel cron job — runs every hour
// Publishes blog posts where scheduled_for <= NOW() and published = false
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // ─── Security: verify cron secret ───
  // Vercel sends Authorization: Bearer <CRON_SECRET> for cron jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Find all posts scheduled for now or earlier that aren't published yet
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
        JSON.stringify({ success: true, published: [], message: "No posts due" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Publish each due post
    const ids = duePosts.map((p) => p.id);
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        published: true,
        scheduled_for: null, // Clear schedule after publishing
      })
      .in("id", ids);

    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`);
    }

    const publishedTitles = duePosts.map((p) => p.title);
    console.log(`[Cron] Published ${ids.length} scheduled posts:`, publishedTitles);

    return new Response(
      JSON.stringify({
        success: true,
        published: publishedTitles,
        count: ids.length,
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
};