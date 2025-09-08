"use client"
import React from "react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from 'react-dom'
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
  Download,
  X,
  FileText,
  Upload,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useToast } from "../../../components/ui/Toaster"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost"

interface HostLiveSessionProps {
  course: any
  onBack: () => void
}

// API Constants
const CREATE_ROOM_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/create-hms-room`
const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/generate-hms-token`
const FETCH_RECORDINGS_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/fetch-hms-recordings`

const HostLiveSession: React.FC<HostLiveSessionProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<"enrolled" | "schedule" | "attendance" | "recordings" | "notes">("enrolled")
  const [form, setForm] = useState({
    roomName: "",
    startDate: "",
    maxParticipants: "50",
    description: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  // const [loadingSessions, setLoadingSessions] = useState(true)
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([])
  const [loadingEnrolled, setLoadingEnrolled] = useState(true)
  const [joiningSession, setJoiningSession] = useState<string | null>(null)
  const { addToast } = useToast()
  const [videoToken, setVideoToken] = useState<string | null>(null)
  const [videoUserName, setVideoUserName] = useState<string>("")
  const [currentSessionData, setCurrentSessionData] = useState<{ roomId: string; sessionId: string } | null>(null)
  const [attendanceCounts, setAttendanceCounts] = useState<{ [sessionId: string]: number }>({})
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<any | null>(null)
  const [roomSessionsMap, setRoomSessionsMap] = useState<Record<string, any[]>>({})
  const [sessionAttendanceCounts, setSessionAttendanceCounts] = useState<Record<string, number>>({})
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)
  const [sessionAttendees, setSessionAttendees] = useState<any[]>([])
  const [loadingSessionAttendees, setLoadingSessionAttendees] = useState(false)
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null)
  const hostLiveRoomIdRef = useRef<string | null>(null)
  const hostHmsRoomIdRef = useRef<string | null>(null)
  const hasPersistedRef = useRef<boolean>(false)
  const isPersistingRef = useRef<boolean>(false)
  const persistFallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Per-student details expansion and attendance
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [userAttendanceMap, setUserAttendanceMap] = useState<Record<string, any[]>>({})
  const [loadingUserAttendance, setLoadingUserAttendance] = useState<Record<string, boolean>>({})

  // Separate live and scheduled sessions
  const liveSessions = sessions.filter((session) => session.status === "live")
  const scheduledSessions = sessions.filter((session) => session.status === "scheduled")

  const [recordings, setRecordings] = useState<any[]>([])
  const [loadingRecordings, setLoadingRecordings] = useState(false)
  // Notes (course assets)
  const [notes, setNotes] = useState<Array<{ id?: string; name: string; size?: number; path: string; url?: string }>>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [uploadingNotes, setUploadingNotes] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteName, setNoteName] = useState("")
  const [noteFile, setNoteFile] = useState<File | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)

  // Mock attendance data (replace with real data later)



  // Keep existing useEffect hooks...
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("live_rooms")
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
        // no session loading UI currently
      }
    }
    fetchSessions()
  }, [course.id, addToast])

  useEffect(() => {
    const fetchEnrolled = async () => {
      setLoadingEnrolled(true)
      try {
        // Fetch enrollments for this course with user_id and progress
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("course_enrollments")
          .select("user_id, progress, lessons, enrolled_at, created_at")
          .eq("course_id", course.id)

        if (enrollmentsError) throw enrollmentsError
        if (!enrollments || enrollments.length === 0) {
          setEnrolledUsers([])
          return
        }

        // Map user_id to enrollment-based fields
        const progressByUserId: Record<string, number> = {}
        const lessonsByUid: Record<string, number> = {}
        const enrolledAtByUserId: Record<string, string | null> = {}

        const userIds = enrollments.map((e) => {
          progressByUserId[e.user_id] = typeof e.progress ? e.progress : 0
          lessonsByUid[e.user_id] = Array.isArray(e.lessons) ? e.lessons.length : 0
          const enrolled = (e as any).enrolled_at ?? (e as any).created_at ?? null
          enrolledAtByUserId[e.user_id] = enrolled
          return e.user_id
        })




        // Fetch user profiles for the enrolled users
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, name, email,location,phone")
          .in("id", userIds)
        if (usersError) throw usersError

        // Enrich users with their enrollment progress from course_enrollments
        const enrichedUsers = (users || []).map((user) => ({
          ...user,
          enrolledAt: enrolledAtByUserId[user.id],
          progress: progressByUserId[user.id] ?? 0,
          location: user.location,
          phone: user.phone,
          completedLessons: lessonsByUid[user.id] ?? 0,
          totalLessons: (course as any)?.lessons?.length ?? 0,
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

  // Load room_sessions for all rooms and compute per-session and per-room attendance counts
  useEffect(() => {
    if (activeTab !== "attendance") return
    if (!sessions.length) return
    const load = async () => {
      try {
        const roomIds = sessions.map((s) => s.id)
        const { data: roomSessions, error } = await supabase
          .from("room_sessions")
          .select("room_id, session_id, created_at, active")
          .in("room_id", roomIds)
          .order("created_at", { ascending: false })
        if (error) throw error
        const map: Record<string, any[]> = {}
          ; (roomSessions || []).forEach((rs: any) => {
            if (!map[rs.room_id]) map[rs.room_id] = []
            map[rs.room_id].push(rs)
          })
        setRoomSessionsMap(map)

        // Compute per-session attendance counts (students_attendance filtered by session_id)
        const perSessionCounts: Record<string, number> = {}
        for (const rs of roomSessions || []) {
          const { count } = await supabase
            .from("students_attendance")
            .select("id", { count: "exact", head: true })
            .eq("session_id", rs.session_id)
          perSessionCounts[rs.session_id] = count || 0
        }
        setSessionAttendanceCounts(perSessionCounts)

        // Aggregate totals per room
        const perRoomTotals: Record<string, number> = {}
        for (const rs of roomSessions || []) {
          const add = perSessionCounts[rs.session_id] || 0
          perRoomTotals[rs.room_id] = (perRoomTotals[rs.room_id] || 0) + add
        }
        setAttendanceCounts(perRoomTotals)
      } catch (e) {
        console.warn("Failed to load attendance counts:", e)
        setRoomSessionsMap({})
        setSessionAttendanceCounts({})
        setAttendanceCounts({})
      }
    }
    void load()
  }, [activeTab, sessions])

  useEffect(() => {
    if (activeTab !== "recordings") return
    if (!sessions || sessions.length === 0) return
    // Sync and then load recordings whenever the tab opens and sessions are available
    void syncAndLoadRecordings()
  }, [activeTab, sessions])

  useEffect(() => {
    if (activeTab !== "notes") return
    void loadCourseNotes()
  }, [activeTab])

  // Debug effect to track videoToken changes
  useEffect(() => {
    if (videoToken) {
      console.log("🚀 [DEBUG] videoToken changed:", {
        hasToken: !!videoToken,
        tokenLength: videoToken.length,
        pendingRoomId
      })
      // When preview token arrives, stop showing "Starting…" on the Start button
      setJoiningSession(null)
    }
  }, [videoToken, pendingRoomId])

  const loadRoomRecordings = async () => {
    // Load recordings saved in room_sessions for all sessions of this course
    const sessionIds = sessions.map((s) => s.id)
    if (sessionIds.length === 0) {
      setRecordings([])
      return
    }
    const { data, error } = await supabase
      .from("room_sessions")
      .select("room_id, recordings, created_at")
      .in("room_id", sessionIds)
      .not("recordings", "is", null)

    if (error) throw error

    const recordingsList: any[] = []
      ; (data || []).forEach((roomSession: any) => {
        const sessionMeta = sessions.find((s) => s.id === roomSession.room_id)
        const roomName = sessionMeta?.room_name || "Untitled Session"
        if (roomSession.recordings && roomSession.recordings.length > 0) {
          roomSession.recordings.forEach((rec: any) => {
            recordingsList.push({ ...rec, room_name: roomName })
          })
        }
      })

    // Newest first by created_at in recording, fallback to session created_at
    recordingsList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    setRecordings(recordingsList)
  }

  const syncAndLoadRecordings = async () => {
    setLoadingRecordings(true)
    try {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession()
      if (!authSession?.access_token) {
        throw new Error("User not authenticated")
      }

      // Trigger the Edge Function for each session to pull latest recordings from 100ms
      const requests = sessions.map((s) =>
        fetch(FETCH_RECORDINGS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({ room_id: s.id }),
        })
      )
      const results = await Promise.allSettled(requests)

      // Surface any hard failures in logs but don't block loading
      results.forEach(async (r, idx) => {
        const sess = sessions[idx]
        if (r.status === "fulfilled") {
          try {
            const res = r.value
            const text = await res.text()
            console.log("fetch-hms-recordings response", {
              session_id: sess?.id,
              ok: res.ok,
              status: res.status,
              body: text,
            })
          } catch (e) {
            console.log("fetch-hms-recordings response parse error", e)
          }
        } else {
          console.warn("fetch-hms-recordings error for session", sess?.id, r.reason)
        }
      })

      // After syncing, load what is stored in room_sessions
      await loadRoomRecordings()
    } catch (error: any) {
      console.error("Error syncing/loading recordings:", error)
      addToast?.({
        type: "error",
        title: "Error",
        message: error?.message || "Could not fetch session recordings.",
      })
    } finally {
      setLoadingRecordings(false)
    }
  }

  // Course Notes helpers
  const NOTES_BUCKET = "course-assets"
  const notesPrefix = `course-notes/${course.id}`

  const loadCourseNotes = async () => {
    setLoadingNotes(true)
    try {
      const buildUrls = async (items: Array<{ id?: string; name: string; path: string; size?: number }>) => {
        return await Promise.all(items.map(async (it) => {
          let url: string | undefined
          try {
            const { data: pub } = await supabase.storage.from(NOTES_BUCKET).getPublicUrl(it.path)
            url = pub?.publicUrl || undefined
          } catch (_) {
            // ignore
          }
          if (!url) {
            try {
              const { data: signed } = await supabase.storage.from(NOTES_BUCKET).createSignedUrl(it.path, 60 * 60)
              url = signed?.signedUrl || undefined
            } catch (_) {
              // ignore
            }
          }
          return { ...it, url }
        }))
      }

      // Try loading from notes table first
      try {
        const { data: noteRows } = await supabase
          .from("notes")
          .select("id, file_url, name, created_at")
          .eq("course_id", course.id)
          .order("created_at", { ascending: false })
        if (noteRows && noteRows.length > 0) {
          const mapped = noteRows.map((r: any) => ({
            id: r.id,
            name: r.name || (r.file_url?.split("/").pop() ?? "file"),
            path: r.file_url,
          }))
          const withUrls = await buildUrls(mapped)
          setNotes(withUrls)
          return
        }
      } catch (_) {
        // If table doesn't exist or RLS prevents read, fall back to storage listing
      }

      const { data, error } = await supabase.storage
        .from(NOTES_BUCKET)
        .list(notesPrefix, { limit: 100, sortBy: { column: "name", order: "asc" } })
      if (error) throw error
      if (data && data.length > 0) {
        const mapped = (data || []).map((f: any) => ({ name: f.name, size: (f as any)?.metadata?.size || (f as any)?.size, path: `${notesPrefix}/${f.name}` }))
        const withUrls = await buildUrls(mapped)
        setNotes(withUrls)
      } else {
        const { data: rootData, error: rootErr } = await supabase.storage
          .from(NOTES_BUCKET)
          .list("course-notes", { limit: 100, sortBy: { column: "name", order: "asc" } })
        if (rootErr) throw rootErr
        const mappedRoot = (rootData || []).map((f: any) => ({ name: f.name, size: (f as any)?.metadata?.size || (f as any)?.size, path: `course-notes/${f.name}` }))
        const withUrls = await buildUrls(mappedRoot)
        setNotes(withUrls)
      }
    } catch (e) {
      console.error("Failed to load course notes:", e)
      setNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  // removed legacy bulk upload handler (replaced with modal-based create)

  const handleCreateNote = async () => {
    setNoteError(null)
    if (!noteName.trim()) {
      setNoteError("Please enter a file name")
      return
    }
    if (!noteFile) {
      setNoteError("Please choose a file")
      return
    }
    setUploadingNotes(true)
    try {
      const safeName = `${Date.now()}_${noteFile.name}`
      const path = `${notesPrefix}/${safeName}`
      const { error: uploadError } = await supabase.storage.from(NOTES_BUCKET).upload(path, noteFile, { upsert: false })
      if (uploadError) {
        setNoteError(uploadError.message || "Upload failed")
        return
      }
      try {
        await supabase.from("notes").insert({ course_id: course.id, file_url: path, name: noteName.trim() })
      } catch (_) {
        // Ignore if table missing; storage upload still succeeded
      }
      setShowNoteModal(false)
      setNoteName("")
      setNoteFile(null)
      await loadCourseNotes()
      addToast?.({ type: "success", title: "Uploaded", message: "Note uploaded successfully." })
    } finally {
      setUploadingNotes(false)
    }
  }

  const handleDeleteNote = async (path: string, id?: string) => {
    const { error } = await supabase.storage.from(NOTES_BUCKET).remove([path])
    if (error) {
      console.error("Delete note error:", error)
      addToast?.({ type: "error", title: "Error", message: "Failed to delete file." })
      return
    }
    if (id) {
      try {
        await supabase.from("notes").delete().eq("id", id)
      } catch (_) {
        // ignore
      }
    }
    addToast?.({ type: "success", title: "Deleted", message: "File removed." })
    await loadCourseNotes()
  }

  const handleDownloadNote = async (path: string) => {
    const { data: pub } = await supabase.storage.from(NOTES_BUCKET).getPublicUrl(path)
    if (pub?.publicUrl) {
      window.open(pub.publicUrl, "_blank")
      return
    }
    const { data: signed, error } = await supabase.storage.from(NOTES_BUCKET).createSignedUrl(path, 60 * 60)
    if (!error && signed?.signedUrl) {
      window.open(signed.signedUrl, "_blank")
    } else {
      addToast?.({ type: "error", title: "Error", message: "Unable to generate download link." })
    }
  }


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
      const { error: insertError } = await supabase.from("live_rooms").insert({
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
        .from("live_rooms")
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

  // Session identifiers in 100ms are not used; align our session_id with room_id

  function formatEnrollmentDate(value: unknown): string {
    if (!value) return "—";
    if (typeof value === "string") {
      // Handles 'YYYY-MM-DD' or ISO strings like 'YYYY-MM-DDTHH:mm:ss.sssZ'
      return value.length >= 10 ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
    }
    try {
      return new Date(value as any).toISOString().slice(0, 10);
    } catch {
      return "—";
    }
  }

  function formatRelativeFromNow(value: unknown): string {
    if (!value) return "—";
    const date = typeof value === "string" ? new Date(value) : new Date(value as any);
    if (isNaN(date.getTime())) return "—";
    const now = new Date();

    // Years precise by month/day
    let years = now.getFullYear() - date.getFullYear();
    const hasNotHadAnniversaryThisYear =
      now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
    if (hasNotHadAnniversaryThisYear) years -= 1;
    if (years >= 1) return `${years} year${years > 1 ? 's' : ''} ago`;

    // Months precise by calendar months
    const totalNowMonths = now.getFullYear() * 12 + now.getMonth();
    const totalThenMonths = date.getFullYear() * 12 + date.getMonth();
    let months = totalNowMonths - totalThenMonths;
    if (now.getDate() < date.getDate()) months -= 1;
    if (months >= 1) return `${months} month${months > 1 ? 's' : ''} ago`;

    // Days
    const ms = Date.now() - date.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days <= 0) return "today";
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  async function fetchUserAttendance(userId: string) {
    setLoadingUserAttendance((prev) => ({ ...prev, [userId]: true }))
    try {
      // Fetch attendance for this user
      const { data: attendance, error: attendanceError } = await supabase
        .from("students_attendance")
        .select("session_id, joined_at")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
      if (attendanceError) throw attendanceError

      let enriched = attendance || []

      // If some rows are missing room_id, try to resolve via room_sessions by session_id


      // Resolve room names from live_rooms using room_id
      const roomIds = Array.from(new Set(enriched.map((a) => a.session_id).filter(Boolean))) as string[]
      if (roomIds.length > 0) {
        const { data: rooms, error: roomsErr } = await supabase
          .from("live_rooms")
          .select("id, room_name")
          .in("id", roomIds)
        if (!roomsErr && rooms) {
          const nameById = new Map<string, string>()
          rooms.forEach((r) => nameById.set(r.id, r.room_name))
          enriched = enriched.map((a) => ({ ...a, room_name: nameById.get(a.session_id) }))
        }
      }

      setUserAttendanceMap((prev) => ({ ...prev, [userId]: enriched }))
    } catch (err) {
      console.error("Error fetching user attendance:", err)
      setUserAttendanceMap((prev) => ({ ...prev, [userId]: [] }))
    } finally {
      setLoadingUserAttendance((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleToggleUserDetails = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      return
    }
    setExpandedUserId(userId)
    if (!userAttendanceMap[userId]) {
      await fetchUserAttendance(userId)
    }
  }

  const handleJoinSession = async (session: any) => {
    setJoiningSession(session.id)
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

      console.log("🚀 [DEBUG] handleJoinSession called with session:", {
        sessionId: session.id,
        sessionRoomId: session.room_id,
        sessionData: session
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

      // Generate token for the host
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
      console.log("🚀 [DEBUG] Host token generated:", {
        hasToken: !!tokenData.token,
        tokenLength: tokenData.token?.length
      })

      // Persist the live_rooms.id synchronously to avoid state race
      hostLiveRoomIdRef.current = session.id
      hostHmsRoomIdRef.current = session.room_id
      setVideoToken(tokenData.token)
      setVideoUserName(authSession.user.id || "Host")
      // Track which live_rooms.id we're about to run as host
      setPendingRoomId(session.id)
      console.log("🚀 [DEBUG] pendingRoomId set to:", session.id)

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
              body: JSON.stringify({ room_id: session.room_id, role: "host", wait_for_active_session: true }),
            })
            const js = await res.json().catch(() => ({}))
            const fallbackSessionId = js?.session_id || js?.sessionInstanceId
            console.log("[DEBUG] Fallback token response:", { ok: res.ok, fallbackSessionId })
            const roomIdToUse = hostLiveRoomIdRef.current || session.id
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

      console.log("🚀 [DEBUG] Video session started successfully")
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
        .select("id, name, email")
        .in("id", userIds)

      if (usersError) throw usersError

      const enrichedAttendees = attendanceData.map((attendance) => {
        const user = users?.find((u) => u.id === attendance.user_id)
        return {
          ...attendance,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "N/A",

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

  const handleViewAttendanceDetailsForRoomSession = (liveRoom: any, roomSession: any) => {
    setSelectedSessionForAttendance({
      room_name: liveRoom.room_name,
      session_id: roomSession.session_id,
      created_at: roomSession.created_at,
    })
    fetchSessionAttendees(roomSession.session_id)
  }

  const handleCloseAttendanceDetails = () => {
    setSelectedSessionForAttendance(null)
    setSessionAttendees([])
  }

  const teacherEmail = course.teacherEmail || "teacher@example.com"
  const teacherName = course.instructor || "Dr. Jane Doe"
  const instructorAvatar =
    course.teacher_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}`

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
                  <div className="text-gray-700 font-medium text-sm">{teacherName}</div>
                  <div className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded-full">
                    {teacherEmail}
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
              count={sessionAttendees.length}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <TabButton
              tab="recordings"
              icon={<Video className="w-5 h-5" />}
              label="Recordings"
              count={recordings.length}
              color="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <TabButton
              tab="notes"
              icon={<FileText className="w-5 h-5" />}
              label="Notes"
              count={notes.length}
              color="bg-gradient-to-r from-slate-500 to-slate-700"
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
                        <React.Fragment key={student.id}>
                          <tr
                            key={`${student.id}-main`}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                          >
                            {/* Student Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">

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
                                {formatEnrollmentDate(student.enrolledAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatRelativeFromNow(student.enrolledAt)}
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
                                <button
                                  className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors"
                                  onClick={() => handleToggleUserDetails(student.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedUserId === student.id && (
                            <tr key={`${student.id}-details`} className="bg-gray-50/60">
                              <td colSpan={6} className="py-4 px-6">
                                <div className="space-y-3">
                                  <div className="text-sm font-semibold text-gray-900">Attendance</div>
                                  {loadingUserAttendance[student.id] ? (
                                    <div className="text-sm text-gray-500">Loading attendance...</div>
                                  ) : (userAttendanceMap[student.id] || []).length === 0 ? (
                                    <div className="text-sm text-gray-500">No attendance records for this student.</div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-white border-b border-gray-200">
                                          <tr>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Room</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Session</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>

                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(userAttendanceMap[student.id] || []).map((a, i) => (
                                            <tr key={i} className="border-b border-gray-200">
                                              <td className="py-2 px-3 text-gray-800">{a.room_name || '—'}</td>
                                              <td className="py-2 px-3 text-gray-800">{a.session_id || '—'}</td>
                                              <td className="py-2 px-3 text-gray-800">{formatEnrollmentDate(a.joined_at)}</td>

                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-60 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                            onClick={() => handleJoinSession(session)}
                            disabled={joiningSession === session.id}
                          >
                            {joiningSession === session.id ? (
                              <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Starting…
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Start
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
                        Session ID: {selectedSessionForAttendance.session_id}
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
                  {sessions.map((room) => {
                    const total = attendanceCounts[room.id] || 0
                    const attendancePercentage = enrolledUsers.length > 0 ? (total / enrolledUsers.length) * 100 : 0
                    const roomSessions = roomSessionsMap[room.id] || []
                    const isExpanded = expandedRoomId === room.id
                    return (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3" onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 cursor-pointer" >
                              {room.room_name}
                            </h3>
                            <p className="text-gray-600 font-medium text-sm">
                              {room.start_time
                                ? new Date(room.start_time).toLocaleDateString("en-US", {
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
                              {total} / {enrolledUsers.length}
                            </div>
                            <div className="text-sm font-semibold text-purple-600">
                              {enrolledUsers.length > 0 ? `${Math.round(attendancePercentage)}% attendance` : "N/A"}
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {roomSessions.length === 0 ? (
                              <div className="text-sm text-gray-500">No sessions created for this room yet.</div>
                            ) : (
                              roomSessions.map((rs) => {
                                const count = sessionAttendanceCounts[rs.session_id] || 0
                                const percent = enrolledUsers.length > 0 ? Math.round((count / enrolledUsers.length) * 100) : 0
                                return (
                                  <div key={rs.session_id} className="border border-gray-200 rounded-lg p-3 bg-white">
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm text-gray-700">
                                        <div className="font-semibold">Session: {rs.session_id}</div>
                                        <div className="text-xs text-gray-500">{new Date(rs.created_at).toLocaleString()} {rs.active ? '(active)' : ''}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-base font-bold text-gray-900">{count} / {enrolledUsers.length}</div>
                                        <div className="text-xs font-semibold text-purple-600">{percent}%</div>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mr-4">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" style={{ width: `${percent}%` }} />
                                      </div>
                                      <button
                                        onClick={() => handleViewAttendanceDetailsForRoomSession(room, rs)}
                                        className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors text-sm"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "recordings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Session Recordings</h2>
                  <p className="text-gray-600 text-sm">All recorded live sessions for this course</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => void syncAndLoadRecordings()}
                    disabled={loadingRecordings || sessions.length === 0}
                    className="bg-amber-50 hover:bg-amber-100 disabled:opacity-60 text-amber-700 px-3 py-2 rounded-lg text-xs font-semibold border border-amber-200"
                  >
                    {loadingRecordings ? "Syncing…" : "Sync recordings"}
                  </button>
                </div>
              </div>
              {loadingRecordings ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                </div>
              ) : recordings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No Recordings Available</h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                    Live sessions that have ended will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Session Name</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recordings.map((recording, index) => (
                        <tr
                          key={recording.id}
                          className={`hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                        >
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900">{recording.room_name || "Untitled Session"}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {new Date(recording.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {recording.url ? (
                                <>
                                  <a
                                    href={recording.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Play className="w-4 h-4" />
                                    Watch
                                  </a>
                                  <a
                                    href={recording.url}
                                    download
                                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </a>
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">Unavailable</span>
                              )}
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
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Main container for the notes section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Course Notes</h2>
                    <p className="text-gray-600 text-sm">Manage and upload notes for learners</p>
                  </div>
                </div>
              </div>

              {/* Section to display existing notes */}
              <div className="p-6">
                {loadingNotes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 italic">
                    No notes have been uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((f) => (
                      <div key={f.name} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{f.name}</div>
                            <div className="text-xs text-gray-500">{Math.round(((f.size || 0) / 1024) * 10) / 10} KB</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={f.url} // Assuming f.url exists
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => void handleDeleteNote(f.path, f.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section to add a new note (replaces the modal) */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Add New Note</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="text"
                    placeholder="Note Name"
                    value={noteName}
                    onChange={(e) => setNoteName(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <label htmlFor="file-upload" className="flex items-center justify-center bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="application/pdf,application/*,image/*"
                    onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={handleCreateNote}
                    disabled={uploadingNotes || !noteName || !noteFile}
                    className={`py-2 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${uploadingNotes ? 'bg-green-500' : 'bg-slate-600 hover:bg-slate-700'
                      }`}
                  >
                    {uploadingNotes ? "Saving..." : "Save Note"}
                  </button>
                </div>
                {noteFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: <span className="font-medium text-blue-600">{noteFile.name}</span></p>
                )}
                {noteError && (
                  <p className="mt-2 text-sm text-red-600">{noteError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Video Call Modal */}
      {videoToken && createPortal(
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
                    (hmsRoomId ? (sessions.find((s) => s.room_id === hmsRoomId)?.id ?? null) : null)
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
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default HostLiveSession