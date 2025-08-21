"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Video, Users, Calendar, Play, UserCheck, Copy, Clock, BarChart3, Target } from "lucide-react"
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
        (course) => course.teacherEmail === user?.email
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Teacher Dashboard</h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your courses and live sessions</p>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={() => setActiveView("overview")}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${activeView === "overview"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveView("join-meeting")}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center gap-2 ${activeView === "join-meeting"
                            ? "bg-green-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        <Video size={16} />
                        <span className="hidden sm:inline">Join Meeting</span>
                        <span className="sm:hidden">Join</span>
                    </button>
                    <button
                        onClick={() => setActiveView("attendance")}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center gap-2 ${activeView === "attendance"
                            ? "bg-purple-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        <UserCheck size={16} />
                        <span className="hidden sm:inline">Student Attendance</span>
                        <span className="sm:hidden">Attendance</span>
                    </button>
                </div>

                {activeView === "overview" && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">My Courses</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{teacherCourses.length}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active courses</p>
                                    </div>
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105">
                                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Live Sessions</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{liveSessions_filtered.length}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently active</p>
                                    </div>
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105">
                                        <Video className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{scheduledSessions.length}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upcoming sessions</p>
                                    </div>
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105">
                                        <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{teacherSessions.length}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                                    </div>
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105">
                                        <Play className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Courses */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600 dark:text-blue-400" />
                                    Recent Courses
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your most recent course assignments</p>
                            </div>
                            <div className="p-4 sm:p-6">
                                {teacherCourses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                            <Users size={24} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No courses assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {teacherCourses.slice(0, 6).map((course) => (
                                            <div key={course.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
                                                {/* Course Thumbnail */}
                                                <div className="h-32 sm:h-36 bg-gradient-to-br from-blue-400 to-purple-500">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            onError={(e) => {
                                                                // Fallback to placeholder if image fails to load
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center ${course.thumbnail ? 'hidden' : ''}`}>
                                                        <div className="text-white text-center">
                                                            <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                                                                <Video size={24} />
                                                            </div>
                                                            <p className="text-sm font-medium">{course.title}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Course Info */}
                                                <div className="p-3 sm:p-4">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {course.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            <span>{course.duration}</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.level === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                            {course.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Target size={20} className="text-purple-600 dark:text-purple-400" />
                                    Quick Actions
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Common tasks and shortcuts</p>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setActiveView("join-meeting")}
                                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
                                    >
                                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-105 transition-all duration-200">
                                            <Video size={20} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Join Meeting</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Access live sessions</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveView("attendance")}
                                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
                                    >
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-105 transition-all duration-200">
                                            <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">View Attendance</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Check student records</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => window.location.href = '/teacher/courses'}
                                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
                                    >
                                        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 group-hover:scale-105 transition-all duration-200">
                                            <Users size={20} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Manage Courses</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">View all courses</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "join-meeting" && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Join Live Sessions</h2>

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
                            <div className="space-y-6 sm:space-y-8">
                                {teacherCourses.map((course) => {
                                    const courseSessions = teacherSessions.filter((session) => session.course_id === course.id)

                                    return (
                                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
                                            {/* Course Header with Thumbnail */}
                                            <div className="relative">
                                                <div className="h-48 sm:h-56 bg-gradient-to-r from-blue-500 to-purple-600">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // Fallback to placeholder if image fails to load
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center ${course.thumbnail ? 'hidden' : ''}`}>
                                                        <div className="text-white text-center">
                                                            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                                                <Video size={32} />
                                                            </div>
                                                            <p className="text-lg font-medium">{course.title}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/20"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                                                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{course.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <Clock size={14} />
                                                            <span>{course.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                            <span className="capitalize">{course.level}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <Users size={14} />
                                                            <span>{courseSessions.length} sessions</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course Description */}
                                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                                                    {course.description || "No description available for this course."}
                                                </p>
                                            </div>

                                            {/* Sessions List */}
                                            <div className="p-4 sm:p-6">
                                                {courseSessions.length === 0 ? (
                                                    <div className="text-center py-6">
                                                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                            <Calendar size={24} className="text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No sessions available for this course.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Available Sessions</h4>
                                                        {courseSessions.map((session) => (
                                                            <div
                                                                key={session.id}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 gap-3 sm:gap-4 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                                                            >
                                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <div
                                                                            className={`w-3 h-3 rounded-full flex-shrink-0 ${session.status === "live"
                                                                                ? "bg-red-500 animate-pulse"
                                                                                : session.status === "scheduled"
                                                                                    ? "bg-yellow-500"
                                                                                    : "bg-gray-400"
                                                                                }`}
                                                                        ></div>
                                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.status === "live" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                                                                            session.status === "scheduled" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                                                                "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                                            }`}>
                                                                            {session.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                                                            {session.title}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                            <Clock size={12} />
                                                                            <span>{new Date(session.start_time).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                    <button
                                                                        onClick={() => handleCopyRoomId(session.room_id || '')}
                                                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                                        title="Copy Room ID"
                                                                    >
                                                                        <Copy size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleJoinSession(session)}
                                                                        disabled={joiningSession === session.id}
                                                                        className="px-4 sm:px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                                                                    >
                                                                        {joiningSession === session.id ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                <span className="hidden sm:inline">Joining...</span>
                                                                                <span className="sm:hidden">...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Play size={16} />
                                                                                <span className="hidden sm:inline">Join Session</span>
                                                                                <span className="sm:hidden">Join</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeView === "attendance" && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Student Attendance</h2>

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
                            <div className="space-y-6 sm:space-y-8">
                                {teacherCourses.map((course) => {
                                    const courseSessions = teacherSessions.filter((session) => session.course_id === course.id)

                                    return (
                                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
                                            {/* Course Header with Thumbnail */}
                                            <div className="relative">
                                                <div className="h-48 sm:h-56 bg-gradient-to-r from-purple-500 to-pink-600">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // Fallback to placeholder if image fails to load
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center ${course.thumbnail ? 'hidden' : ''}`}>
                                                        <div className="text-white text-center">
                                                            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                                                <UserCheck size={32} />
                                                            </div>
                                                            <p className="text-lg font-medium">{course.title}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/20"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                                                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{course.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <Clock size={14} />
                                                            <span>{course.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                            <span className="capitalize">{course.level}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <Users size={14} />
                                                            <span>{courseSessions.length} sessions</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course Description */}
                                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                                                    {course.description || "No description available for this course."}
                                                </p>
                                            </div>

                                            {/* Sessions List */}
                                            <div className="p-4 sm:p-6">
                                                {courseSessions.length === 0 ? (
                                                    <div className="text-center py-6">
                                                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                            <Calendar size={24} className="text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No sessions available for this course.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Session Attendance</h4>
                                                        {courseSessions.map((session) => (
                                                            <div
                                                                key={session.id}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 gap-3 sm:gap-4 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <div
                                                                                className={`w-2 h-2 rounded-full ${session.status === "live"
                                                                                    ? "bg-red-500 animate-pulse"
                                                                                    : session.status === "scheduled"
                                                                                        ? "bg-yellow-500"
                                                                                        : "bg-gray-400"
                                                                                    }`}
                                                                            ></div>
                                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.status === "live" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                                                                                session.status === "scheduled" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                                                                    "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                                                }`}>
                                                                                {session.status}
                                                                            </span>
                                                                        </div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                                                            {session.title}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                                        <Clock size={12} />
                                                                        <span>{new Date(session.start_time).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                                                    <div className="text-right sm:text-left">
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <Users size={14} />
                                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                                {session.attendees_count || 0} attendees
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                            Status: {session.status}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            // Navigate to detailed attendance view
                                                                            window.location.href = `/teacher/attendance/${session.id}`
                                                                        }}
                                                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm w-full sm:w-auto"
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
