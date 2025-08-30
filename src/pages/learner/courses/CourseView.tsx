"use client"

import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
    Clock,
    BarChart,
    CheckCircle,
    Play,
    FileText,
    Users,
    Award,
    BookOpen,
    Info,
    UserCheck,
    Video,
    Calendar,
    Download,
    Target,
    TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "../../../components/ui/Card"
import Button from "../../../components/ui/Button"
import { useToast } from "../../../components/ui/Toaster"
import { useDispatch, useSelector } from "react-redux"
import { fetchNotesByCourse } from "../../../store/notesSlice"
import type { AppDispatch } from "../../../store"
import type { RootState } from "../../../store"
import { createPortal } from "react-dom"

import { supabase } from "../../../lib/supabase"
import { HMSRoomProvider } from "@100mslive/react-sdk"
import HMSRoomKitHost from "../../../components/live/HMSRoomKitHost"

const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || "https://smqnaddacvwwuehxymbr.supabase.co"}/functions/v1/generate-hms-token`

// Keep all existing interfaces and components unchanged
// Live session modal replaced by opening /live/join in new tab

const LearnerLiveSessions = ({ courseId }: { courseId: string }) => {
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [joinProps, setJoinProps] = useState<{ token: string; userName: string } | null>(null)
    const [joiningSession, setJoiningSession] = useState<string | null>(null)
    // modal state removed

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true)
            const { data } = await supabase
                .from("live_rooms")
                .select("*")
                .eq("course_id", courseId)
                .order("start_time", { ascending: false })
            setSessions(data || [])
            setLoading(false)
        }
        fetchSessions()
    }, [courseId])

    const handleJoinSession = async (session: any) => {
        setJoiningSession(session.id)
        try {
            console.log("🚀 [DEBUG] Starting to join session:", {
                sessionId: session.id,
                roomId: session.room_id,
                sessionName: session.room_name,
            })

            const sessionResponse = await supabase.auth.getSession()
            const accessToken = sessionResponse.data.session?.access_token
            const user = sessionResponse.data.session?.user

            if (!user || !accessToken) {
                throw new Error("You must be logged in to join.")
            }

            console.log("🚀 [DEBUG] User authenticated:", {
                userId: user.id,
                hasAccessToken: !!accessToken,
            })

            let activeSessionId: string | null = null
            try {
                const { data: activeRow } = await supabase
                    .from("room_sessions")
                    .select("session_id")
                    .eq("room_id", session.room_id)
                    .eq("active", true)
                    .maybeSingle()
                activeSessionId = activeRow?.session_id || null
                console.log("🚀 [DEBUG] Active session found:", activeSessionId)
            } catch (_) {
                console.log("🚀 [DEBUG] No active session found, will create new one")
                // ignore, will fallback below
            }

            console.log("🚀 [DEBUG] Calling token endpoint:", GENERATE_TOKEN_ENDPOINT)
            const res = await fetch(GENERATE_TOKEN_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    user_id: user.id,
                    room_id: session.room_id,
                    role: "guest",
                    wait_for_active_session: true,
                }),
            })

            console.log("🚀 [DEBUG] Token response status:", res.status)
            const data = await res.json()
            console.log("🚀 [DEBUG] Token response data:", data)

            if (!res.ok) throw new Error(data.error || "Failed to generate 100ms token")

            console.log("🚀 [DEBUG] Token generated successfully:", {
                hasToken: !!data.token,
                tokenLength: data.token?.length,
                sessionId: data.session_id || data.sessionInstanceId,
            })

            const realSessionId = activeSessionId || data.session_id || data.sessionInstanceId
            if (realSessionId) {
                const { data: existing, error: fetchExistingError } = await supabase
                    .from("students_attendance")
                    .select("id")
                    .eq("session_id", realSessionId)
                    .eq("user_id", user.id)
                    .maybeSingle()
                if (!existing && !fetchExistingError) {
                    const { error: attendanceError } = await supabase.from("students_attendance").insert([
                        {
                            session_id: realSessionId,
                            room_id: session.id,
                            user_id: user.id,
                            joined_at: new Date().toISOString(),
                        },
                    ])
                    if (attendanceError) {
                        console.error("Attendance insert error:", attendanceError)
                    }
                }
            }

            // Render 100ms SDK inline (same tab)
            console.log("🚀 [DEBUG] Setting join props:", {
                hasToken: !!data.token,
                userName: user.id,
            })
            setJoinProps({ token: data.token, userName: user.id })
        } catch (err: any) {
            console.error("Error joining session:", err)
            alert(err.message)
            setJoiningSession(null)
        }
    }

    if (loading)
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-slate-600">Loading live sessions...</span>
            </div>
        )

    // If joining, render HMS Room Prebuilt inline
    if (joinProps) {
        const modalContent = (
            <div
                className="fixed inset-0 bg-black"
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
                            setJoinProps(null)
                            setJoiningSession(null)
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
                        token={joinProps.token}
                        userName={joinProps.userName}
                        onRoomEnd={() => {
                            setJoinProps(null)
                            setJoiningSession(null)
                        }}
                    />
                </div>
            </div>
        )

        return createPortal(modalContent, document.body)
    }

    return (
        <HMSRoomProvider>
            <div className="space-y-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                        <Video size={48} className="mx-auto text-purple-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Live Sessions</h3>
                        <p className="text-slate-600">No live sessions are currently scheduled for this course.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{session.room_name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Calendar size={16} />
                                                <span className="text-purple-100">{new Date(session.start_time).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleJoinSession(session)}
                                        disabled={joiningSession === session.id}
                                        className="bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {joiningSession === session.id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Joining...
                                            </>
                                        ) : (
                                            "Join Session"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Live join now opens in a new tab */}
            </div>
        </HMSRoomProvider>
    )
}

const CourseView = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { addToast } = useToast()
    // Changed from tabs to sections navigation
    const [activeSection, setActiveSection] = useState("info")
    const [courseQuiz, setCourseQuiz] = useState<any>(null)

    const courseSlice = useSelector((state: RootState) => state.courses || { data: [] })
    const enrollmentSlice = useSelector((state: RootState) => state.enrollments || { data: [] })
    const quizSlice = useSelector((state: RootState) => state.quizzes || { data: [] })

    const course = courseSlice.data.find((c: any) => c.id === id) as any
    const enrollment = enrollmentSlice.data.find((e: any) => e.course?.id === id) as any
    const quiz = quizSlice.data.find((q: any) => q.course_id === id) as any

    const quizScore: any = enrollment?.quizScore
    const isEnrolled = !!enrollment
    const progress = enrollment?.progress || 0
    const numericProgress = Number(progress) || 0
    const userLessons = course?.lessons || []

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!course?.id) return
            const { data, error } = await supabase.from("quizes").select("*").eq("course_id", course.id).maybeSingle()
            setCourseQuiz(data && !error ? data : null)
        }
        fetchQuiz()
    }, [course?.id])

    // Prefetch notes for this course once
    const notesBucket = useSelector((state: RootState) => state.notes.byCourseId[id || ""])
    useEffect(() => {
        if (isEnrolled && id && !notesBucket?.loaded && !notesBucket?.loading) {
            dispatch(fetchNotesByCourse(id))
        }
    }, [dispatch, isEnrolled, id, notesBucket?.loaded, notesBucket?.loading])

    const getNoteDisplayName = (note: { name?: string; file_url: string }) => {
        const raw = (note.name || note.file_url).split("/").pop() || ""
        const decoded = decodeURIComponent(raw)
        // Strip leading timestamp prefixes like 1755077363614_*
        return decoded.replace(/^\d+_/, "")
    }

    const handleEnroll = (courseId: string) => {
        console.log("[Enroll Debug] handleEnroll called with courseId:", courseId)
        if (!courseId) {
            addToast({
                type: "error",
                title: "Error",
                message: "Invalid course ID. Cannot enroll.",
                duration: 3000,
            })
            return
        }
        addToast({
            type: "info",
            title: "Redirecting",
            message: "Navigating to enrollment page.",
            duration: 2000,
        })
        navigate(`/enroll/${courseId}`)
    }

    const handleResourceDownload = async (note: any) => {
        try {
            // Create a temporary anchor element to trigger download
            const link = document.createElement("a")
            link.href = note.file_url
            link.download = getNoteDisplayName(note) || "course-resource"
            link.target = "_blank"

            // Append to body, click, and remove
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            addToast({
                type: "success",
                title: "Download Started",
                message: "Resource download has started.",
                duration: 3000,
            })
        } catch (error) {
            console.error("Error downloading resource:", error)
            addToast({
                type: "error",
                title: "Download Failed",
                message: "Failed to download resource. Please try again.",
                duration: 5000,
            })
        }
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
                <p className="text-slate-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
                <Link to="/courses">
                    <Button>Back to Course Catalog</Button>
                </Link>
            </div>
        )
    }

    // New section navigation items
    const navigationItems = [
        { id: "info", label: "Course Info", icon: Info },
        { id: "enroll", label: "Enrollment", icon: UserCheck },
        { id: "sessions", label: "Live Sessions", icon: Video },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                    <Clock size={14} className="mr-1 text-blue-600" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                    <BarChart size={14} className="mr-1 text-green-600" />
                                    <span>{course.level}</span>
                                </div>
                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                    <Users size={14} className="mr-1 text-purple-600" />
                                    <span>{(course as any).enrolled || 0} enrolled</span>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900 flex items-center">
                                        <TrendingUp size={14} className="mr-1 text-blue-600" />
                                        Course Progress
                                    </span>
                                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                        {Math.round(numericProgress)}% complete
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${numericProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-64">
                            <img
                                src={course.thumbnail || "/placeholder.svg"}
                                alt={course.title}
                                className="w-full h-36 object-cover rounded-lg border border-gray-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <nav className="flex space-x-6">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex items-center space-x-2 py-3 px-2 border-b-2 text-sm font-medium transition-colors ${activeSection === item.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Course Info Section */}
                {activeSection === "info" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-5">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-100 p-1.5 rounded mr-2">
                                            <BookOpen size={16} className="text-blue-600" />
                                        </div>
                                        <h2 className="text-base font-semibold text-gray-900">About This Course</h2>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">{course.description}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-5">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-green-100 p-1.5 rounded mr-2">
                                            <Target size={16} className="text-green-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">What You'll Learn</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(course.objectives || []).map((objective: string, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-start space-x-2 p-2 bg-green-50 rounded border border-green-100"
                                            >
                                                <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm">{objective}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 p-1.5 rounded mr-2">
                                                <FileText size={16} className="text-purple-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900">Course Curriculum</h3>
                                        </div>
                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {userLessons.length} lessons • {course.duration}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {userLessons.map((lesson: any, index: number) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {lesson.completed ? (
                                                        <div className="bg-green-100 p-1 rounded-full">
                                                            <CheckCircle size={14} className="text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                            {lesson.type === "video" && <Play size={12} className="mr-1 text-blue-500" />}
                                                            {lesson.type === "text" && <FileText size={12} className="mr-1 text-green-500" />}
                                                            {lesson.type === "quiz" && <Award size={12} className="mr-1 text-yellow-500" />}
                                                            <span>{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isEnrolled && (
                                                    <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                                                        <Button size="sm" variant={lesson.completed ? "outline" : "primary"}>
                                                            {lesson.completed ? "Review" : "Start"}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {quiz && (
                                <Card className="bg-amber-50 border border-amber-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-amber-100 p-1.5 rounded mr-2">
                                                    <Award size={16} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900">Final Quiz</h3>
                                                    <p className="text-gray-600 mt-0.5 text-sm">Test your knowledge and earn your certificate</p>
                                                </div>
                                            </div>
                                            {isEnrolled ? (
                                                quizScore ? (
                                                    <Link to={`/courses/${id}/quiz`}>
                                                        <Button variant="outline" size="sm">
                                                            View Results
                                                        </Button>
                                                    </Link>
                                                ) : progress === "100" ? (
                                                    <Link to={`/courses/${id}/quiz`}>
                                                        <Button size="sm">Start Quiz</Button>
                                                    </Link>
                                                ) : (
                                                    <Button disabled size="sm">
                                                        Complete Course First
                                                    </Button>
                                                )
                                            ) : (
                                                <Button disabled size="sm">
                                                    Enroll to Access
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <div className="bg-indigo-100 p-1 rounded mr-2">
                                            <Users size={14} className="text-indigo-600" />
                                        </div>
                                        Instructor
                                    </h3>
                                    <div className="text-center">
                                        <img
                                            src={course.instructor_avatar || "/placeholder.svg?height=60&width=60&query=instructor"}
                                            alt={course.instructor}
                                            className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-indigo-100"
                                        />
                                        <h4 className="font-medium text-gray-900 text-sm">{course.instructor}</h4>
                                        <p className="text-indigo-600 text-xs">{course.instructor_title}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                                        <div className="bg-emerald-100 p-1 rounded mr-2">
                                            <Download size={14} className="text-emerald-600" />
                                        </div>
                                        Course Resources
                                    </h3>
                                    {!isEnrolled ? (
                                        <div className="text-gray-600 text-xs">Enroll to access resources and notes.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {notesBucket?.loading && <div className="text-gray-500 text-xs">Loading resources...</div>}
                                            {!notesBucket?.loading && (notesBucket?.data || []).length === 0 && (
                                                <div className="text-gray-500 text-xs">No resources available.</div>
                                            )}
                                            {(notesBucket?.data || []).map((note) => (
                                                <button
                                                    key={note.id}
                                                    onClick={() => handleResourceDownload(note)}
                                                    className="flex items-center w-full p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors text-left"
                                                >
                                                    <div className="bg-green-100 p-1 rounded mr-2">
                                                        <FileText className="h-3 w-3 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-xs truncate">{getNoteDisplayName(note)}</p>
                                                    </div>
                                                    <div className="bg-blue-100 p-1 rounded">
                                                        <Download className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeSection === "enroll" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-blue-50 border border-blue-200">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <div className="bg-blue-600 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                                            <BookOpen size={24} className="text-white" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                            {isEnrolled ? "Continue Learning" : "Enroll in Course"}
                                        </h2>
                                        <p className="text-gray-600 mb-6 text-sm">
                                            {isEnrolled
                                                ? "Pick up where you left off and continue your learning journey."
                                                : "Join thousands of learners and start your professional development journey."}
                                        </p>

                                        {progress !== "100" && (
                                            <div className="mb-6">
                                                {isEnrolled ? (
                                                    <Link to={`/courses/${course.id}/lessons/${userLessons[0]?.id || ""}`}>
                                                        <Button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
                                                            leftIcon={<Play size={16} />}
                                                        >
                                                            Continue Learning
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleEnroll(course.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-medium"
                                                        leftIcon={<BookOpen size={16} />}
                                                    >
                                                        Enroll Now
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {progress === "100" && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                                <div className="bg-green-100 rounded-full p-2 w-8 h-8 mx-auto mb-2">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                </div>
                                                <p className="text-green-800 font-semibold text-sm">Course Completed!</p>
                                                <p className="text-green-700 text-xs mt-1">Congratulations on finishing the course.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="bg-gray-100 p-1.5 rounded mr-2">
                                            <Info size={16} className="text-gray-600" />
                                        </div>
                                        Course Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center p-3 bg-gray-50 rounded">
                                            <div className="bg-blue-100 p-1.5 rounded mr-3">
                                                <Clock size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Duration</p>
                                                <p className="text-gray-600 text-xs">{course.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-gray-50 rounded">
                                            <div className="bg-green-100 p-1.5 rounded mr-3">
                                                <BarChart size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Level</p>
                                                <p className="text-gray-600 text-xs">{course.level}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-gray-50 rounded">
                                            <div className="bg-amber-100 p-1.5 rounded mr-3">
                                                <Award size={16} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Certificate</p>
                                                <p className="text-gray-600 text-xs">Upon completion</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-gray-50 rounded">
                                            <div className="bg-purple-100 p-1.5 rounded mr-3">
                                                <FileText size={16} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Lessons</p>
                                                <p className="text-gray-600 text-xs">{userLessons.length} lessons</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isEnrolled && quizScore && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-3 flex items-center text-sm">
                                                <TrendingUp size={14} className="mr-1" />
                                                Quiz Performance
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3 text-center">
                                                <div className="bg-white p-3 rounded shadow-sm">
                                                    <div className="text-lg font-semibold text-blue-600">{quizScore.percentage}%</div>
                                                    <div className="text-xs text-gray-600">Score</div>
                                                </div>
                                                <div className="bg-white p-3 rounded shadow-sm">
                                                    <div className="text-lg font-semibold text-green-600">{quizScore.correctQuestions}</div>
                                                    <div className="text-xs text-gray-600">Correct</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeSection === "sessions" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="bg-indigo-600 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                                <Video size={24} className="text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Live Sessions</h2>
                            <p className="text-gray-600 text-sm max-w-lg mx-auto">
                                Join interactive live sessions with your instructor and fellow learners.
                            </p>
                        </div>

                        {isEnrolled ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <LearnerLiveSessions courseId={course.id} />
                            </div>
                        ) : (
                            <Card className="bg-gray-50 border border-gray-200">
                                <CardContent className="p-8 text-center">
                                    <div className="bg-gray-200 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                                        <Video size={24} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">Enroll to Access Live Sessions</h3>
                                    <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                                        Get access to interactive live sessions and Q&A with instructors.
                                    </p>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center justify-center text-gray-600 text-sm">
                                            <CheckCircle size={16} className="text-green-500 mr-2" />
                                            <span>Interactive live sessions</span>
                                        </div>
                                        <div className="flex items-center justify-center text-gray-600 text-sm">
                                            <CheckCircle size={16} className="text-green-500 mr-2" />
                                            <span>Direct Q&A with instructors</span>
                                        </div>
                                        <div className="flex items-center justify-center text-gray-600 text-sm">
                                            <CheckCircle size={16} className="text-green-500 mr-2" />
                                            <span>Collaborate with peers</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleEnroll(course.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
                                        leftIcon={<UserCheck size={16} />}
                                    >
                                        Enroll Now
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseView
