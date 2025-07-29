"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Copy, Video, Users, Calendar, Clock, MessageSquare } from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useToast } from "../../../components/ui/Toaster"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost";

interface HostLiveSessionProps {
  course: any
  onBack: () => void
}

// API Constants
const CREATE_ROOM_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-hms-room`
const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-hms-token`

const HostLiveSession: React.FC<HostLiveSessionProps> = ({ course, onBack }) => {
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
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [videoUserName, setVideoUserName] = useState<string>("");

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
        // First get enrollments
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

        // Then get user details
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, avatar")
          .in("id", userIds)

        if (usersError) throw usersError
        setEnrolledUsers(users || [])
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // 1. Get current user's access token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        throw new Error("User not authenticated")
      }

      // 2. Validate form data
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
      console.log("Creating room:", roomNameToSend)

      // 3. Call Supabase Edge Function to create a 100ms room
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
      console.log("Room created:", roomData)

      if (!roomData.id) {
        throw new Error("Invalid room data received")
      }

      // 4. Save room info to Supabase DB
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

      // 5. Success - refresh sessions and reset form
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

      // Refresh sessions list
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

  // Handler for joining a live session as host
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
      const role = "host" // Host role for the instructor

      console.log("Generating token for:", { roomId, role, userId: authSession.user.id })

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
      console.log("Token generated successfully:", tokenData)

      // Open video call interface with the token
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

  const instructor = course.instructor || "Dr. Jane Doe"
  const instructorTitle = course.instructor_title || "Lead Instructor"
  const instructorAvatar =
    course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor)}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <img
                src={instructorAvatar || "/placeholder.svg"}
                alt="Instructor"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
                <div className="text-gray-700 font-medium">{instructor}</div>
                <div className="text-gray-500 text-sm">{instructorTitle}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Enrolled Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Enrolled Students</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">{enrolledUsers.length}</span>
              </div>

              {loadingEnrolled ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : enrolledUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No students enrolled yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {user.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500 truncate">{user.email || "No email"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
              </div>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No feedback available yet</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Schedule Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Schedule Live Session</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                  <input
                    type="text"
                    name="roomName"
                    value={form.roomName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={form.maxParticipants}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Brief description of the session"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? "Scheduling..." : "Schedule Live Session"}
                </button>
              </form>
            </div>

            {/* Scheduled Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Scheduled Sessions</h2>
              </div>

              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No sessions scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.room_name}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.start_time).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              Max: {session.max_participants}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : session.status === "live"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      {session.description && <p className="text-sm text-gray-600 mb-3">{session.description}</p>}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Room ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{session.room_id}</code>
                        <button
                          className="text-blue-600 hover:text-blue-700 text-xs"
                          onClick={() => handleCopy(session.room_id)}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={() => handleJoinSession(session)}
                        disabled={joiningSession === session.id}
                      >
                        {joiningSession === session.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Joining...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            Join as Host
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {videoToken && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="w-full h-full">
            <HMSRoomKitHost
              token={videoToken}
              userName={videoUserName || "Host"}
            />
            <button
              onClick={() => setVideoToken(null)}
              className="absolute top-4 right-4 bg-white text-black rounded px-4 py-2 shadow-lg z-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HostLiveSession
