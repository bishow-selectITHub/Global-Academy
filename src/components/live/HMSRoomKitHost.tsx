"use client"

import { useEffect, useRef, useState, forwardRef } from "react"
import { HMSPrebuilt } from "@100mslive/roomkit-react"
import { HMSRoomProvider, useHMSStore, selectIsConnectedToRoom, selectRoom } from "@100mslive/react-sdk"

type HMSRoomKitHostProps = {
  token: string
  userName: string
  roomId?: string
  sessionId?: string
  onRoomEnd?: () => void
  onSessionStarted?: (sessionId: string, roomId?: string) => void
}

function SessionWatcher({ onSessionStarted }: { onSessionStarted?: (sessionId: string, roomId?: string) => void }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const room = useHMSStore(selectRoom)
  const didEmitRef = useRef(false)

  useEffect(() => {
    console.log("🚀 [DEBUG] SessionWatcher useEffect triggered:", {
      didEmitRef: didEmitRef.current,
      isConnected,
      hasSessionId: !!room?.sessionId,
      sessionId: room?.sessionId,
      roomId: room?.id,
      roomName: room?.name,
    })

    if (!didEmitRef.current && isConnected && room?.sessionId) {
      didEmitRef.current = true
      try {
        // Log the HMS session instance details when available
        console.log("🚀 [APP][HMS] Session started:", { sessionId: room.sessionId, roomId: room?.id })
        onSessionStarted?.(room.sessionId as unknown as string, room?.id)
      } catch (_err) {
        console.error("❌ Error in onSessionStarted callback:", _err)
      }
    }
  }, [isConnected, room?.sessionId, onSessionStarted, room?.id])

  return null
}

