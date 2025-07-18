import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // ✅ Auth Check
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("VITE_SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Defensive JSON parsing and logging
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.log("Invalid JSON body received");
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    const room_name = body?.room_name;
    console.log("Received from frontend:", body);
    if (!room_name) {
      console.log("room_name is missing or empty!", room_name);
      return new Response(JSON.stringify({ error: "room_name is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    console.log("Sending to 100ms:", {
      name: room_name,
      description: `Scheduled by ${user.email}`,
    });

    const appAccessKey = Deno.env.get("HMS_ACCESS_KEY");
    const appSecret = Deno.env.get("HMS_SECRET");
    console.log("HMS_ACCESS_KEY:", appAccessKey);
    console.log("HMS_SECRET:", appSecret); // 🔒 Safe to log the first few characters only
    // Generate 100ms Management JWT
    const header: Header = { alg: "HS256", typ: "JWT" };
    const payload: Payload = {
      access_key: appAccessKey,
      type: "management",
      version: 2,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 5), // valid for 5 minutes
      jti: crypto.randomUUID(), // ✅ add this
    };
    const encoder = new TextEncoder();
const secretKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(appSecret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

const mgmtToken = await create(header, payload, secretKey);


    const response = await fetch("https://api.100ms.live/v2/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: room_name,
        description: `Scheduled by ${user.email}`,
      }),
    });

    let data;
    try {
      data = await response.json();
      console.log("100ms API raw response:", data);
    } catch (e) {
      console.log("Error parsing 100ms API response:", e);
      return new Response(JSON.stringify({ error: "Failed to parse 100ms API response" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    if (!data || !data?.name) {
      console.log("100ms API error or unexpected response:", data);
      return new Response(JSON.stringify({ error: (data && data.error) || "Unknown error from 100ms" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
