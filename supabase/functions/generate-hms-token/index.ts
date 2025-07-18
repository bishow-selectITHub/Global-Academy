import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*", // Change to your domain for production
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Defensive JSON parsing and logging
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.log("Invalid JSON body received");
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    const { user_id, room_id, role } = body;
    console.log("Received from frontend:", body);
    if (!user_id || !room_id || !role) {
      console.log("Missing required fields:", { user_id, room_id, role });
      return new Response(JSON.stringify({ error: "user_id, room_id, and role are required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const appAccessKey = Deno.env.get("HMS_ACCESS_KEY");
    const appSecret = Deno.env.get("HMS_SECRET");
    if (!appAccessKey || !appSecret) {
      console.log("Missing HMS_ACCESS_KEY or HMS_SECRET env vars");
      return new Response(JSON.stringify({ error: "Server misconfiguration: missing HMS credentials" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    console.log("Sending to 100ms:", { user_id, room_id, role });
    let response;
    try {
      response = await fetch("https://api.100ms.live/v2/room/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${appAccessKey}:${appSecret}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          room_id,
          role, // 'host' or 'guest', must match 100ms dashboard roles
        }),
      });
      console.log("Received response from 100ms");
      console.log("100ms API status:", response.status);
      console.log("100ms API headers:", [...response.headers]);
    } catch (e) {
      console.log("Error during fetch to 100ms:", e);
      return new Response(JSON.stringify({ error: "Failed to reach 100ms API" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    let rawText = await response.text();
    console.log("100ms API raw text:", rawText);
    let data;
    try {
      data = JSON.parse(rawText);
      console.log("100ms API parsed JSON:", data);
    } catch (e) {
      console.log("Failed to parse JSON, returning raw text.");
      return new Response(JSON.stringify({ error: "Failed to parse 100ms API response", raw: rawText }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    if (!data || !data.token) {
      console.log("100ms API error or unexpected response:", data);
      return new Response(JSON.stringify({ error: (data && data.error) || "Unknown error from 100ms" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Change to your domain for production
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      status: response.status,
    });
  } catch (err) {
    console.log("Unexpected error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Change to your domain for production
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
});