export default forwardRef<HTMLDivElement, HMSRoomKitHostProps>(function HMSRoomKitHost(
  { token, userName, onRoomEnd, onSessionStarted },
  ref,
) {
  console.log("🚀 [DEBUG] HMSRoomKitHost rendered with props:", {
    hasToken: !!token,
    tokenLength: token?.length,
    userName,
    hasOnSessionStarted: !!onSessionStarted,
    hasOnRoomEnd: !!onRoomEnd,
  })
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Listen for HMS connection errors
    const handleHMSConnectionError = (event: any) => {
      if (event.detail && event.detail.error) {
        const error = event.detail.error

        // Handle specific ICE connection errors
        if (error.code === 4006 || error.code === 4005) {
          setConnectionError(`Connection issue: ${error.message}. This is usually a network problem.`)

          // Auto-retry after 3 seconds for non-terminal errors
          if (!error.isTerminal) {
            setTimeout(() => {
              setIsRetrying(true)
              // You can implement retry logic here
              setTimeout(() => setIsRetrying(false), 2000)
            }, 3000)
          }
        }
      }
    }

    // Listen for HMS connection state changes
    const handleHMSConnectionState = (event: any) => {
      console.log("🚀 [DEBUG] HMS connection state changed:", event.detail)
      if (event.detail && event.detail.state === "connected") {
        setConnectionError(null)
        setIsRetrying(false)
      }
    }

    // Add event listeners
    window.addEventListener("hms-connection-error", handleHMSConnectionError)
    window.addEventListener("hms-connection-state", handleHMSConnectionState)

    // Listen for room join events
    const handleRoomJoin = (event: any) => {
      console.log("🚀 [DEBUG] HMS room join event:", event.detail)
    }

    const handleRoomLeave = (event: any) => {
      console.log("🚀 [DEBUG] HMS room leave event:", event.detail)
    }

    window.addEventListener("hms-room-join", handleRoomJoin)
    window.addEventListener("hms-room-leave", handleRoomLeave)

    return () => {
      window.removeEventListener("hms-connection-error", handleHMSConnectionError)
      window.removeEventListener("hms-connection-state", handleHMSConnectionState)
      window.removeEventListener("hms-room-join", handleRoomJoin)
      window.removeEventListener("hms-room-leave", handleRoomLeave)
    }
  }, [])

  useEffect(() => {
    // Temporarily reduce HMS console logging by filtering out verbose messages
    const originalLog = console.log
    const originalInfo = console.info
    const originalDebug = console.debug
    const originalWarn = console.warn

    // Override console methods to filter out HMS verbose logs
    console.log = (...args) => {
      const message = args[0]
      if (typeof message === "string" && message.includes("[HMS")) {
        // Only show HMS logs that are important (errors, warnings)
        if (
          !message.includes("[HMSPerformanceTiming]") &&
          !message.includes("[AnalyticsTransport]") &&
          !message.includes("[Device Manager]") &&
          !message.includes("[HMSTransport]") &&
          !message.includes("[SIGNAL]") &&
          !message.includes("[HMSNotificationManager]") &&
          !message.includes("[LocalTrackManager]") &&
          !message.includes("[HMSLocalAudioTrack]") &&
          !message.includes("[HMSLocalVideoTrack]") &&
          !message.includes("[TrackAudioLevelMonitor]") &&
          !message.includes("[VideoElementManager]") &&
          !message.includes("[AudioSinkManager]") &&
          !message.includes("[ui-logger]") &&
          !message.includes("HMS-Store:") &&
          !message.includes("audio sink created") &&
          !message.includes("Adding video element for") &&
          !message.includes("add sink intersection") &&
          !message.includes("Stopping track Monitor") &&
          !message.includes("possible inconsistency detected")
        ) {
          originalLog(...args)
        }
      } else {
        // Pass-through non-HMS logs
        originalLog(...args)
      }
    }

    console.info = (...args) => {
      const message = args[0]
      if (typeof message === "string" && message.includes("[HMS")) {
        // Only show HMS info logs that are important
        if (
          !message.includes("[HMSPerformanceTiming]") &&
          !message.includes("[AnalyticsTransport]") &&
          !message.includes("[Device Manager]") &&
          !message.includes("[VideoElementManager]") &&
          !message.includes("[AudioSinkManager]") &&
          !message.includes("[TrackAudioLevelMonitor]")
        ) {
          originalInfo(...args)
        }
      } else {
        // Pass-through non-HMS logs
        originalInfo(...args)
      }
    }

    console.debug = (...args) => {
      // Suppress all HMS debug logs, pass-through others
      const message = args[0]
      if (typeof message === "string" && message.includes("[HMS")) {
        return
      }
      originalDebug(...args)
    }

    console.warn = (...args) => {
      // Only filter HMS warnings we know are noisy; pass-through others
      const message = args[0]
      if (typeof message === "string" && message.includes("[HMS")) {
        if (!message.includes("possible inconsistency detected")) {
          originalWarn(...args)
        }
      } else {
        // Pass-through non-HMS warnings
        originalWarn(...args)
      }
    }

    // Expose a simple hook to end session from outside if needed
    const end = () => {
      try {
        onRoomEnd?.()
      } catch (_) {
        // no-op
      }
    }
      ; (window as any).endLiveSession = end
    return () => {
      // Restore original console methods
      console.log = originalLog
      console.info = originalInfo
      console.debug = originalDebug
      console.warn = originalWarn
      delete (window as any).endLiveSession
    }
  }, [onRoomEnd])

  // Cast to any to accommodate version prop differences
  const Prebuilt: any = HMSPrebuilt as unknown as any
  return (
    <div ref={ref} className="w-full h-full">
      <HMSRoomProvider>
        <SessionWatcher onSessionStarted={onSessionStarted} />

        {/* Connection Error Display */}
        {connectionError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{connectionError}</p>
                {isRetrying && <p className="text-xs text-red-600 mt-1">Retrying connection...</p>}
              </div>
              <button
                onClick={() => setConnectionError(null)}
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <Prebuilt authToken={token} userName={userName} />
      </HMSRoomProvider>
    </div>
  )
})
