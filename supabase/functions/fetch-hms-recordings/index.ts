// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate, type Header, type Payload } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }

    // Get request body
    const { room_id } = await req.json()
    console.log('[fetch-hms-recordings] request received', { room_id })

    if (!room_id) {
      throw new Error('room_id is required')
    }

    // Create HMS management token (short-lived) like in create-hms-room
    const appAccessKey = Deno.env.get("HMS_ACCESS_KEY")
    const appSecret = Deno.env.get("HMS_SECRET")
    if (!appAccessKey || !appSecret) {
      throw new Error('Missing HMS_ACCESS_KEY/HMS_SECRET in environment variables')
    }
    const header: Header = { alg: "HS256", typ: "JWT" }
    const payload: Payload = {
      access_key: appAccessKey,
      type: "management",
      version: 2,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 5),
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
    const HMS_MANAGEMENT_TOKEN = await create(header, payload, secretKey)

    // Find the live room in database
    const { data: liveRoom, error: liveRoomError } = await supabase
      .from("live_rooms")
      .select("*")
      .eq("id", room_id)
      .single()

    if (liveRoomError || !liveRoom) {
      throw new Error('Live room not found')
    }
    console.log('[fetch-hms-recordings] live room found', { id: liveRoom.id, room_name: liveRoom.room_name, hms_room_id: liveRoom.room_id })

    // Fetch recordings from 100ms API using the HMS room_id
    // Try 100ms recordings both by room and sessions for completeness
    const recordingsUrl = `https://api.100ms.live/v2/recordings?room_id=${liveRoom.room_id}`
    const sessionsUrl = `https://api.100ms.live/v2/sessions?room_id=${liveRoom.room_id}`

    const hmsResponse = await fetch(recordingsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('[fetch-hms-recordings] HMS API status', hmsResponse.status)
    if (!hmsResponse.ok) {
      const errorText = await hmsResponse.text()
      throw new Error(`HMS API error: ${hmsResponse.status} - ${errorText}`)
    }

    const hmsData = await hmsResponse.json()
    let recordings = hmsData.data || []
    console.log('[fetch-hms-recordings] HMS recordings fetched', { count: recordings.length })

    // If none returned, attempt to enumerate sessions and collect recordings per session
    if (recordings.length === 0) {
      try {
        const sessionsResp = await fetch(sessionsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        })
        console.log('[fetch-hms-recordings] HMS sessions status', sessionsResp.status)
        if (sessionsResp.ok) {
          const sessionsData = await sessionsResp.json()
          const sessions = sessionsData.data || []
          console.log('[fetch-hms-recordings] HMS sessions fetched', { count: sessions.length })

          const perSessionPromises = sessions.map((sess: any) =>
            fetch(`https://api.100ms.live/v2/recordings?session_id=${sess.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
                'Content-Type': 'application/json',
              },
            })
          )
          const perSessionResults = await Promise.allSettled(perSessionPromises)
          const merged: any[] = []
          for (const r of perSessionResults) {
            if (r.status === 'fulfilled' && r.value.ok) {
              const js = await r.value.json().catch(() => ({}))
              if (js?.data?.length) merged.push(...js.data)
            }
          }
          if (merged.length > 0) {
            recordings = merged
            console.log('[fetch-hms-recordings] merged recordings from sessions', { count: recordings.length })
          }
        }
      } catch (e) {
        console.error('[fetch-hms-recordings] session enumeration error', e)
      }
    }

    if (recordings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No recordings found for this session",
          count: 0
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Process each recording and store in recordings table
    let processedCount = 0

    // Process each recording
    for (const recording of recordings) {
      // Log minimal info about the recording object for debugging
      try {
        console.log('[fetch-hms-recordings] recording item', {
          id: recording?.id,
          status: recording?.status,
          has_url: !!recording?.recording_url,
        })
      } catch (_) { }

      // Obtain a downloadable URL if not provided
      let downloadUrl: string | null = recording.recording_url || null
      if (!downloadUrl) {
        try {
          const postResp = await fetch(`https://api.100ms.live/v2/recordings/${recording.id}/download`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}`,
              'Content-Type': 'application/json',
            },
          })
          console.log('[fetch-hms-recordings] download POST status', postResp.status)
          if (postResp.ok) {
            const body = await postResp.json().catch(() => ({}))
            downloadUrl = body?.url || body?.download_url || null
          }
          // If accepted or URL not yet available, poll GET a few times
          if (!downloadUrl && (postResp.status === 202 || postResp.ok)) {
            for (let i = 0; i < 6 && !downloadUrl; i++) {
              await new Promise((r) => setTimeout(r, 1500))
              try {
                const getResp = await fetch(`https://api.100ms.live/v2/recordings/${recording.id}/download`, {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                })
                if (getResp.ok) {
                  const body = await getResp.json().catch(() => ({}))
                  const u = body?.url || body?.download_url || null
                  if (u) downloadUrl = u
                }
              } catch (_) { }
            }
          }
          if (downloadUrl) {
            console.log('[fetch-hms-recordings] obtained download url', { id: recording.id })
          }
        } catch (e) {
          console.warn('[fetch-hms-recordings] download url retrieval failed', e)
        }
      }

      try {
        // Store recording metadata with direct 100ms URL (no file download needed)
        console.log(`[fetch-hms-recordings] storing recording metadata`, { id: recording.id })
        
        // Create recording metadata with direct 100ms URL
        const fileName = `${liveRoom.room_name}_${recording.id}.mp4`
        const recordingData = {
          recording_id: recording.id, // Use recording_id field from the table
          room_id: room_id,
          room_name: liveRoom.room_name,
          file_name: fileName,
          url: downloadUrl, // Direct 100ms URL
          status: recording.status || 'completed',
          resolution: recording.resolution,
          max_width: recording.max_width,
          max_height: recording.max_height,
          source: recording.source || '100ms',
          size: (recording as any)?.size ?? null,
          duration: recording.started_at && recording.stopped_at 
            ? Math.round((new Date(recording.stopped_at).getTime() - new Date(recording.started_at).getTime()) / 1000)
            : null,
          started_at: recording.started_at,
          stopped_at: recording.stopped_at,
          synced_at: new Date().toISOString()
        }

        // Insert into the new recordings table
        const { error: insertError } = await supabase
          .from("recordings")
          .insert(recordingData)

        if (insertError) {
          console.error(`Failed to insert recording ${recording.id}:`, insertError)
          continue
        }

        console.log(`Recording ${recording.id} stored successfully in recordings table`)
        processedCount++
        console.log('[fetch-hms-recordings] processed recording', { id: recording.id })

      } catch (error) {
        console.error(`[fetch-hms-recordings] error processing recording ${recording.id}:`, error)
        continue
      }
    }

    console.log('[fetch-hms-recordings] completed', { processedCount })
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${processedCount} recordings`,
        count: processedCount
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('[fetch-hms-recordings] handler error:', error)
    return new Response(
      JSON.stringify({
        error: (error as any)?.message || 'Internal server error'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})