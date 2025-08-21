"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Calendar, Users, Clock, UserCheck, ChevronDown, ChevronRight, Home, BookOpen, BarChart3, Play, Image } from "lucide-react"
import type { RootState, AppDispatch } from "../../store"
import { fetchCourses } from "../../store/coursesSlice"
import { useUser } from "../../contexts/UserContext"
import { supabase } from "../../lib/supabase"

interface AttendanceRecord {
    id: string
    user_id: string
    session_id: string
    room_id: string
    joined_at: string
    user?: {
        name: string
        email: string
    }
}

interface Room {
    room_id: string
    course_id: string
    room_name: string
}

interface RoomSession {
    id: string
    room_id: string
    session_id: string
    created_at: string
}

interface EnrolledUser {
    user_id: string
    user?: {
        name: string
        email: string
    }
}

const TeacherAttendance = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useUser()

    const { data: courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)

    const [roomsData, setRoomsData] = useState<Record<string, Room[]>>({})
    const [sessionsData, setSessionsData] = useState<Record<string, RoomSession[]>>({})
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord[]>>({})
    const [enrolledUsersData, setEnrolledUsersData] = useState<Record<string, EnrolledUser[]>>({})
    const [loadingRooms, setLoadingRooms] = useState<Record<string, boolean>>({})
    const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({})
    const [loadingAttendance, setLoadingAttendance] = useState<Record<string, boolean>>({})
    const [loadingEnrolledUsers, setLoadingEnrolledUsers] = useState<Record<string, boolean>>({})
    const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
    const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({})
    const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})

    useEffect(() => {
        dispatch(fetchCourses())
    }, [dispatch])

    // Filter courses that match teacher's email
    const teacherCourses = courses.filter((course) => course.teacherEmail === user?.email)

    console.log("Teacher courses:", teacherCourses.map(c => ({ id: c.id, title: c.title, idType: typeof c.id, idLength: c.id.length })))

    const fetchCourseRooms = async (courseId: string) => {
        if (roomsData[courseId] || loadingRooms[courseId]) return

        console.log("Fetching rooms for course:", courseId)
        setLoadingRooms((prev) => ({ ...prev, [courseId]: true }))

        try {
            const { data: rooms, error } = await supabase
                .from("live_rooms")
                .select("id, course_id, room_name")
                .eq("course_id", courseId)
                .order("room_name", { ascending: true })

            if (error) {
                console.error("Error fetching rooms:", error)
                return
            }

            console.log("Raw rooms data:", rooms)

            // Transform the data to match the expected interface
            const transformedRooms = (rooms || []).map(room => ({
                room_id: room.id, // Map 'id' to 'room_id' for compatibility
                course_id: room.course_id,
                room_name: room.room_name
            }))

            console.log("Transformed rooms:", transformedRooms)
            setRoomsData((prev) => ({ ...prev, [courseId]: transformedRooms }))
        } catch (error) {
            console.error("Error fetching course rooms:", error)
        } finally {
            setLoadingRooms((prev) => ({ ...prev, [courseId]: false }))
        }
    }

    const fetchRoomSessions = async (roomId: string) => {
        if (sessionsData[roomId] || loadingSessions[roomId]) return

        console.log("Fetching sessions for room:", roomId)
        setLoadingSessions((prev) => ({ ...prev, [roomId]: true }))

        try {
            // roomId parameter should be the id from live_rooms table
            // room_id in room_sessions references live_rooms.id
            const { data: sessions, error } = await supabase
                .from("room_sessions")
                .select("id, room_id, session_id, created_at")
                .eq("room_id", roomId)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching room sessions:", error)
                return
            }

            console.log("Sessions data for room", roomId, ":", sessions)
            setSessionsData((prev) => ({ ...prev, [roomId]: sessions || [] }))
        } catch (error) {
            console.error("Error fetching room sessions:", error)
        } finally {
            setLoadingSessions((prev) => ({ ...prev, [roomId]: false }))
        }
    }

    const fetchSessionAttendance = async (sessionId: string) => {
        if (attendanceData[sessionId] || loadingAttendance[sessionId]) return

        setLoadingAttendance((prev) => ({ ...prev, [sessionId]: true }))

        try {
            const { data: attendance, error } = await supabase
                .from("students_attendance")
                .select(`
          id,
          user_id,
          session_id,
          room_id,
          joined_at,
          users:user_id (
            name,
            email
          )
        `)
                .eq("session_id", sessionId)
                .order("joined_at", { ascending: false })

            if (error) {
                console.error("Error fetching attendance:", error)
                return
            }

            const enrichedAttendance = (attendance || []).map((record) => ({
                ...record,
                user: record.users as any,
            }))

            setAttendanceData((prev) => ({ ...prev, [sessionId]: enrichedAttendance }))
        } catch (error) {
            console.error("Error fetching session attendance:", error)
        } finally {
            setLoadingAttendance((prev) => ({ ...prev, [sessionId]: false }))
        }
    }

    const fetchEnrolledUsers = async (courseId: string) => {
        if (enrolledUsersData[courseId] || loadingEnrolledUsers[courseId]) return

        setLoadingEnrolledUsers((prev) => ({ ...prev, [courseId]: true }))
        console.log(courseId)
        try {
            const { data: enrollments, error } = await supabase
                .from("course_enrollments")
                .select(`
                    user_id,
                    users:user_id (
                        name,
                        email
                    )
                `)
                .eq("course_id", courseId)
            console.log(enrollments)
            if (error) {
                console.error("Error fetching enrolled users:", error)
                return
            }

            const enrichedEnrollments = (enrollments || []).map((enrollment) => ({
                user_id: enrollment.user_id,
                user: enrollment.users as any,
            }))

            setEnrolledUsersData((prev) => ({ ...prev, [courseId]: enrichedEnrollments }))
        } catch (error) {
            console.error("Error fetching enrolled users:", error)
        } finally {
            setLoadingEnrolledUsers((prev) => ({ ...prev, [courseId]: false }))
        }
    }

    const toggleCourseExpansion = (courseId: string) => {
        setExpandedCourses((prev) => ({
            ...prev,
            [courseId]: !prev[courseId],
        }))

        if (!expandedCourses[courseId]) {
            fetchCourseRooms(courseId)
            fetchEnrolledUsers(courseId)
        }
    }

    const toggleRoomExpansion = (roomId: string) => {
        setExpandedRooms((prev) => ({
            ...prev,
            [roomId]: !prev[roomId],
        }))

        if (!expandedRooms[roomId]) {
            fetchRoomSessions(roomId)
        }
    }

    const toggleSessionExpansion = (sessionId: string) => {
        setExpandedSessions((prev) => ({
            ...prev,
            [sessionId]: !prev[sessionId],
        }))

        if (!expandedSessions[sessionId]) {
            fetchSessionAttendance(sessionId)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    if (coursesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">Loading attendance data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                        <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Student Attendance Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Track student attendance across your courses, rooms, and sessions
                    </p>
                </div>

                {teacherCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Courses Assigned</h3>
                        <p className="text-gray-600 dark:text-gray-400">You don't have any courses assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {teacherCourses.map((course) => {
                            const isExpanded = expandedCourses[course.id]
                            const courseRooms = roomsData[course.id] || []
                            const isLoadingRooms = loadingRooms[course.id]

                            return (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div
                                        className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                                        onClick={() => toggleCourseExpansion(course.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Course Thumbnail */}
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Image className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{course.title}</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                            {course.description || "No description available"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Active
                                                        </span>
                                                        {isExpanded ? (
                                                            <ChevronDown size={20} className="text-blue-500 dark:text-blue-400" />
                                                        ) : (
                                                            <ChevronRight size={20} className="text-blue-500 dark:text-blue-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Course Stats */}
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                        <Clock size={14} />
                                                        <span className="font-medium">{course.duration || "Duration not set"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                                        <BarChart3 size={14} />
                                                        <span className="font-medium">{course.level || "Level not set"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <Home size={14} />
                                                        <span className="font-medium">{courseRooms.length} rooms</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                        <Users size={14} />
                                                        <span className="font-medium">
                                                            {(enrolledUsersData[course.id] || []).length} students
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                                            {isLoadingRooms ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading rooms...</span>
                                                </div>
                                            ) : courseRooms.length === 0 ? (
                                                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                                                        <Home className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">No Rooms Found</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">No rooms have been created for this course yet.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Enrolled Users Section */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                                Enrolled Students ({(enrolledUsersData[course.id] || []).length})
                                                            </h3>
                                                        </div>
                                                        {loadingEnrolledUsers[course.id] ? (
                                                            <div className="flex items-center justify-center py-6">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                                <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading students...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                                {(enrolledUsersData[course.id] || []).map((enrollment) => (
                                                                    <div key={enrollment.user_id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                                {enrollment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                                                                    {enrollment.user?.name || "Unknown User"}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                                    {enrollment.user?.email || enrollment.user_id}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(enrolledUsersData[course.id] || []).length === 0 && (
                                                                    <div className="col-span-full text-center py-6">
                                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No students enrolled yet.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Rooms Section */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                                <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                                Live Rooms ({courseRooms.length})
                                                            </h3>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {courseRooms.map((room) => {
                                                                const isRoomExpanded = expandedRooms[room.room_id]
                                                                const roomSessions = sessionsData[room.room_id] || []
                                                                const isLoadingSessions = loadingSessions[room.room_id]

                                                                return (
                                                                    <div
                                                                        key={room.room_id}
                                                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                                    >
                                                                        <div
                                                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 cursor-pointer hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200"
                                                                            onClick={() => toggleRoomExpansion(room.room_id)}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                                                                    <Play className="h-5 w-5 text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                                                        {room.room_name}
                                                                                    </h4>
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                        Room ID: {room.room_id}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                                                                    {roomSessions.length} sessions
                                                                                </span>
                                                                                {isRoomExpanded ? (
                                                                                    <ChevronDown size={18} className="text-green-600 dark:text-green-400" />
                                                                                ) : (
                                                                                    <ChevronRight size={18} className="text-green-600 dark:text-green-400" />
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {isRoomExpanded && (
                                                                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50">
                                                                                {isLoadingSessions ? (
                                                                                    <div className="flex items-center justify-center py-6">
                                                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                                                                        <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
                                                                                            Loading sessions...
                                                                                        </span>
                                                                                    </div>
                                                                                ) : roomSessions.length === 0 ? (
                                                                                    <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg">
                                                                                        <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                            No sessions found for this room.
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="space-y-3">
                                                                                        <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                                                            Sessions ({roomSessions.length})
                                                                                        </h5>
                                                                                        {roomSessions.map((session) => {
                                                                                            const isSessionExpanded = expandedSessions[session.session_id]
                                                                                            const sessionAttendance = attendanceData[session.session_id] || []
                                                                                            const isLoadingAttendance = loadingAttendance[session.session_id]

                                                                                            return (
                                                                                                <div
                                                                                                    key={session.id}
                                                                                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm"
                                                                                                >
                                                                                                    <div
                                                                                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 cursor-pointer hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200"
                                                                                                        onClick={() => toggleSessionExpansion(session.session_id)}
                                                                                                    >
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                                                                                <Calendar className="h-4 w-4 text-white" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                                                                                    Session {session.session_id}
                                                                                                                </h6>
                                                                                                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                        <Clock size={12} />
                                                                                                                        <span>{formatDate(session.created_at)}</span>
                                                                                                                    </div>
                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                        <Users size={12} />
                                                                                                                        <span>{sessionAttendance.length} attendees</span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <button
                                                                                                                onClick={(e) => {
                                                                                                                    e.stopPropagation()
                                                                                                                    toggleSessionExpansion(session.session_id)
                                                                                                                }}
                                                                                                                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
                                                                                                            >
                                                                                                                {isSessionExpanded ? 'Hide' : 'Show'} Attendance
                                                                                                            </button>
                                                                                                            {isSessionExpanded ? (
                                                                                                                <ChevronDown size={14} className="text-purple-600 dark:text-purple-400" />
                                                                                                            ) : (
                                                                                                                <ChevronRight size={14} className="text-purple-600 dark:text-purple-400" />
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {isSessionExpanded && (
                                                                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50">
                                                                                                            {/* Attendance Summary */}
                                                                                                            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                                                                <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center text-sm">Attendance Summary</h6>
                                                                                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                                                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                                                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                                                                            {sessionAttendance.length}
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                                                                            Attended
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                                                                                        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                                                                                                            {(enrolledUsersData[course.id] || []).length}
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                                                                                            Enrolled
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                                                                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                                                                            {enrolledUsersData[course.id] && sessionAttendance.length > 0
                                                                                                                                ? Math.round((sessionAttendance.length / enrolledUsersData[course.id].length) * 100)
                                                                                                                                : 0}%
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                                                                                            Attendance Rate
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            {isLoadingAttendance ? (
                                                                                                                <div className="flex items-center justify-center py-4">
                                                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                                                                                                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-xs">
                                                                                                                        Loading attendance...
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            ) : sessionAttendance.length === 0 ? (
                                                                                                                <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg">
                                                                                                                    <UserCheck className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                                                                                                                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                                                                                        No students joined this session yet.
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="space-y-2">
                                                                                                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-xs mb-2">
                                                                                                                        Students who joined ({sessionAttendance.length})
                                                                                                                    </h6>
                                                                                                                    <div className="grid gap-2">
                                                                                                                        {sessionAttendance.map((record) => (
                                                                                                                            <div
                                                                                                                                key={record.id}
                                                                                                                                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800"
                                                                                                                            >
                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                                                                                                                        <UserCheck
                                                                                                                                            size={12}
                                                                                                                                            className="text-green-600 dark:text-green-400"
                                                                                                                                        />
                                                                                                                                    </div>
                                                                                                                                    <div>
                                                                                                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                                                                                                                            {record.user?.name || "Unknown User"}
                                                                                                                                        </p>
                                                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                                            {record.user?.email || record.user_id}
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div className="text-right">
                                                                                                                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                                                                                                        Joined at
                                                                                                                                    </p>
                                                                                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                                        {formatDate(record.joined_at)}
                                                                                                                                    </p>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        ))}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}

                                                                                                            {/* Show users who didn't attend */}
                                                                                                            {enrolledUsersData[course.id] && enrolledUsersData[course.id].length > 0 && (
                                                                                                                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                                                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-xs mb-2">
                                                                                                                        Students who didn't attend ({(enrolledUsersData[course.id].length - sessionAttendance.length)})
                                                                                                                    </h6>
                                                                                                                    <div className="grid gap-2">
                                                                                                                        {enrolledUsersData[course.id]
                                                                                                                            .filter(enrollment =>
                                                                                                                                !sessionAttendance.some(attendance =>
                                                                                                                                    attendance.user_id === enrollment.user_id
                                                                                                                                )
                                                                                                                            )
                                                                                                                            .map((enrollment) => (
                                                                                                                                <div
                                                                                                                                    key={enrollment.user_id}
                                                                                                                                    className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                                                                                                                >
                                                                                                                                    <div className="flex items-center gap-2">
                                                                                                                                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                                                                                                                            <UserCheck
                                                                                                                                                size={12}
                                                                                                                                                className="text-red-600 dark:text-red-400"
                                                                                                                                            />
                                                                                                                                        </div>
                                                                                                                                        <div>
                                                                                                                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                                                                                                                                {enrollment.user?.name || "Unknown User"}
                                                                                                                                            </p>
                                                                                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                                                {enrollment.user?.email || enrollment.user_id}
                                                                                                                                            </p>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                    <div className="text-right">
                                                                                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                                                                                                                                            Absent
                                                                                                                                        </span>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            ))}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}
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
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherAttendance
