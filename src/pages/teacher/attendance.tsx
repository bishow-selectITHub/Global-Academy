"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Calendar, Users, Clock, UserCheck, ChevronDown, ChevronRight, Home } from "lucide-react"
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading attendance data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Attendance</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track student attendance across your courses, rooms, and sessions
                    </p>
                </div>

                {teacherCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Courses Assigned</h3>
                        <p className="text-gray-600 dark:text-gray-400">You don't have any courses assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {teacherCourses.map((course) => {
                            const isExpanded = expandedCourses[course.id]
                            const courseRooms = roomsData[course.id] || []
                            const isLoadingRooms = loadingRooms[course.id]

                            return (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                    <div
                                        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => toggleCourseExpansion(course.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{course.title}</h2>
                                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                        {course.description || "No description available"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Home size={16} />
                                                        <span>{courseRooms.length} rooms</span>
                                                    </div>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown size={20} className="text-gray-500" />
                                                ) : (
                                                    <ChevronRight size={20} className="text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-6">
                                            {isLoadingRooms ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading rooms...</span>
                                                </div>
                                            ) : courseRooms.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-600 dark:text-gray-400">No rooms found for this course.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Enrolled Users Section */}
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            Enrolled Students
                                                        </h3>
                                                        {loadingEnrolledUsers[course.id] ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                                <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading students...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {(enrolledUsersData[course.id] || []).map((enrollment) => (
                                                                    <div key={enrollment.user_id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                                                    {enrollment.user?.name || "Unknown User"}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    {enrollment.user?.email || enrollment.user_id}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(enrolledUsersData[course.id] || []).length === 0 && (
                                                                    <div className="col-span-full text-center py-4">
                                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">No students enrolled yet.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Rooms Section */}
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                            Rooms ({courseRooms.length})
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {courseRooms.map((room) => {
                                                                const isRoomExpanded = expandedRooms[room.room_id]
                                                                const roomSessions = sessionsData[room.room_id] || []
                                                                const isLoadingSessions = loadingSessions[room.room_id]

                                                                return (
                                                                    <div
                                                                        key={room.room_id}
                                                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                                                    >
                                                                        <div
                                                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                                            onClick={() => toggleRoomExpansion(room.room_id)}
                                                                        >
                                                                            <div className="flex items-center gap-4">
                                                                                <Home size={20} className="text-blue-600 dark:text-blue-400" />
                                                                                <div>
                                                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                                        {room.room_name}
                                                                                    </h4>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                        Room ID: {room.room_id}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                                                                                    {roomSessions.length} sessions
                                                                                </span>
                                                                                {isRoomExpanded ? (
                                                                                    <ChevronDown size={20} className="text-gray-500" />
                                                                                ) : (
                                                                                    <ChevronRight size={20} className="text-gray-500" />
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {isRoomExpanded && (
                                                                            <div className="p-4 bg-white dark:bg-gray-800">
                                                                                {isLoadingSessions ? (
                                                                                    <div className="flex items-center justify-center py-8">
                                                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                                                                            Loading sessions...
                                                                                        </span>
                                                                                    </div>
                                                                                ) : roomSessions.length === 0 ? (
                                                                                    <div className="text-center py-8">
                                                                                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                                                        <p className="text-gray-600 dark:text-gray-400">
                                                                                            No sessions found for this room.
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="space-y-3">
                                                                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                                                            Sessions ({roomSessions.length})
                                                                                        </h5>
                                                                                        {roomSessions.map((session) => {
                                                                                            const isSessionExpanded = expandedSessions[session.session_id]
                                                                                            const sessionAttendance = attendanceData[session.session_id] || []
                                                                                            const isLoadingAttendance = loadingAttendance[session.session_id]

                                                                                            return (
                                                                                                <div
                                                                                                    key={session.id}
                                                                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                                                                                >
                                                                                                    <div
                                                                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                                                                        onClick={() => toggleSessionExpansion(session.session_id)}
                                                                                                    >
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <Calendar
                                                                                                                size={16}
                                                                                                                className="text-green-600 dark:text-green-400"
                                                                                                            />
                                                                                                            <div>
                                                                                                                <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                                                                                                    Session {session.session_id}
                                                                                                                </h6>
                                                                                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                                                                                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                                                                            >
                                                                                                                {isSessionExpanded ? 'Hide' : 'Show'} Attendance
                                                                                                            </button>
                                                                                                            {isSessionExpanded ? (
                                                                                                                <ChevronDown size={16} className="text-gray-500" />
                                                                                                            ) : (
                                                                                                                <ChevronRight size={16} className="text-gray-500" />
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {isSessionExpanded && (
                                                                                                        <div className="p-3 bg-white dark:bg-gray-800">
                                                                                                            {/* Attendance Summary */}
                                                                                                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                                                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                                                                                    <div>
                                                                                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                                                                            {sessionAttendance.length}
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                            Attended
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                    <div>
                                                                                                                        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                                                                                                            {(enrolledUsersData[course.id] || []).length}
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                            Enrolled
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                    <div>
                                                                                                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                                                                            {enrolledUsersData[course.id] && sessionAttendance.length > 0
                                                                                                                                ? Math.round((sessionAttendance.length / enrolledUsersData[course.id].length) * 100)
                                                                                                                                : 0}%
                                                                                                                        </p>
                                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                            Attendance Rate
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            {isLoadingAttendance ? (
                                                                                                                <div className="flex items-center justify-center py-6">
                                                                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                                                                                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
                                                                                                                        Loading attendance...
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            ) : sessionAttendance.length === 0 ? (
                                                                                                                <div className="text-center py-6">
                                                                                                                    <UserCheck className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                                                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                                                                        No students joined this session yet.
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="space-y-2">
                                                                                                                    <h6 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                                                                                                                        Students who joined ({sessionAttendance.length})
                                                                                                                    </h6>
                                                                                                                    <div className="grid gap-2">
                                                                                                                        {sessionAttendance.map((record) => (
                                                                                                                            <div
                                                                                                                                key={record.id}
                                                                                                                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                                                                                            >
                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                                                                                        <UserCheck
                                                                                                                                            size={12}
                                                                                                                                            className="text-blue-600 dark:text-blue-400"
                                                                                                                                        />
                                                                                                                                    </div>
                                                                                                                                    <div>
                                                                                                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
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
                                                                                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                                                                                    <h6 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                                                                                                                        Students who didn't attend ({enrolledUsersData[course.id].length - sessionAttendance.length})
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
                                                                                                                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                                                                                                                {enrollment.user?.name || "Unknown User"}
                                                                                                                                            </p>
                                                                                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                                                {enrollment.user?.email || enrollment.user_id}
                                                                                                                                            </p>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                    <div className="text-right">
                                                                                                                                        <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
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
