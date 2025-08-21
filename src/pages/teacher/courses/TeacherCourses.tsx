"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { createPortal } from 'react-dom'
import { Video, Users, Calendar, Play, Copy, Clock } from "lucide-react"
import type { RootState, AppDispatch } from "../../../store"
import { fetchCourses } from "../../../store/coursesSlice"
import { fetchLiveSessions } from "../../../store/liveSessionsSlice"
import { useUser } from "../../../contexts/UserContext"
import { useToast } from "../../../components/ui/Toaster"
import { supabase } from "../../../lib/supabase"
import { fetchEnrollmentsByCourse } from "../../../store/enrollmentsSlice"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost"

const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/generate-hms-token`

const TeacherCourses = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useUser()
    const { addToast } = useToast()

    const { data: courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)
    const { data: liveSessions } = useSelector((state: RootState) => state.liveSessions)
    const { byCourseId: enrollmentsByCourse } = useSelector(
        (state: RootState) => state.enrollments,
    )

    const [joiningSession, setJoiningSession] = useState<string | null>(null)
    const [rooms, setRooms] = useState<any[]>([])
    const [loadingRooms, setLoadingRooms] = useState(false)

    const [videoToken, setVideoToken] = useState<string | null>(null)
    const [videoUserName, setVideoUserName] = useState("")
    const [currentSessionData, setCurrentSessionData] = useState<{ roomId: string; sessionId: string } | null>(null)
    const [pendingRoomId, setPendingRoomId] = useState<string | null>(null)

    const hasPersistedRef = useRef(false)
    const isPersistingRef = useRef(false)
    const hostLiveRoomIdRef = useRef<string | null>(null)
    const hostHmsRoomIdRef = useRef<string | null>(null)
    const persistFallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        dispatch(fetchCourses())
        dispatch(fetchLiveSessions())
    }, [dispatch])

    // Fetch live rooms for teacher's courses
    useEffect(() => {
        const fetchRooms = async () => {
            if (!user?.email || coursesLoading) return

            setLoadingRooms(true)
            try {
                const teacherCourses = courses.filter((course) => course.teacherEmail === user?.email)

                if (teacherCourses.length === 0) {
                    setRooms([])
                    return
                }
                const courseIds = teacherCourses.map((course) => course.id)
                const { data: roomsData, error } = await supabase
                    .from("live_rooms")
                    .select("*")
                    .in("course_id", courseIds)
                    .order("start_time", { ascending: false })

                if (error) throw error
                setRooms(roomsData || [])
            } catch (error) {
                console.error("Error fetching rooms:", error)
                addToast({
                    type: "error",
                    title: "Error",
                    message: "Failed to fetch live rooms.",
                })
            } finally {
                setLoadingRooms(false)
            }
        }

        fetchRooms()
    }, [courses, coursesLoading, user?.email, addToast])

    useEffect(() => {
        if (!coursesLoading && courses.length > 0 && user?.email) {
            const teacherCourses = courses.filter(
                (course) => course.teacherEmail === user?.email
            )

            teacherCourses.forEach((course) => {
                dispatch(fetchEnrollmentsByCourse(course.id))
            })
        }
    }, [dispatch, courses, coursesLoading, user?.email, user?.name])

    const teacherCourses = courses.filter(
        (course) => course.teacherEmail === user?.email)

    const handleJoinSession = async (room: any) => {
        setJoiningSession(room.id)
        try {
            // Reset persistence flags and cleanup from any previous session before starting a new one
            if (persistFallbackTimerRef.current) {
                clearTimeout(persistFallbackTimerRef.current)
                persistFallbackTimerRef.current = null
            }
            hasPersistedRef.current = false
            isPersistingRef.current = false
            setCurrentSessionData(null)
            hostLiveRoomIdRef.current = null
            hostHmsRoomIdRef.current = null
            setPendingRoomId(null)

            console.log("🚀 [DEBUG] handleJoinSession called with room:", {
                roomId: room.id,
                roomHmsId: room.room_id,
                roomData: room,
            })

            const {
                data: { session: authSession },
                error: sessionError,
            } = await supabase.auth.getSession()
            if (sessionError || !authSession?.access_token || !authSession?.user) {
                throw new Error("You must be logged in to join.")
            }

            const roomId = room.room_id
            const role = "host"
            const response = await fetch(GENERATE_TOKEN_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authSession.access_token}`,
                },
                body: JSON.stringify({
                    room_id: roomId,
                    role: role,
                    wait_for_active_session: false,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to generate 100ms token")
            }

            const tokenData = await response.json()
            console.log("🚀 [DEBUG] Token generated successfully:", {
                token: tokenData.token ? "TOKEN_RECEIVED" : "NO_TOKEN",
                roomId,
                role,
            })

            // Persist the live_rooms.id synchronously to avoid state race
            hostLiveRoomIdRef.current = room.id
            hostHmsRoomIdRef.current = room.room_id
            setVideoToken(tokenData.token)
            setVideoUserName(user?.name || user?.email || "Teacher")
            // Track which live_rooms.id we're about to run as host
            setPendingRoomId(room.id)
            console.log("🚀 [DEBUG] pendingRoomId set to:", room.id)

            // Fallback persist after join: poll for an active session id and persist if onSessionStarted didn't run
            try {
                if (persistFallbackTimerRef.current) {
                    clearTimeout(persistFallbackTimerRef.current)
                    persistFallbackTimerRef.current = null
                }
                persistFallbackTimerRef.current = setTimeout(async () => {
                    if (hasPersistedRef.current || isPersistingRef.current) {
                        console.log("[DEBUG] Fallback skipped; already persisted or persisting")
                        return
                    }
                    try {
                        console.log("[DEBUG] Fallback polling for active 100ms session…")
                        const {
                            data: { session: authSession },
                        } = await supabase.auth.getSession()
                        if (!authSession?.access_token) return
                        const res = await fetch(GENERATE_TOKEN_ENDPOINT, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authSession.access_token}`,
                            },
                            body: JSON.stringify({ room_id: room.room_id, role: "host", wait_for_active_session: true }),
                        })
                        const js = await res.json().catch(() => ({}))
                        const fallbackSessionId = js?.session_id || js?.sessionInstanceId
                        console.log("[DEBUG] Fallback token response:", { ok: res.ok, fallbackSessionId })
                        const roomIdToUse = hostLiveRoomIdRef.current || room.id
                        if (fallbackSessionId && roomIdToUse) {
                            isPersistingRef.current = true
                            const { data: existing } = await supabase
                                .from("room_sessions")
                                .select("session_id")
                                .eq("session_id", fallbackSessionId)
                                .maybeSingle()
                            if (!existing) {
                                const { data, error } = await supabase
                                    .from("room_sessions")
                                    .insert({ room_id: roomIdToUse, session_id: fallbackSessionId, active: true })
                                    .select("id")
                                    .single()
                                if (!error && data?.id) {
                                    console.log("[DEBUG] Fallback persisted room_sessions row", data.id)
                                    setCurrentSessionData({ roomId: roomIdToUse, sessionId: data.id })
                                    hasPersistedRef.current = true
                                } else {
                                    console.warn("[DEBUG] Fallback persist failed", error)
                                }
                            } else {
                                console.log("[DEBUG] Fallback found existing room_sessions row; skipping insert")
                            }
                        }
                    } catch (e) {
                        console.warn("[DEBUG] Fallback polling error", e)
                    } finally {
                        isPersistingRef.current = false
                    }
                }, 7000)
            } catch (_) {
                // ignore fallback error
            }
        } catch (error: any) {
            console.error("Error joining session:", error)
            addToast({
                type: "error",
                title: "Error",
                message: error.message || "Failed to join session.",
            })
            // Stop the button spinner on failure
            setJoiningSession(null)
        } finally {
            // Don't reset joiningSession here - let HMS component handle it
        }
    }

    const handleCopyRoomId = async (roomId: string) => {
        try {
            await navigator.clipboard.writeText(roomId)
            addToast({
                type: "success",
                title: "Copied",
                message: "Room ID copied to clipboard.",
            })
        } catch (error) {
            console.error("Failed to copy:", error)
            addToast({
                type: "error",
                title: "Error",
                message: "Failed to copy room ID.",
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "live":
                return "bg-red-500"
            case "scheduled":
                return "bg-yellow-500"
            case "ended":
                return "bg-gray-400"
            default:
                return "bg-gray-400"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "live":
                return "Live Now"
            case "scheduled":
                return "Scheduled"
            case "ended":
                return "Ended"
            default:
                return "Unknown"
        }
    }

    if (videoToken) {
        const modalContent = (
            <div className="fixed inset-0 bg-black" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999 }}>
                {/* Meeting popup container - full screen */}
                <div className="w-full h-full bg-black relative">
                    <button
                        onClick={() => {
                            setVideoToken(null)
                            setVideoUserName("")
                            setCurrentSessionData(null)
                            hasPersistedRef.current = false
                            isPersistingRef.current = false
                            hostLiveRoomIdRef.current = null
                            hostHmsRoomIdRef.current = null
                            setPendingRoomId(null)
                            setJoiningSession(null)
                            if (persistFallbackTimerRef.current) {
                                clearTimeout(persistFallbackTimerRef.current)
                                persistFallbackTimerRef.current = null
                            }
                        }}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Close meeting"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <HMSRoomKitHost
                        token={videoToken}
                        userName={videoUserName}
                        onSessionStarted={async (hmsSessionId, hmsRoomId) => {
                            try {
                                if (hasPersistedRef.current || isPersistingRef.current) {
                                    console.log("[DEBUG] Skipping duplicate onSessionStarted persist")
                                    return
                                }
                                isPersistingRef.current = true
                                console.log("🚀 [DEBUG] onSessionStarted called with:", {
                                    hmsSessionId,
                                    hmsRoomId,
                                    pendingRoomId,
                                })

                                // Use the pendingRoomId (from live_rooms.id) which we know
                                const room_id =
                                    hostLiveRoomIdRef.current ||
                                    pendingRoomId ||
                                    (hmsRoomId ? (rooms.find((s) => s.room_id === hmsRoomId)?.id ?? null) : null)
                                if (!room_id) {
                                    console.error("❌ Error: Live Room ID is missing. pendingRoomId:", pendingRoomId)
                                    isPersistingRef.current = false
                                    return
                                }

                                // Fetch the current user to get their ID
                                const {
                                    data: { user },
                                } = await supabase.auth.getUser()
                                if (!user) {
                                    console.error("❌ Error: User not authenticated.")
                                    return
                                }

                                console.log("🚀 [DEBUG] Insert data for room_sessions:", {
                                    room_id,
                                    hmsSessionId,
                                    active: true,
                                    userId: user.id,
                                })

                                // Safely create or re-activate without requiring a DB unique index
                                let newRoomSession: { id: string } | null = null
                                let roomSessionError: any = null
                                try {
                                    const { data: existing } = await supabase
                                        .from("room_sessions")
                                        .select("session_id")
                                        .eq("session_id", hmsSessionId)
                                        .maybeSingle()
                                    console.log("Existing Data:", existing)
                                    if (!existing) {
                                        const { data, error } = await supabase
                                            .from("room_sessions")
                                            .insert({ room_id: room_id, session_id: hmsSessionId, active: true })
                                            .select("id")
                                            .single()
                                        newRoomSession = data as any
                                        roomSessionError = error
                                    } else {
                                        newRoomSession = null
                                    }
                                } catch (err) {
                                    roomSessionError = err
                                }

                                if (roomSessionError) {
                                    console.error("❌ Error creating room session:", roomSessionError)
                                    addToast({
                                        type: "error",
                                        title: "Database Error",
                                        message: "Failed to start room session in the database.",
                                    })
                                    return
                                }

                                // Update the local state with the new session data
                                const createdId = newRoomSession?.id
                                if (createdId) {
                                    setCurrentSessionData({ roomId: room_id, sessionId: createdId })
                                }
                                console.log("✅ Supabase insertion successful:", {
                                    roomSessionId: createdId,
                                    roomId: room_id,
                                    hmsSessionId: hmsSessionId,
                                })

                                // Also update the status of the parent `live_rooms` table to 'live'
                                const { error: updateError } = await supabase
                                    .from("live_rooms")
                                    .update({ status: "live" })
                                    .eq("id", room_id)

                                if (updateError) {
                                    console.error("❌ Error updating live_rooms status:", updateError)
                                } else {
                                    console.log("✅ live_rooms status updated to 'live' for room:", room_id)
                                }
                                hasPersistedRef.current = true
                            } catch (e: any) {
                                console.error("Failed to start session and update database:", e.message)
                                addToast({
                                    type: "error",
                                    title: "Error",
                                    message: "Failed to start session properly.",
                                })
                            } finally {
                                isPersistingRef.current = false
                                setJoiningSession(null) // Reset joining state after session starts
                            }
                        }}
                        onRoomEnd={async () => {
                            if (persistFallbackTimerRef.current) {
                                clearTimeout(persistFallbackTimerRef.current)
                                persistFallbackTimerRef.current = null
                            }
                            if (currentSessionData) {
                                try {
                                    // Update the room_sessions table to mark it as inactive
                                    await supabase
                                        .from("room_sessions")
                                        .update({ active: false })
                                        .eq("id", currentSessionData.sessionId)
                                        .eq("room_id", currentSessionData.roomId)

                                    // Also update the status of the parent `live_rooms` table to 'completed'
                                    await supabase.from("live_rooms").update({ status: "completed" }).eq("id", currentSessionData.roomId)

                                    console.log("Session ended and database updated.")
                                } catch (error: any) {
                                    console.error("Error ending session:", error)
                                    addToast({
                                        type: "error",
                                        title: "Error",
                                        message: "Failed to end session properly.",
                                    })
                                }
                            }
                            setVideoToken(null)
                            setVideoUserName("")
                            setCurrentSessionData(null)
                            // Reset flags so a new session can be persisted on next start
                            hasPersistedRef.current = false
                            isPersistingRef.current = false
                            hostLiveRoomIdRef.current = null
                            hostHmsRoomIdRef.current = null
                            setPendingRoomId(null)
                            setJoiningSession(null)
                            addToast({
                                type: "success",
                                title: "Session Ended",
                                message: "Live session has been ended successfully.",
                            })
                        }}
                    />
                </div>
            </div>
        );

        return createPortal(modalContent, document.body);
    }

    if (coursesLoading || loadingRooms) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading courses and rooms...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses & Live Rooms</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View your assigned courses and join live sessions</p>
                </div>

                {teacherCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Courses Assigned</h3>
                        <p className="text-gray-600 dark:text-gray-400">You don't have any courses assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {teacherCourses.map((course) => {
                            const courseRooms = rooms.filter((room) => room.course_id === course.id)
                            const courseEnrollments = enrollmentsByCourse[course.id] || []
                            const enrolledCount = courseEnrollments.length
                            return (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                    {/* Course Header */}
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{course.title}</h2>
                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                    {course.description || "No description available"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Video size={16} />
                                                    <span>{courseRooms.length} rooms</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={16} />
                                                    {/* enrollmentsLoading is no longer destructured, so it's not available here */}
                                                    <span>{enrolledCount} students</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Rooms */}
                                    <div className="p-6">
                                        {courseRooms.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600 dark:text-gray-400">No live rooms created for this course yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                    Live Rooms ({courseRooms.length})
                                                </h3>
                                                <div className="grid gap-4">
                                                    {courseRooms.map((room) => (
                                                        <div
                                                            key={room.id}
                                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)}`}></div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{room.room_name}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar size={14} />
                                                                            <span>{new Date(room.start_time).toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Users size={14} />
                                                                            <span>Max {room.max_participants} participants</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock size={14} />
                                                                            <span>{getStatusText(room.status)}</span>
                                                                        </div>
                                                                    </div>
                                                                    {room.description && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{room.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleCopyRoomId(room.room_id)}
                                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                                                    title="Copy Room ID"
                                                                >
                                                                    <Copy size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleJoinSession(room)}
                                                                    disabled={joiningSession === room.id}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                                                >
                                                                    {joiningSession === room.id ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                            Joining...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Play size={16} />
                                                                            Join Room
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherCourses
