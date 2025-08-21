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

  // Add responsive styles for the video interface
  useEffect(() => {
    // Add custom CSS for mobile responsiveness
    const style = document.createElement('style')
    style.textContent = `
      /* Mobile responsive styles for 100ms video interface */
      @media (max-width: 768px) {
        /* Ensure the leave button is visible and accessible */
        [data-testid="leave-room-button"],
        .leave-room-button,
        .leave-button,
        button[title*="leave"],
        button[aria-label*="leave"],
        .hms-ui button:last-child,
        .hms-ui .control-bar button:last-child {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 9999 !important;
          background-color: #dc2626 !important;
          color: white !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          min-width: 80px !important;
          text-align: center !important;
          border: none !important;
          font-size: 14px !important;
          line-height: 1.2 !important;
          cursor: pointer !important;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Make participant tiles responsive */
        .participant-tile {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 16/9 !important;
        }
        
        /* Ensure controls are touch-friendly */
        .control-button {
          min-width: 44px !important;
          min-height: 44px !important;
          padding: 8px !important;
        }
        
        /* Mobile-optimized grid layout */
        .participant-grid {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
          padding: 8px !important;
        }
        
        /* Ensure bottom controls are visible */
        .bottom-controls {
          position: fixed !important;
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 1000 !important;
          background: rgba(0, 0, 0, 0.8) !important;
          border-radius: 12px !important;
          padding: 8px !important;
        }
        
        /* Handle landscape orientation on mobile */
        @media (orientation: landscape) and (max-height: 500px) {
          .bottom-controls {
            bottom: 10px !important;
            padding: 6px !important;
          }
          
          [data-testid="leave-room-button"],
          .leave-room-button,
          .leave-button,
          button[title*="leave"],
          button[aria-label*="leave"],
          .hms-ui button:last-child,
          .hms-ui .control-bar button:last-child {
            top: 10px !important;
            right: 10px !important;
            padding: 8px 12px !important;
          }
        }
        
        /* Additional selectors for 100ms leave button */
        .hms-ui .control-bar,
        .hms-ui .bottom-controls,
        .hms-ui .footer {
          z-index: 9998 !important;
        }
        
        /* Ensure the leave button is not hidden by other elements */
        .hms-ui .control-bar button,
        .hms-ui .bottom-controls button,
        .hms-ui .footer button {
          z-index: 9999 !important;
        }
      }
      
      /* Ensure the video interface takes full screen on mobile */
      .hms-video-container {
        width: 100vw !important;
        height: 100vh !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 1 !important;
      }
      
      /* Additional mobile optimizations */
      .hms-mobile .hms-video-container {
        /* Force mobile layout */
        overflow: hidden !important;
      }
      
      /* Ensure video elements are responsive */
      .hms-mobile video {
        object-fit: cover !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Mobile-optimized participant list */
      .hms-mobile .participant-list {
        position: fixed !important;
        right: 0 !important;
        top: 0 !important;
        height: 100vh !important;
        width: 250px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        transform: translateX(100%) !important;
        transition: transform 0.3s ease !important;
        z-index: 1001 !important;
      }
      
      .hms-mobile .participant-list.open {
        transform: translateX(0) !important;
      }
    `
    document.head.appendChild(style)

    // Handle resize and orientation changes
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      // Update CSS variables for responsive behavior
      document.documentElement.style.setProperty('--is-mobile', isMobile ? '1' : '0')

      // Force re-render of 100ms interface on orientation change
      if (window.innerWidth < 768) {
        // Add mobile-specific classes
        document.body.classList.add('hms-mobile')
      } else {
        document.body.classList.remove('hms-mobile')
      }
    }

    // Initial call
    handleResize()

    // Add event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      document.head.removeChild(style)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      document.body.classList.remove('hms-mobile')
    }
  }, [])

  return (
    <div ref={ref} className="w-full h-full min-h-screen">
      {/* Responsive wrapper for mobile */}
      <div className="relative w-full h-full">
        <HMSRoomProvider>
          <SessionWatcher onSessionStarted={onSessionStarted} />

          {/* Connection Error Display */}
          {connectionError && (
            <div className="fixed top-2 sm:top-4 left-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 max-w-xs sm:max-w-md w-auto sm:w-full">
              <div className="flex items-start sm:items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-red-800">{connectionError}</p>
                  {isRetrying && <p className="text-xs text-red-600 mt-1">Retrying connection...</p>}
                </div>
                <button
                  onClick={() => setConnectionError(null)}
                  className="ml-2 sm:ml-auto -mx-1 -my-1 sm:-mx-1.5 sm:-my-1.5 bg-red-50 text-red-500 rounded-lg p-1 sm:p-1.5 hover:bg-red-100 flex-shrink-0"
                >
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
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

          <Prebuilt
            authToken={token}
            userName={userName}
            config={{
              // Mobile responsive configuration
              isMobile: window.innerWidth < 768,
              // Ensure controls are visible on mobile
              showLeaveButton: true,
              showParticipantList: true,
              showChat: true,
              // Mobile-optimized layout
              layout: {
                grid: {
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: window.innerWidth < 768 ? '8px' : '16px'
                }
              },
              // Ensure buttons are touch-friendly
              theme: {
                palette: {
                  primary: {
                    main: '#3B82F6'
                  }
                },
                // Mobile-optimized button sizes
                components: {
                  button: {
                    borderRadius: '8px',
                    padding: window.innerWidth < 768 ? '12px 16px' : '8px 16px'
                  }
                }
              },
              // Additional mobile optimizations
              settings: {
                // Ensure video quality is appropriate for mobile
                video: {
                  quality: window.innerWidth < 768 ? 'medium' : 'high'
                },
                // Mobile-optimized audio settings
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true
                }
              },
              // Force mobile layout on small screens
              forceMobileLayout: window.innerWidth < 768,
              // Ensure all controls are accessible
              showControls: true,
              showSettings: true,
              showStats: false, // Hide stats on mobile to save space
              // Mobile-optimized participant display
              participantDisplay: {
                maxParticipants: window.innerWidth < 768 ? 4 : 9,
                aspectRatio: window.innerWidth < 768 ? '16:9' : '4:3'
              }
            }}
          />
        </HMSRoomProvider>
      </div>
    </div>
  )
})
