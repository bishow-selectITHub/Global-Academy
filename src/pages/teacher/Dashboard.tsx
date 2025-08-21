"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Video, Users, Calendar, Play, UserCheck, Copy } from "lucide-react"
import type { RootState, AppDispatch } from "../../store"
import { fetchCourses } from "../../store/coursesSlice"
import { fetchLiveSessions } from "../../store/liveSessionsSlice"
import { useUser } from "../../contexts/UserContext"
import { useToast } from "../../components/ui/Toaster"
import { supabase } from "../../lib/supabase"

const TeacherDashboard = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useUser()
    const { addToast } = useToast()

    const { data: courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)
    const { data: liveSessions, loading: sessionsLoading } = useSelector((state: RootState) => state.liveSessions)

    const [activeView, setActiveView] = useState<"overview" | "join-meeting" | "attendance">("overview")
    const [joiningSession, setJoiningSession] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchCourses())
        dispatch(fetchLiveSessions())
    }, [dispatch])

    const teacherCourses = courses.filter(
        (course) => course.instructorEmail === user?.email || course.instructor === user?.name,
    )

    const teacherSessions = liveSessions.filter((session) =>
        teacherCourses.some((course) => course.id === session.course_id),
    )

    const liveSessions_filtered = teacherSessions.filter((session) => session.status === "live")
    const scheduledSessions = teacherSessions.filter((session) => session.status === "scheduled")

    const handleJoinSession = async (session: any) => {
        setJoiningSession(session.id)
        try {
            const {
                data: { session: authSession },
            } = await supabase.auth.getSession()
            if (!authSession?.access_token) {
                throw new Error("You must be logged in to join.")
            }

            // Generate token for joining the session
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-hms-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authSession.access_token}`,
                },
                body: JSON.stringify({
                    room_id: session.room_id,
                    role: "host",
                    wait_for_active_session: false,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to generate token")
            }

            const tokenData = await response.json()

            // Navigate to live session with token
            window.open(`/live-session?token=${tokenData.token}&room=${session.room_id}&role=host`, "_blank")

            addToast({
                type: "success",
                title: "Joining Session",
                message: "Opening live session in new tab...",
            })
        } catch (error: any) {
            console.error("Error joining session:", error)
            addToast({
                type: "error",
                title: "Error",
                message: error.message || "Failed to join session.",
            })
        } finally {
            setJoiningSession(null)
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teacher Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your courses and live sessions</p>
                </div>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveView("overview")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === "overview"
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveView("join-meeting")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeView === "join-meeting"
                                ? "bg-green-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        <Video size={16} />
                        Join Meeting
                    </button>
                    <button
                        onClick={() => setActiveView("attendance")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeView === "attendance"
                                ? "bg-purple-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        <UserCheck size={16} />
                        Student Attendance
                    </button>
                </div>

                {activeView === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Courses</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teacherCourses.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Sessions</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{liveSessions_filtered.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                    <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{scheduledSessions.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "join-meeting" && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Join Live Sessions</h2>

                        {coursesLoading || sessionsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading sessions...</p>
                            </div>
                        ) : teacherCourses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400">No courses assigned to you.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {teacherCourses.map((course) => {
                                    const courseSessions = teacherSessions.filter((session) => session.course_id === course.id)

                                    return (
                                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{course.title}</h3>

                                            {courseSessions.length === 0 ? (
                                                <p className="text-gray-600 dark:text-gray-400">No sessions available for this course.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {courseSessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className={`w-3 h-3 rounded-full ${session.status === "live"
                                                                            ? "bg-red-500"
                                                                            : session.status === "scheduled"
                                                                                ? "bg-yellow-500"
                                                                                : "bg-gray-400"
                                                                        }`}
                                                                ></div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {session.room_name || session.title}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {new Date(session.start_time).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleCopyRoomId(session.room_id)}
                                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                                                    title="Copy Room ID"
                                                                >
                                                                    <Copy size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleJoinSession(session)}
                                                                    disabled={joiningSession === session.id}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                >
                                                                    {joiningSession === session.id ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                            Joining...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Play size={16} />
                                                                            Join
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeView === "attendance" && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Attendance</h2>

                        {coursesLoading || sessionsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading attendance data...</p>
                            </div>
                        ) : teacherCourses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400">No courses assigned to you.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {teacherCourses.map((course) => {
                                    const courseSessions = teacherSessions.filter((session) => session.course_id === course.id)

                                    return (
                                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{course.title}</h3>

                                            {courseSessions.length === 0 ? (
                                                <p className="text-gray-600 dark:text-gray-400">No sessions available for this course.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {courseSessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {session.room_name || session.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {new Date(session.start_time).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {session.attendees_count || 0} attendees
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Status: {session.status}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        // Navigate to detailed attendance view
                                                                        window.location.href = `/teacher/attendance/${session.id}`
                                                                    }}
                                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                >
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherDashboard
