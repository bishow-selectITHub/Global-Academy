// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated and is superadmin
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const {
      data: { user: caller },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Check role from user_roles or metadata
    let isSuperadmin = false;
    try {
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id)
        .maybeSingle();
      const metaRole = (caller.user_metadata?.role || "").toString().toLowerCase();
      const dbRole = (roleRow?.role || "").toString().toLowerCase();
      isSuperadmin = metaRole === "superadmin" || dbRole === "superadmin";
    } catch (_) { }

    if (!isSuperadmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const id: string | undefined = body?.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing user ID" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Prevent caller from deleting themselves
    if (caller.id === id) {
      return new Response(JSON.stringify({ error: "You cannot delete your own account" }), {
        status: 409,
        headers: corsHeaders,
      });
    }

    // Delete from Auth first
    const { error: authDelErr } = await supabase.auth.admin.deleteUser(id);
    if (authDelErr) {
      return new Response(JSON.stringify({ error: authDelErr.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Best-effort cleanup in app tables
    await supabase.from("user_roles").delete().eq("user_id", id);
    await supabase.from("users").delete().eq("id", id);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
