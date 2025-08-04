"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Copy,
  Video,
  Users,
  Calendar,
  Clock,
  Plus,
  Play,
  UserCheck,
  RadioIcon,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Award,
  Activity,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Star,
  FileText,
  Download,
  X,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useToast } from "../../../components/ui/Toaster"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost"

interface HostLiveSessionProps {
  course: any
  onBack: () => void
}

// API Constants
const CREATE_ROOM_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-hms-room`
const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-hms-token`

const HostLiveSession: React.FC<HostLiveSessionProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<"enrolled" | "schedule" | "attendance" | "resources">("enrolled")
  const [form, setForm] = useState({
    roomName: "",
    startDate: "",
    maxParticipants: "50",
    description: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([])
  const [loadingEnrolled, setLoadingEnrolled] = useState(true)
  const [joiningSession, setJoiningSession] = useState<string | null>(null)
  const { addToast } = useToast()
  const [videoToken, setVideoToken] = useState<string | null>(null)
  const [videoUserName, setVideoUserName] = useState<string>("")
  const [attendanceCounts, setAttendanceCounts] = useState<{ [sessionId: string]: number }>({})
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<any | null>(null)
  const [sessionAttendees, setSessionAttendees] = useState<any[]>([])
  const [loadingSessionAttendees, setLoadingSessionAttendees] = useState(false)

  // Separate live and scheduled sessions
  const liveSessions = sessions.filter((session) => session.status === "live")
  const scheduledSessions = sessions.filter((session) => session.status === "scheduled")

  // Mock attendance data (replace with real data later)
  const attendanceData = [
    {
      id: 1,
      sessionName: "Introduction to React",
      date: "2024-01-15",
      attendees: 24,
      totalEnrolled: 30,
      duration: "1h 45m",
      rating: 4.8,
    },
    {
      id: 2,
      sessionName: "Advanced JavaScript",
      date: "2024-01-12",
      attendees: 28,
      totalEnrolled: 32,
      duration: "2h 15m",
      rating: 4.9,
    },
    {
      id: 3,
      sessionName: "CSS Grid & Flexbox",
      date: "2024-01-10",
      attendees: 22,
      totalEnrolled: 28,
      duration: "1h 30m",
      rating: 4.7,
    },
  ]

  // Mock resources data
  const mockResources = [
    {
      id: 1,
      name: "React Hooks Cheatsheet.pdf",
      type: "PDF",
      size: "1.2 MB",
      date: "2024-07-20",
      url: "/placeholder.pdf", // Placeholder URL
    },
    {
      id: 2,
      name: "Advanced CSS Techniques.docx",
      type: "DOCX",
      size: "850 KB",
      date: "2024-07-18",
      url: "/placeholder.docx", // Placeholder URL
    },
    {
      id: 3,
      name: "JavaScript ES6+ Syntax.zip",
      type: "ZIP",
      size: "5.5 MB",
      date: "2024-07-15",
      url: "/placeholder.zip", // Placeholder URL
    },
    {
      id: 4,
      name: "Course Syllabus.pdf",
      type: "PDF",
      size: "300 KB",
      date: "2024-07-10",
      url: "/placeholder.pdf", // Placeholder URL
    },
  ]

  // Keep existing useEffect hooks...
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true)
      try {
        const { data, error } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("course_id", course.id)
          .order("start_time", { ascending: false })
        if (error) throw error
        setSessions(data || [])
      } catch (error: any) {
        console.error("Error fetching sessions:", error)
        addToast?.({
          type: "error",
          title: "Error",
          message: "Could not fetch live sessions.",
        })
      } finally {
        setLoadingSessions(false)
      }
    }
    fetchSessions()
  }, [course.id, addToast])

  useEffect(() => {
    const fetchEnrolled = async () => {
      setLoadingEnrolled(true)
      try {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("course_enrollments")
          .select("user_id")
          .eq("course_id", course.id)
        if (enrollmentsError) throw enrollmentsError
        if (enrollments.length === 0) {
          setEnrolledUsers([])
          return
        }
        const userIds = enrollments.map((e) => e.user_id)
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, avatar")
          .in("id", userIds)
        if (usersError) throw usersError
        // Transform the data to include mock additional data for demo
        const enrichedUsers = (users || []).map((user) => ({
          ...user,
          enrolledAt: new Date().toISOString(), // Mock enrollment date
          progress: Math.floor(Math.random() * 100), // Mock progress
          location: "New York, USA",
          phone: "+1 (555) 123-4567",
          completedLessons: Math.floor(Math.random() * 10),
          totalLessons: 10,
          lastActive: "2 hours ago",
          rating: 4.5 + Math.random() * 0.5,
        }))
        setEnrolledUsers(enrichedUsers)
      } catch (error: any) {
        console.error("Error fetching enrolled users:", error)
        addToast?.({
          type: "error",
          title: "Error",
          message: "Could not fetch enrolled users.",
        })
        setEnrolledUsers([])
      } finally {
        setLoadingEnrolled(false)
      }
    }
    fetchEnrolled()
  }, [course.id, addToast])

  useEffect(() => {
    const fetchAttendanceCounts = async () => {
      if (!sessions.length) return
      const counts: { [sessionId: string]: number } = {}
      for (const session of sessions) {
        const { count, error } = await supabase
          .from("students_attendance")
          .select("id", { count: "exact", head: true })
          .eq("session_id", session.id)
        counts[session.id] = count || 0
      }
      setAttendanceCounts(counts)
    }
    fetchAttendanceCounts()
  }, [sessions])

  // Keep existing handlers...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error("User not authenticated")
      }
      if (!form.roomName.trim()) {
        throw new Error("Room name is required")
      }
      if (!form.startDate) {
        throw new Error("Start date is required")
      }
      if (!form.maxParticipants || Number.parseInt(form.maxParticipants) < 1) {
        throw new Error("Valid maximum participants number is required")
      }
      const roomNameToSend = form.roomName.trim()
      const roomResponse = await fetch(CREATE_ROOM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ room_name: roomNameToSend }),
      })
      if (!roomResponse.ok) {
        const errorText = await roomResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || "Could not create room")
      }
      const roomData = await roomResponse.json()
      if (!roomData.id) {
        throw new Error("Invalid room data received")
      }
      const { error: insertError } = await supabase.from("live_sessions").insert({
        course_id: course.id,
        room_id: roomData.id,
        room_name: form.roomName.trim(),
        start_time: form.startDate,
        max_participants: Number.parseInt(form.maxParticipants),
        description: form.description.trim() || null,
        status: "scheduled",
      })
      if (insertError) throw insertError
      addToast?.({
        type: "success",
        title: "Live session scheduled",
        message: "Room created successfully.",
      })
      setForm({
        roomName: "",
        startDate: "",
        maxParticipants: "50",
        description: "",
      })
      const { data: updatedSessions } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("course_id", course.id)
        .order("start_time", { ascending: false })
      setSessions(updatedSessions || [])
    } catch (error: any) {
      console.error("Error scheduling session:", error)
      addToast?.({
        type: "error",
        title: "Error",
        message: error.message || "Could not schedule live session.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (roomId: string) => {
    try {
      await navigator.clipboard.writeText(roomId)
      addToast?.({
        type: "success",
        title: "Copied",
        message: "Room ID copied to clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      addToast?.({
        type: "error",
        title: "Error",
        message: "Failed to copy room ID.",
      })
    }
  }

  const handleJoinSession = async (session: any) => {
    setJoiningSession(session.id)
    try {
      const {
        data: { session: authSession },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !authSession?.access_token || !authSession?.user) {
        throw new Error("You must be logged in to join.")
      }
      const roomId = session.room_id
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
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate 100ms token")
      }

      const tokenData = await response.json()
      console.log(tokenData)
      setVideoToken(tokenData.token)
      setVideoUserName(instructor)
    } catch (error: any) {
      console.error("Error joining session:", error)
      addToast?.({
        type: "error",
        title: "Error",
        message: error.message || "Failed to join session.",
      })
    } finally {
      setJoiningSession(null)
    }
  }

  const fetchSessionAttendees = async (sessionId: string) => {
    setLoadingSessionAttendees(true)
    try {
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("students_attendance")
        .select("user_id, joined_at")
        .eq("session_id", sessionId)

      if (attendanceError) throw attendanceError

      if (attendanceData.length === 0) {
        setSessionAttendees([])
        return
      }

      const userIds = attendanceData.map((a) => a.user_id)
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email, avatar")
        .in("id", userIds)

      if (usersError) throw usersError

      const enrichedAttendees = attendanceData.map((attendance) => {
        const user = users?.find((u) => u.id === attendance.user_id)
        return {
          ...attendance,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "N/A",
          userAvatar:
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "Unknown")}`,
        }
      })
      setSessionAttendees(enrichedAttendees)
    } catch (error: any) {
      console.error("Error fetching session attendees:", error)
      addToast?.({
        type: "error",
        title: "Error",
        message: error.message || "Could not fetch session attendees.",
      })
      setSessionAttendees([])
    } finally {
      setLoadingSessionAttendees(false)
    }
  }

  const handleViewAttendanceDetails = (session: any) => {
    setSelectedSessionForAttendance(session)
    fetchSessionAttendees(session.id)
  }

  const handleCloseAttendanceDetails = () => {
    setSelectedSessionForAttendance(null)
    setSessionAttendees([])
  }

  const instructor = course.instructor || "Dr. Jane Doe"
  const instructorTitle = course.instructor_title || "Lead Instructor"
  const instructorAvatar =
    course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor)}`

  const TabButton = ({
    tab,
    icon,
    label,
    count,
    color,
  }: { tab: string; icon: React.ReactNode; label: string; count?: number; color: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab
        ? `${color} text-white shadow-md`
        : "bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
        }`}
    >
      <div className={`${activeTab === tab ? "" : "opacity-70"}`}>{icon}</div>
      <span className="text-sm">{label}</span>
      {count !== undefined && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            }`}
        >
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="mb-4">
          <button
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>
          {/* Course Info Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={instructorAvatar || "/placeholder.svg"}
                  alt="Instructor"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-gray-700 font-medium text-sm">{instructor}</div>
                  <div className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded-full">
                    {instructorTitle}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{enrolledUsers.length}</div>
                      <div className="text-xs">Students</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Video className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{sessions.length}</div>
                      <div className="text-xs">Sessions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <RadioIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{liveSessions.length}</div>
                      <div className="text-xs">Live Now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="flex gap-6 mb-8">
            <TabButton
              tab="enrolled"
              icon={<Users className="w-5 h-5" />}
              label="Enrolled Students"
              count={enrolledUsers.length}
              color="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <TabButton
              tab="schedule"
              icon={<Calendar className="w-5 h-5" />}
              label="Schedule Session"
              color="bg-gradient-to-r from-emerald-500 to-teal-500"
            />
            <TabButton
              tab="attendance"
              icon={<UserCheck className="w-5 h-5" />}
              label="Attendance"
              count={attendanceData.length}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <TabButton
              tab="resources"
              icon={<FileText className="w-5 h-5" />}
              label="Resources"
              count={mockResources.length}
              color="bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === "enrolled" && (
          <div className="space-y-6">
            {/* Enrolled Students Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Total Enrolled</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{enrolledUsers.length}</p>
                <p className="text-xs font-medium text-blue-600">Active students</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Avg Progress</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(enrolledUsers.reduce((sum, user) => sum + user.progress, 0) / enrolledUsers.length || 0)}%
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <p className="text-xs font-medium text-emerald-600">+12% this week</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Completed</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {enrolledUsers.filter((user) => user.progress >= 100).length}
                </p>
                <p className="text-xs font-medium text-purple-600">Finished course</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Avg Rating</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {(enrolledUsers.reduce((sum, user) => sum + user.rating, 0) / enrolledUsers.length || 0).toFixed(1)}
                </p>
                <p className="text-xs font-medium text-amber-600">Student feedback</p>
              </div>
            </div>
            {/* Students List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Enrolled Students</h2>
                  <p className="text-gray-600 text-sm">Manage and track student progress</p>
                </div>
              </div>
              {loadingEnrolled ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : enrolledUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No Students Enrolled</h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                    No students have enrolled in this course yet. Share your course to attract learners.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Student</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Progress</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Lessons</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Enrolled</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Address</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrolledUsers.map((student, index) => (
                        <tr
                          key={student.id}
                          className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                        >
                          {/* Student Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  student.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || student.email)}`
                                }
                                alt={student.name}
                                className="w-10 h-10 rounded-lg object-cover border-2 border-gray-100"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{student.name || "Anonymous"}</h3>
                                <p className="text-gray-600 text-xs">{student.email}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                                  <span className="text-xs font-medium text-gray-700">{student.rating.toFixed(1)}</span>
                                  <span className="text-gray-400 mx-1">•</span>
                                  <span className="text-xs text-gray-500">{student.lastActive}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Progress */}
                          <td className="py-4 px-6">
                            <div className="w-full max-w-[120px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-900">{student.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.progress >= 100 ? "Completed" : "In Progress"}
                              </div>
                            </div>
                          </td>
                          {/* Lessons */}
                          <td className="py-4 px-6">
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {student.completedLessons}/{student.totalLessons}
                              </div>
                              <div className="text-xs text-gray-500">lessons</div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${(student.completedLessons / student.totalLessons) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* Enrolled Date */}
                          <td className="py-4 px-6">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(student.enrolledAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.floor(
                                (new Date().getTime() - new Date(student.enrolledAt).getTime()) / (1000 * 60 * 60 * 24),
                              )}{" "}
                              days ago
                            </div>
                          </td>
                          {/* Address */}
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900 max-w-[150px]">
                              <div className="flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="truncate">{student.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{student.phone}</span>
                              </div>
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg text-xs font-medium transition-colors">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "schedule" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Schedule New Session</h2>
                  <p className="text-gray-600 text-sm">Create a new live video session for your course</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Session Name</label>
                  <input
                    type="text"
                    name="roomName"
                    value={form.roomName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200"
                    placeholder="e.g., Introduction to React Hooks"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Maximum Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={form.maxParticipants}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200"
                      min="1"
                      max="1000"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-sm transition-all duration-200"
                    rows={4}
                    placeholder="Brief description of what will be covered in this session..."
                  />
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Schedule Live Session
                      </>
                    )}
                  </button>
                </div>
              </form>
              {/* Scheduled Sessions List */}
              {scheduledSessions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Scheduled Sessions</h3>
                  <div className="space-y-3">
                    {scheduledSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{session.room_name}</h4>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(session.start_time).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Max: {session.max_participants}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <code className="bg-gray-100 px-3 py-1 rounded text-xs font-mono flex-1">
                            {session.room_id}
                          </code>
                          <button
                            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                            onClick={() => handleCopy(session.room_id)}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                            onClick={() => handleJoinSession(session)}
                            disabled={joiningSession === session.id}
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Avg Attendance</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {enrolledUsers.length > 0
                    ? `${Math.round(
                      (Object.values(attendanceCounts).reduce((sum, count) => sum + count, 0) /
                        (sessions.length * enrolledUsers.length || 1)) *
                      100,
                    )}%`
                    : "N/A"}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <p className="text-xs font-medium text-purple-600">+5% from last month</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Total Sessions</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{sessions.length}</p>
                <p className="text-xs font-medium text-blue-600">This month</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Total Hours</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">12.5h</p>
                <p className="text-xs font-medium text-emerald-600">Live session time</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Avg Rating</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">4.8</p>
                <p className="text-xs font-medium text-amber-600">Session feedback</p>
              </div>
            </div>
            {/* Conditional Rendering for Session List vs. Detailed Attendance */}
            {selectedSessionForAttendance ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Attendance for: {selectedSessionForAttendance.room_name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {selectedSessionForAttendance.start_time
                          ? new Date(selectedSessionForAttendance.start_time).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAttendanceDetails}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {loadingSessionAttendees ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : sessionAttendees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No Attendees Recorded</h3>
                    <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                      No attendance records found for this session yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Student</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Joined At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sessionAttendees.map((attendee, index) => (
                          <tr
                            key={attendee.user_id}
                            className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={attendee.userAvatar || "/placeholder.svg"}
                                  alt={attendee.userName}
                                  className="w-10 h-10 rounded-lg object-cover border-2 border-gray-100"
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">{attendee.userName}</h3>
                                  <p className="text-gray-600 text-xs">{attendee.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700">
                              {new Date(attendee.joined_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Session Attendance Records</h2>
                    <p className="text-gray-600 text-sm">Detailed attendance for each live session</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const attendancePercentage =
                      enrolledUsers.length > 0 ? ((attendanceCounts[session.id] || 0) / enrolledUsers.length) * 100 : 0
                    return (
                      <div
                        key={session.room_id}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">{session.room_name}</h3>
                            <p className="text-gray-600 font-medium text-sm">
                              {session.start_time
                                ? new Date(session.start_time).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                                : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {attendanceCounts[session.id] ?? "..."} / {enrolledUsers.length}
                            </div>
                            <div className="text-sm font-semibold text-purple-600">
                              {enrolledUsers.length > 0 ? `${Math.round(attendancePercentage)}% attendance` : "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Duration: N/A</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{session.max_participants} participants</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <Award className="w-4 h-4" />
                            <span className="font-medium">Rating: N/A</span>
                          </div>
                        </div>
                        {/* Attendance Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleViewAttendanceDetails(session)}
                            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                            Export Report
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "resources" && (
          <div className="space-y-6">
            {/* Resources Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Total Resources</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{mockResources.length}</p>
                <p className="text-xs font-medium text-amber-600">Available for students</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Total Downloads</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">150+</p>
                <p className="text-xs font-medium text-blue-600">Across all resources</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Last Updated</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">2 days ago</p>
                <p className="text-xs font-medium text-emerald-600">Most recent file</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">Active Users</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">90%</p>
                <p className="text-xs font-medium text-purple-600">Engaging with resources</p>
              </div>
            </div>
            {/* Resources List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Course Resources</h2>
                  <p className="text-gray-600 text-sm">Notes, files, and supplementary materials</p>
                </div>
              </div>
              {mockResources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No Resources Available</h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                    No resources have been uploaded for this course yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">File Name</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Type</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Size</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Date Added</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockResources.map((resource, index) => (
                        <tr
                          key={resource.id}
                          className={`hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <span className="font-medium text-gray-900">{resource.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">{resource.type}</td>
                          <td className="py-4 px-6 text-sm text-gray-700">{resource.size}</td>
                          <td className="py-4 px-6 text-sm text-gray-700">{resource.date}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <a
                                href={resource.url}
                                download
                                className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                              <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Video Call Modal */}
      {videoToken && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="w-full h-full">
            <HMSRoomKitHost token={videoToken} userName={videoUserName || "Host"} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HostLiveSession
