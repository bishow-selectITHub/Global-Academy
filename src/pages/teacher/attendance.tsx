"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Calendar, Users, Clock, UserCheck, ChevronDown, ChevronRight, Home, BookOpen, BarChart3, Play, Image, ChevronDown as ChevronDownIcon } from "lucide-react"
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
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [selectedRoomId, setSelectedRoomId] = useState<string>("")
    const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({})
    const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})

    // Filter courses that match teacher's email
    const teacherCourses = courses.filter((course) => course.teacherEmail === user?.email)

    useEffect(() => {
        dispatch(fetchCourses())
    }, [dispatch])

    // Auto-select the first course when courses are loaded
    useEffect(() => {
        if (teacherCourses.length > 0 && !selectedCourseId) {
            const firstCourse = teacherCourses[0]
            setSelectedCourseId(firstCourse.id)
            fetchCourseRooms(firstCourse.id)
            fetchEnrolledUsers(firstCourse.id)
        }
    }, [teacherCourses, selectedCourseId])

    const fetchCourseRooms = async (courseId: string) => {
        if (roomsData[courseId] || loadingRooms[courseId]) return

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

            // Transform the data to match the expected interface
            const transformedRooms = (rooms || []).map(room => ({
                room_id: room.id, // Map 'id' to 'room_id' for compatibility
                course_id: room.course_id,
                room_name: room.room_name
            }))

            setRoomsData((prev) => ({ ...prev, [courseId]: transformedRooms }))

            // Auto-select the first room if available
            if (transformedRooms.length > 0 && courseId === selectedCourseId) {
                setSelectedRoomId(transformedRooms[0].room_id)
                // Auto-expand the first room
                setExpandedRooms((prev) => ({ ...prev, [transformedRooms[0].room_id]: true }))
                // Fetch sessions for the first room
                fetchRoomSessions(transformedRooms[0].room_id)
            }
        } catch (error) {
            console.error("Error fetching course rooms:", error)
        } finally {
            setLoadingRooms((prev) => ({ ...prev, [courseId]: false }))
        }
    }

    const fetchRoomSessions = async (roomId: string) => {
        if (sessionsData[roomId] || loadingSessions[roomId]) return

        setLoadingSessions((prev) => ({ ...prev, [roomId]: true }))

        try {
            const { data: sessions, error } = await supabase
                .from("room_sessions")
                .select("id, room_id, session_id, created_at")
                .eq("room_id", roomId)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching room sessions:", error)
                return
            }

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

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId)
        setSelectedRoomId("") // Reset room selection when course changes
        if (courseId) {
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
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-4">
                        <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Attendance Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Track student attendance across your courses, rooms, and sessions
                    </p>
                </div>

                {teacherCourses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                            <BookOpen className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No Courses Assigned</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">You don't have any courses assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Course Selector */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Select a Course</h3>
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                                >
                                    {teacherCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Selected Course Details */}
                        {selectedCourseId && (() => {
                            const course = teacherCourses.find(c => c.id === selectedCourseId)
                            if (!course) return null

                            const courseRooms = roomsData[selectedCourseId] || []
                            const isLoadingRooms = loadingRooms[selectedCourseId]

                            return (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <div className="flex items-start gap-4">
                                            {/* Course Thumbnail */}
                                            <div className="flex-shrink-0">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 shadow-lg">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Image className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{course.title}</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                                            {course.description || "No description available"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Course Stats */}
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                                        <Clock size={16} />
                                                        <span className="font-semibold">{course.duration || "Duration not set"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                                                        <BarChart3 size={16} />
                                                        <span className="font-semibold">{course.level || "Level not set"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                                                        <Home size={16} />
                                                        <span className="font-semibold">{courseRooms.length} rooms</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                                                        <Users size={16} />
                                                        <span className="font-semibold">
                                                            {(enrolledUsersData[course.id] || []).length} students
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
                                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                            Enrolled Students ({(enrolledUsersData[course.id] || []).length})
                                                        </h3>
                                                    </div>
                                                    {loadingEnrolledUsers[course.id] ? (
                                                        <div className="flex items-center justify-center py-6">
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                            <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading students...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            {(enrolledUsersData[course.id] || []).map((enrollment) => (
                                                                <div key={enrollment.user_id} className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                                            {enrollment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
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
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                                                                <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                Live Rooms ({courseRooms.length})
                                                            </h3>
                                                        </div>

                                                        {/* Room Selector */}
                                                        {courseRooms.length > 1 && (
                                                            <div className="relative">
                                                                <select
                                                                    value={selectedRoomId}
                                                                    onChange={(e) => {
                                                                        const roomId = e.target.value
                                                                        setSelectedRoomId(roomId)
                                                                        // Auto-expand the selected room
                                                                        setExpandedRooms((prev) => ({ ...prev, [roomId]: true }))
                                                                        // Fetch sessions for the selected room
                                                                        fetchRoomSessions(roomId)
                                                                        // Collapse other rooms
                                                                        const otherRooms = courseRooms.filter(r => r.room_id !== roomId)
                                                                        otherRooms.forEach(room => {
                                                                            setExpandedRooms((prev) => ({ ...prev, [room.room_id]: false }))
                                                                        })
                                                                    }}
                                                                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer text-sm"
                                                                >
                                                                    {courseRooms.map((room) => (
                                                                        <option key={room.room_id} value={room.room_id}>
                                                                            {room.room_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-3">
                                                        {courseRooms.map((room) => {
                                                            const isRoomExpanded = expandedRooms[room.room_id]
                                                            const roomSessions = sessionsData[room.room_id] || []
                                                            const isLoadingSessions = loadingSessions[room.room_id]
                                                            const isSelected = selectedRoomId === room.room_id

                                                            return (
                                                                <div
                                                                    key={room.room_id}
                                                                    className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${isSelected
                                                                        ? 'border-green-400 dark:border-green-500 ring-2 ring-green-200 dark:ring-green-800'
                                                                        : 'border-gray-200 dark:border-gray-600'
                                                                        }`}
                                                                >
                                                                    <div
                                                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 cursor-pointer hover:from-green-100 hover:via-emerald-100 hover:to-teal-100 dark:hover:from-green-900/30 dark:hover:via-emerald-900/30 dark:hover:to-teal-900/30 transition-all duration-200"
                                                                        onClick={() => toggleRoomExpansion(room.room_id)}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isSelected
                                                                                ? 'bg-gradient-to-br from-green-600 to-emerald-700'
                                                                                : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                                }`}>
                                                                                <Play className="h-6 w-6 text-white" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                                        {room.room_name}
                                                                                    </h4>
                                                                                    {isSelected && (
                                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                                                                            Selected
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                                                                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                                                                                            >
                                                                                                <div
                                                                                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 cursor-pointer hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 dark:hover:from-purple-900/30 dark:hover:via-pink-900/30 dark:hover:to-rose-900/30 transition-all duration-200"
                                                                                                    onClick={() => toggleSessionExpansion(session.session_id)}
                                                                                                >
                                                                                                    <div className="flex items-center gap-3">
                                                                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                                                                                            <Calendar className="h-5 w-5 text-white" />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <h6 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                                                                                                Session {session.session_id}
                                                                                                            </h6>
                                                                                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                                                                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
                                                                                                                    <Clock size={14} />
                                                                                                                    <span className="font-medium">{formatDate(session.created_at)}</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 px-3 py-1 rounded-lg">
                                                                                                                    <Users size={14} />
                                                                                                                    <span className="font-medium">{sessionAttendance.length} attendees</span>
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
                                                                                                        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
                                                                                                            <h6 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-center text-lg">Attendance Summary</h6>
                                                                                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                                                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                                                                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                                                                        {sessionAttendance.length}
                                                                                                                    </p>
                                                                                                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                                                                                                        Attended
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                                <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600">
                                                                                                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                                                                                                        {(enrolledUsersData[course.id] || []).length}
                                                                                                                    </p>
                                                                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                                                                                                        Enrolled
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                                                                                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                                                                                        {enrolledUsersData[course.id] && sessionAttendance.length > 0
                                                                                                                            ? Math.round((sessionAttendance.length / enrolledUsersData[course.id].length) * 100)
                                                                                                                            : 0}%
                                                                                                                    </p>
                                                                                                                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
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
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherAttendance
