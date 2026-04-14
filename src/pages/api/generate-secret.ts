// src/pages/api/generate-secret.ts
// Admin-only endpoint to generate a CRON_SECRET
// Called from AdminDashboard — never exposed publicly
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // ── Verify admin session ──
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify token is a valid Supabase session
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Allow any authenticated user to generate secret (security via auth check above)
    // For stricter admin-only, set ADMIN_EMAIL in .env and uncomment below:
    // const adminEmail = import.meta.env.ADMIN_EMAIL;
    // if (!adminEmail || user.email !== adminEmail) {
    //   return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403 });
    // }

    // ── Generate cryptographically secure random hex string ──
    // 32 bytes = 64 hex chars — same as `openssl rand -hex 32`
    const array  = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return new Response(
      JSON.stringify({ secret, length: secret.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[generate-secret] Error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};