import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { create, getNumericDate, type Header, type Payload } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    const supabase = createClient(Deno.env.get("VITE_SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const body = await req.json()
    const { room_id, role = "guest" } = body

    console.log("Token generation request:", { room_id, role, user_id: user.id })

    if (!room_id) {
      return new Response(JSON.stringify({ error: "room_id is required" }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const appAccessKey = Deno.env.get("HMS_ACCESS_KEY")
    const appSecret = Deno.env.get("HMS_SECRET")

    if (!appAccessKey || !appSecret) {
      return new Response(JSON.stringify({ error: "HMS credentials not configured" }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    // Generate auth token for joining room
    const header: Header = { alg: "HS256", typ: "JWT" }
    const payload: Payload = {
      access_key: appAccessKey,
      room_id: room_id,
      user_id: user.id,
      role: role,
      type: "app",
      version: 2,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 24), // 24 hours
      jti: crypto.randomUUID(),
    }

    const encoder = new TextEncoder()
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    )

    const authToken = await create(header, payload, secretKey)

    console.log("Generated auth token successfully")

    return new Response(
      JSON.stringify({
        token: authToken,
        room_id: room_id,
        user_id: user.id,
        role: role,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    )
  } catch (error) {
    console.error("Token generation error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
