// src/pages/api/sync.ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { syncFallbackToSupabase } from "@/lib/syncFallbackData";
import { createAdminClient } from "@/lib/supabase";

export const prerender = false;

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Helper to get the last sync time from Supabase (persistent across serverless invocations)
async function getLastSyncTime(): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "last_sync_time")
      .single();

    if (error || !data) {
      return null;
    }

    return (data.value as any)?.timestamp ?? null;
  } catch {
    console.error("[Sync] Failed to get last sync time from database");
    return null;
  }
}

// Helper to set the last sync time in Supabase
async function setLastSyncTime(timestamp: number): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "last_sync_time", value: { timestamp }, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      console.error("[Sync] Failed to set last sync time:", error.message);
    }
  } catch (err) {
    console.error("[Sync] Failed to set last sync time:", err);
  }
}

export const POST: APIRoute = async () => {
  const now = Date.now();
  const supabase = createAdminClient();

  // Rate limiting: check cooldown and update timestamp atomically
  // We combine the check and update to minimize race condition window
  const { data: existingData, error: selectError } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "last_sync_time")
    .single();

  let lastSyncTime: number | null = null;
  if (!selectError && existingData) {
    lastSyncTime = (existingData.value as any)?.timestamp ?? null;
  }

  // Check cooldown
  if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncTime)) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        errors: [`Sync is on cooldown. Please wait ${waitSeconds} seconds.`],
        synced: []
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Update timestamp BEFORE sync to minimize race condition window
  // Note: For a truly atomic operation, consider using an RPC or database transaction
  const { error: upsertError } = await supabase
    .from("app_settings")
    .upsert(
      { key: "last_sync_time", value: { timestamp: now }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (upsertError) {
    console.error("[Sync] Failed to update sync time:", upsertError);
  }

  try {
    // 1. Fetch blog posts in the Astro server environment
    const blogPosts = await getCollection("blog");

    // 2. Pass the fetched data to the sync function
    const result = await syncFallbackToSupabase(blogPosts);

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred on the server.";
    console.error("[Sync] Error:", error);
    return new Response(
      JSON.stringify({ success: false, errors: [errorMessage], synced: [] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
