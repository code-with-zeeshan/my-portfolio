// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase";
import { sanitizeInput } from "@/lib/utils";

export const prerender = false;

const RATE_LIMIT_MS = 60 * 1000; // 1 minute

// Helper to get the last submission time for an email
async function getLastSubmissionTime(email: string): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_rate_limits")
      .select("last_submission")
      .eq("email", email)
      .single();

    if (error || !data) {
      return null;
    }

    return (data.last_submission as number) ?? null;
  } catch {
    console.error("[Contact] Failed to get rate limit data");
    return null;
  }
}

// Helper to set the last submission time for an email
async function setLastSubmissionTime(email: string, timestamp: number): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_rate_limits")
      .upsert(
        { email, last_submission: timestamp, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[Contact] Failed to set rate limit data:", error.message);
    }
  } catch (err) {
    console.error("[Contact] Failed to set rate limit data:", err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate name
    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 2 and 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate message length
    if (message.length < 10 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 10 and 2000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Server-side rate limiting
    const lastSubmissionTime = await getLastSubmissionTime(email);
    const now = Date.now();

    if (lastSubmissionTime && now - lastSubmissionTime < RATE_LIMIT_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastSubmissionTime)) / 1000);
      return new Response(
        JSON.stringify({ error: `Please wait ${waitSeconds} seconds before sending another message` }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize user inputs to prevent XSS
    const data = {
      name: sanitizeInput(name).trim(),
      email: email.trim().toLowerCase(),
      message: sanitizeInput(message).trim(),
    };

    // Insert into Supabase
    const supabase = createAdminClient();
    const { error } = await supabase.from("messages").insert(data);

    if (error) {
      console.error("[Contact] Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send message. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update rate limit
    await setLastSubmissionTime(email, now);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[Contact] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
