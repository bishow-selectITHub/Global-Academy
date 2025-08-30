"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { supabase } from "../../../lib/supabase"
import { useUser } from "../../../contexts/UserContext"
import { useToast } from "../../../components/ui/Toaster"
import { Video, Clock, BookOpen, Play, Calendar } from "lucide-react"
import Button from "../../../components/ui/Button"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost"

interface LiveRoom {
    id: string
    room_id: string
    room_name: string
    active: boolean
    created_at: string
    course_id?: string
    course?: {
        title: string
    }
}

interface GroupedRooms {
    [courseId: string]: {
        courseTitle: string
        rooms: LiveRoom[]
    }
}

// API Constants
const CREATE_ROOM_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || "https://smqnaddacvwwuehxymbr.supabase.co"}/functions/v1/create-hms-room`
const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || "https://smqnaddacvwwuehxymbr.supabase.co"}/functions/v1/generate-hms-token`

const AdminMeetings = () => {
    const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [joiningSession, setJoiningSession] = useState<string | null>(null)
    const [videoToken, setVideoToken] = useState<string | null>(null)
    const [videoUserName, setVideoUserName] = useState<string>("")
    const [currentSessionData, setCurrentSessionData] = useState<{ roomId: string; sessionId: string } | null>(null)
    const { user } = useUser()
    const { addToast } = useToast()

    useEffect(() => {
        fetchLiveRooms()
    }, [])

    const fetchLiveRooms = async () => {
        try {
            setLoading(true)

            // Fetch all live rooms with course information
            const { data, error } = await supabase
                .from("live_rooms")
                .select(`
          *,
          course:course_id (
            title
          )
        `)
                .order("created_at", { ascending: false })

            if (error) {
                throw error
            }

            setLiveRooms(data || [])
        } catch (error: any) {
            console.error("Error fetching live rooms:", error)
            addToast({
                type: "error",
                title: "Error",
                message: "Failed to fetch live rooms",
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleJoinSession = async (session: LiveRoom) => {
        if (!user) {
            addToast({
                type: "error",
                title: "Error",
                message: "You must be logged in to join a session",
                duration: 5000,
            })
            return
        }

        setJoiningSession(session.id)
        try {
            console.log("🚀 [DEBUG] handleJoinSession called with session:", {
                sessionId: session.id,
                sessionRoomId: session.room_id,
                sessionData: session,
            })

            const {
                data: { session: authSession },
            } = await supabase.auth.getSession()
            if (!authSession?.access_token) {
                throw new Error("You must be logged in to start a session.")
            }

            console.log("🚀 [DEBUG] User authenticated, starting session creation")

            // Create a new HMS room
            const createRoomRes = await fetch(CREATE_ROOM_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authSession.access_token}`,
                },
                body: JSON.stringify({
                    room_id: session.room_id,
                    room_name: session.room_name,
                    user_id: authSession.user.id,
                }),
            })

            if (!createRoomRes.ok) {
                const errorData = await createRoomRes.json()
                throw new Error(errorData.error || "Failed to create HMS room")
            }

            const createRoomData = await createRoomRes.json()
            console.log("🚀 [DEBUG] HMS room created:", createRoomData)

            // Generate token for the admin
            const tokenRes = await fetch(GENERATE_TOKEN_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authSession.access_token}`,
                },
                body: JSON.stringify({
                    user_id: authSession.user.id,
                    room_id: session.room_id,
                    role: "host",
                }),
            })

            if (!tokenRes.ok) {
                const errorData = await tokenRes.json()
                throw new Error(errorData.error || "Failed to generate host token")
            }

            const tokenData = await tokenRes.json()
            console.log("🚀 [DEBUG] Admin token generated:", {
                hasToken: !!tokenData.token,
                tokenLength: tokenData.token?.length,
            })

            // Set the video session data
            setVideoToken(tokenData.token)
            setVideoUserName(user.name || user.email || "Admin")
            setCurrentSessionData({
                roomId: session.room_id,
                sessionId: session.id,
            })

            console.log("🚀 [DEBUG] Video session started successfully")
        } catch (error: any) {
            console.error("Failed to start session:", error)
            addToast({
                type: "error",
                title: "Error",
                message: error.message || "Failed to start session",
                duration: 5000,
            })
        } finally {
            setJoiningSession(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const created = new Date(dateString)
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return "Just now"
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    const groupRoomsByCourse = (): GroupedRooms => {
        const grouped: GroupedRooms = {}

        liveRooms.forEach((room) => {
            const courseId = room.course_id || "uncategorized"
            const courseTitle = room.course?.title || "Uncategorized Course"

            if (!grouped[courseId]) {
                grouped[courseId] = {
                    courseTitle,
                    rooms: [],
                }
            }

            grouped[courseId].rooms.push(room)
        })

        return grouped
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="animate-pulse">
                        <div className="h-9 bg-gray-200/50 rounded-lg w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
                                >
                                    <div className="h-7 bg-gray-200/50 rounded-lg w-1/4 mb-4"></div>
                                    <div className="space-y-2">
                                        {[1, 2].map((j) => (
                                            <div key={j} className="h-20 bg-gray-200/50 rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const groupedRooms = groupRoomsByCourse()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Live Meetings
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 ml-10">
                        Monitor and join live sessions across all courses
                    </p>
                </div>

                {Object.keys(groupedRooms).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-8 max-w-sm mx-auto shadow-xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Video className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No live meetings</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                There are currently no live sessions across any courses.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedRooms).map(([courseId, courseData]) => (
                            <div
                                key={courseId}
                                className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mr-4 shadow-lg">
                                                <BookOpen className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                    {courseData.courseTitle}
                                                </h2>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {courseData.rooms.length} room{courseData.rooms.length !== 1 ? "s" : ""} •{" "}
                                                    {courseData.rooms.filter((r) => r.active).length} active
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                                                <div className="text-xl font-bold">{courseData.rooms.filter((r) => r.active).length}</div>
                                                <div className="text-xs opacity-90">Active</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {courseData.rooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className="bg-slate-50/80 backdrop-blur-sm dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center flex-1">
                                                        <div
                                                            className={`p-2.5 rounded-xl mr-4 shadow-lg ${room.active
                                                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                                                    : "bg-gradient-to-br from-orange-500 to-orange-600"
                                                                }`}
                                                        >
                                                            <Video className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                                                {room.room_name}
                                                            </h3>
                                                            <div className="flex items-center space-x-6">
                                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                    <span>{getTimeAgo(room.created_at)}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                                    <Clock className="h-4 w-4 mr-2" />
                                                                    <span>{formatDate(room.created_at)}</span>
                                                                </div>
                                                                <span
                                                                    className={`text-sm px-3 py-1.5 rounded-lg font-semibold shadow-md ${room.active
                                                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                                                            : "bg-white text-slate-600 border border-slate-200"
                                                                        }`}
                                                                >
                                                                    {room.active ? "LIVE" : "ENDED"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleJoinSession(room)}
                                                        disabled={joiningSession === room.id}
                                                        className={`text-sm font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ml-6 ${room.active
                                                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                            }`}
                                                    >
                                                        {joiningSession === room.id ? (
                                                            <div className="flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Starting...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center">
                                                                <Play className="h-4 w-4 mr-2" />
                                                                {room.active ? "Join" : "Start"}
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Video Call Modal */}
                {videoToken &&
                    createPortal(
                        <div
                            className="fixed inset-0 bg-black/95 backdrop-blur-sm"
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: "100vw",
                                height: "100vh",
                                zIndex: 999999,
                            }}
                        >
                            {/* Meeting popup container - full screen */}
                            <div className="w-full h-full bg-black relative">
                                <button
                                    onClick={() => {
                                        setVideoToken(null)
                                        setVideoUserName("")
                                        setCurrentSessionData(null)
                                        setJoiningSession(null)
                                    }}
                                    className="absolute top-6 right-6 z-10 w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-2xl backdrop-blur-sm border border-gray-700"
                                    title="Close meeting"
                                >
                                    <svg
                                        className="w-5 h-5"
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
                                    onRoomEnd={() => {
                                        setVideoToken(null)
                                        setVideoUserName("")
                                        setCurrentSessionData(null)
                                        setJoiningSession(null)
                                    }}
                                    onSessionStarted={(sessionId) => {
                                        console.log("🚀 [DEBUG] Session started with ID:", sessionId)
                                        setCurrentSessionData((prev) => (prev ? { ...prev, sessionId } : null))
                                    }}
                                />
                            </div>
                        </div>,
                        document.body,
                    )}
            </div>
        </div>
    )
}

export default AdminMeetings
