"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Users, UserCheck, BookOpen, Plus, Minus, ArrowLeft, Eye, X } from "lucide-react"
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

interface StudentAttendanceStatus {
  user_id: string
  user: {
    name: string
    email: string
  }
  isPresent: boolean
  attendanceRecordId?: string
  joinedAt?: string
}

enum ViewState {
  COURSES = "courses",
  ROOMS_SESSIONS = "rooms_sessions",
}

const TeacherAttendance = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser()

  const { data: courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.COURSES)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<string>("")

  const [roomsData, setRoomsData] = useState<Record<string, Room[]>>({})
  const [sessionsData, setSessionsData] = useState<Record<string, RoomSession[]>>({})
  const [enrolledUsersData, setEnrolledUsersData] = useState<Record<string, EnrolledUser[]>>({})
  const [attendanceStatusData, setAttendanceStatusData] = useState<Record<string, StudentAttendanceStatus[]>>({})
  const [loadingRooms, setLoadingRooms] = useState<Record<string, boolean>>({})
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({})
  const [loadingEnrolledUsers, setLoadingEnrolledUsers] = useState<Record<string, boolean>>({})
  const [loadingAttendanceStatus, setLoadingAttendanceStatus] = useState<Record<string, boolean>>({})
  const [togglingAttendance, setTogglingAttendance] = useState<Record<string, boolean>>({})

  // Filter courses that match teacher's email
  const teacherCourses = courses.filter((course) => course.teacherEmail === user?.email)

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  const handleViewAttendance = async (course: any) => {
    setSelectedCourse(course)
    setCurrentView(ViewState.ROOMS_SESSIONS)
    await fetchCourseRooms(course.id)
    await fetchEnrolledUsers(course.id)
  }

  const handleBackToCourses = () => {
    setCurrentView(ViewState.COURSES)
    setSelectedCourse(null)
  }

  const handleShowAttendance = async (sessionId: string) => {
    setSelectedSessionForModal(sessionId)
    setShowAttendanceModal(true)
    await fetchAttendanceStatus(sessionId)
  }

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

      const transformedRooms = (rooms || []).map((room) => ({
        room_id: room.id,
        course_id: room.course_id,
        room_name: room.room_name,
      }))

      setRoomsData((prev) => ({ ...prev, [courseId]: transformedRooms }))

      // Fetch sessions for all rooms
      for (const room of transformedRooms) {
        await fetchRoomSessions(room.room_id)
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

  const fetchAttendanceStatus = async (sessionId: string) => {
    if (attendanceStatusData[sessionId] || loadingAttendanceStatus[sessionId]) return

    setLoadingAttendanceStatus((prev) => ({ ...prev, [sessionId]: true }))

    try {
      const { data: attendanceRecords, error } = await supabase
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

      if (error) {
        console.error("Error fetching attendance records:", error)
        return
      }

      const attendanceStatus: StudentAttendanceStatus[] = (attendanceRecords || []).map((record) => ({
        user_id: record.user_id,
        user: record.users || { name: "Unknown User", email: "" },
        isPresent: true, // All records from students_attendance table are present
        attendanceRecordId: record.id,
        joinedAt: record.joined_at,
      }))

      setAttendanceStatusData((prev) => ({ ...prev, [sessionId]: attendanceStatus }))
    } catch (error) {
      console.error("Error fetching attendance status:", error)
    } finally {
      setLoadingAttendanceStatus((prev) => ({ ...prev, [sessionId]: false }))
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

  const toggleAttendance = async (
    userId: string,
    sessionId: string,
    isCurrentlyPresent: boolean,
    attendanceRecordId?: string,
  ) => {
    const toggleKey = `${userId}-${sessionId}`
    if (togglingAttendance[toggleKey]) return

    setTogglingAttendance((prev) => ({ ...prev, [toggleKey]: true }))

    try {
      if (isCurrentlyPresent && attendanceRecordId) {
        const { error } = await supabase.from("students_attendance").delete().eq("id", attendanceRecordId)

        if (error) throw error

        setAttendanceStatusData((prev) => ({
          ...prev,
          [sessionId]:
            prev[sessionId]?.map((student) =>
              student.user_id === userId
                ? { ...student, isPresent: false, attendanceRecordId: undefined, joinedAt: undefined }
                : student,
            ) || [],
        }))
      } else {
        // Find the room_id for this session
        const roomId = Object.keys(sessionsData).find((rId) =>
          sessionsData[rId].some((session) => session.session_id === sessionId),
        )

        const { data, error } = await supabase
          .from("students_attendance")
          .insert([
            {
              user_id: userId,
              session_id: sessionId,
              room_id: roomId,
              joined_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()

        if (error) throw error

        setAttendanceStatusData((prev) => ({
          ...prev,
          [sessionId]:
            prev[sessionId]?.map((student) =>
              student.user_id === userId
                ? {
                    ...student,
                    isPresent: true,
                    attendanceRecordId: data.id,
                    joinedAt: data.joined_at,
                  }
                : student,
            ) || [],
        }))
      }
    } catch (error) {
      console.error("Error toggling attendance:", error)
    } finally {
      setTogglingAttendance((prev) => ({ ...prev, [toggleKey]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
            <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage student attendance for your live sessions</p>
        </div>

        {currentView === ViewState.COURSES && (
          <div>
            {teacherCourses.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Courses Assigned</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You don't have any courses assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Courses</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage attendance for your assigned courses
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teacherCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      {/* Course Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                          <BookOpen className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      {/* Course Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Course ID: {course.id}</p>
                            {course.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Users className="h-3.5 w-3.5" />
                                <span>{enrolledUsersData[course.id]?.length || 0} enrolled</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Teacher: {course.teacherEmail}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0 ml-4">
                            <button
                              onClick={() => handleViewAttendance(course)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                            >
                              <Eye className="h-4 w-4" />
                              View Attendance
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === ViewState.ROOMS_SESSIONS && selectedCourse && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleBackToCourses}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedCourse.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Rooms and Sessions</p>
              </div>
            </div>

            {loadingRooms[selectedCourse.id] ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading rooms...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(roomsData[selectedCourse.id] || []).map((room) => (
                  <div
                    key={room.room_id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{room.room_name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Room ID: {room.room_id}</p>
                    </div>

                    <div className="p-4">
                      {loadingSessions[room.room_id] ? (
                        <div className="flex items-center justify-center py-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading sessions...</span>
                        </div>
                      ) : (sessionsData[room.room_id] || []).length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">
                          No sessions found for this room
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                            Sessions ({(sessionsData[room.room_id] || []).length})
                          </h4>
                          {(sessionsData[room.room_id] || []).map((session) => (
                            <div
                              key={session.session_id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                            >
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  Session {session.session_id}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatDate(session.created_at)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleShowAttendance(session.session_id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200"
                              >
                                <Users className="h-3.5 w-3.5" />
                                Show Attendance
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Session Attendance</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Session {selectedSessionForModal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {(attendanceStatusData[selectedSessionForModal] || []).filter((s) => s.isPresent).length}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {(attendanceStatusData[selectedSessionForModal] || []).filter((s) => !s.isPresent).length}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">Absent</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAttendanceModal(false)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {loadingAttendanceStatus[selectedSessionForModal] ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Loading attendance...</span>
                  </div>
                ) : (attendanceStatusData[selectedSessionForModal] || []).length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                      No Attendance Records
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No students have joined this session yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(attendanceStatusData[selectedSessionForModal] || []).map((student) => {
                      const toggleKey = `${student.user_id}-${selectedSessionForModal}`
                      const isToggling = togglingAttendance[toggleKey]

                      return (
                        <div
                          key={student.user_id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            student.isPresent
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                                student.isPresent
                                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                  : "bg-gradient-to-br from-red-500 to-rose-600"
                              }`}
                            >
                              {student.user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {student.user.name || "Unknown User"}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{student.user.email}</p>
                              {student.isPresent && student.joinedAt && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Joined: {formatDate(student.joinedAt)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                student.isPresent
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
                              }`}
                            >
                              {student.isPresent ? "Present" : "Absent"}
                            </span>

                            <button
                              onClick={() =>
                                toggleAttendance(
                                  student.user_id,
                                  selectedSessionForModal,
                                  student.isPresent,
                                  student.attendanceRecordId,
                                )
                              }
                              disabled={isToggling}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                student.isPresent
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              {isToggling ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : student.isPresent ? (
                                <>
                                  <Minus className="h-3 w-3" />
                                  Mark Absent
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  Mark Present
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherAttendance
