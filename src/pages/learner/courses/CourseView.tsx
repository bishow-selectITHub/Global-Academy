import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BarChart, CheckCircle, Play, FileText, Users, Award, BookOpen, Info, UserCheck, Video, Star, Calendar, Download, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotesByCourse } from '../../../store/notesSlice';
import type { AppDispatch } from '../../../store';
import { RootState } from '../../../store';


import { supabase } from '../../../lib/supabase';
import { HMSRoomProvider } from "@100mslive/react-sdk";
import HMSRoomKitHost from '../../../components/live/HMSRoomKitHost';

const GENERATE_TOKEN_ENDPOINT = "https://smqnaddacvwwuehxymbr.supabase.co/functions/v1/generate-hms-token";

// <CHANGE> Keep all existing interfaces and components unchanged
// Live session modal replaced by opening /live/join in new tab

const LearnerLiveSessions = ({ courseId }: { courseId: string }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinProps, setJoinProps] = useState<{ token: string; userName: string } | null>(null);
    // modal state removed

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('live_rooms')
                .select('*')
                .eq('course_id', courseId)
                .order('start_time', { ascending: false });
            setSessions(data || []);
            setLoading(false);
        };
        fetchSessions();
    }, [courseId]);

    const handleJoinSession = async (session: any) => {
        const sessionResponse = await supabase.auth.getSession();
        const accessToken = sessionResponse.data.session?.access_token;
        const user = sessionResponse.data.session?.user;

        if (!user || !accessToken) {
            alert('You must be logged in to join.');
            return;
        }

        try {
            let activeSessionId: string | null = null;
            try {
                const { data: activeRow } = await supabase
                    .from('room_sessions')
                    .select('session_id')
                    .eq('room_id', session.room_id)
                    .eq('active', true)
                    .maybeSingle();
                activeSessionId = activeRow?.session_id || null;
            } catch (_) {
                // ignore, will fallback below
            }

            const res = await fetch(GENERATE_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    user_id: user.id,
                    room_id: session.room_id,
                    role: 'guest',
                    wait_for_active_session: true,
                }),
            });
            const data = await res.json();
            console.log("🚀 [APP][HMS] learner token response:", { sessionId: data.session_id || data.sessionInstanceId, roomId: session.room_id })
            if (!res.ok) throw new Error(data.error || 'Failed to generate 100ms token');

            const realSessionId = activeSessionId || data.session_id || data.sessionInstanceId;
            if (realSessionId) {
                const { data: existing, error: fetchExistingError } = await supabase
                    .from('students_attendance')
                    .select('id')
                    .eq('session_id', realSessionId)
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (!existing && !fetchExistingError) {
                    const { error: attendanceError } = await supabase
                        .from('students_attendance')
                        .insert([
                            {
                                session_id: realSessionId,
                                room_id: session.id,
                                user_id: user.id,
                                joined_at: new Date().toISOString(),
                            }
                        ]);
                    if (attendanceError) {
                        console.error('Attendance insert error:', attendanceError);
                    }
                }
            }

            // Render 100ms SDK inline (same tab)
            setJoinProps({ token: data.token, userName: user.id });
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-slate-600">Loading live sessions...</span>
        </div>
    );

    // If joining, render HMS Room Prebuilt inline
    if (joinProps) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <HMSRoomKitHost
                    token={joinProps.token}
                    userName={joinProps.userName}
                    onRoomEnd={() => setJoinProps(null)}
                />
            </div>
        );
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
                        {sessions.map(session => (
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
                                        className="bg-purple-600 text-white  font-semibold px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Join Session
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Live join now opens in a new tab */}
            </div>
        </HMSRoomProvider>
    );
};

const CourseView = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    // <CHANGE> Changed from tabs to sections navigation
    const [activeSection, setActiveSection] = useState('info');
    const [courseQuiz, setCourseQuiz] = useState<any>(null);

    const courseSlice = useSelector((state: RootState) => state.courses || { data: [] });
    const enrollmentSlice = useSelector((state: RootState) => state.enrollments || { data: [] });
    const quizSlice = useSelector((state: RootState) => state.quizzes || { data: [] });

    const course = courseSlice.data.find((c: any) => c.id === id) as any;
    const enrollment = enrollmentSlice.data.find((e: any) => e.course?.id === id) as any;
    const quiz = quizSlice.data.find((q: any) => q.course_id === id) as any;

    const quizScore: any = enrollment?.quizScore;
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress || 0;
    const numericProgress = Number(progress) || 0;
    const userLessons = course?.lessons || [];

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!course?.id) return;
            const { data, error } = await supabase
                .from('quizes')
                .select('*')
                .eq('course_id', course.id)
                .maybeSingle();
            setCourseQuiz(data && !error ? data : null);
        };
        fetchQuiz();
    }, [course?.id]);

    // Prefetch notes for this course once
    const notesBucket = useSelector((state: RootState) => state.notes.byCourseId[id || '']);
    useEffect(() => {
        if (isEnrolled && id && !notesBucket?.loaded && !notesBucket?.loading) {
            dispatch(fetchNotesByCourse(id));
        }
    }, [dispatch, isEnrolled, id, notesBucket?.loaded, notesBucket?.loading]);

    const getNoteDisplayName = (note: { name?: string; file_url: string }) => {
        const raw = (note.name || note.file_url).split('/').pop() || '';
        const decoded = decodeURIComponent(raw);
        // Strip leading timestamp prefixes like 1755077363614_*
        return decoded.replace(/^\d+_/, '');
    };

    const handleEnroll = (courseId: string) => {
        console.log('[Enroll Debug] handleEnroll called with courseId:', courseId);
        if (!courseId) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Invalid course ID. Cannot enroll.',
                duration: 3000,
            });
            return;
        }
        addToast({
            type: 'info',
            title: 'Redirecting',
            message: 'Navigating to enrollment page.',
            duration: 2000
        });
        navigate(`/enroll/${courseId}`);
    };

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
                <p className="text-slate-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
                <Link to="/courses">
                    <Button>Back to Course Catalog</Button>
                </Link>
            </div>
        );
    }

    // <CHANGE> New section navigation items
    const navigationItems = [
        { id: 'info', label: 'Course Info', icon: Info },
        { id: 'enroll', label: 'Enrollment', icon: UserCheck },
        { id: 'sessions', label: 'Live Sessions', icon: Video }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/*  Enhanced hero section with subtle professional styling */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold text-slate-900 mb-3">{course.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
                                <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg">
                                    <Clock size={18} className="mr-2 text-blue-600" />
                                    <span className="font-medium">{course.duration}</span>
                                </div>
                                <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg">
                                    <BarChart size={18} className="mr-2 text-green-600" />
                                    <span className="font-medium">{course.level}</span>
                                </div>
                                <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg">
                                    <Users size={18} className="mr-2 text-purple-600" />
                                    <span className="font-medium">{(course as any).enrolled || 0} enrolled</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-slate-900 flex items-center">
                                        <TrendingUp size={18} className="mr-2 text-blue-600" />
                                        Course Progress
                                    </span>
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                        {Math.round(numericProgress)}% complete
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                                        style={{ width: `${numericProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-80">
                            <div className="relative">
                                <img
                                    src={course.thumbnail || "/placeholder.svg"}
                                    alt={course.title}
                                    className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Enhanced section navigation with better styling */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex space-x-8">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex items-center space-x-2 py-4 px-3 border-b-3 font-semibold text-sm transition-all duration-200 ${activeSection === item.id
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Course Info Section */}
                {activeSection === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/*  Enhanced Course Description with better styling */}
                            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <BookOpen size={18} className="text-blue-600" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-slate-900">About This Course</h2>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed text-sm">{course.description}</p>
                                </CardContent>
                            </Card>

                            {/*  Enhanced Learning Objectives */}
                            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                                            <Target size={18} className="text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">What You'll Learn</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(course.objectives || []).map((objective: string, index: number) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-slate-700 text-sm">{objective}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/*  Enhanced Course Curriculum */}
                            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                                <FileText size={18} className="text-purple-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">Course Curriculum</h3>
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                            {userLessons.length} lessons • {course.duration}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {userLessons.map((lesson: any, index: number) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all duration-200"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    {lesson.completed ? (
                                                        <div className="bg-green-100 p-1.5 rounded-full">
                                                            <CheckCircle size={16} className="text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 text-base">{lesson.title}</h4>
                                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                                            {lesson.type === 'video' && <Play size={14} className="mr-2 text-blue-500" />}
                                                            {lesson.type === 'text' && <FileText size={14} className="mr-2 text-green-500" />}
                                                            {lesson.type === 'quiz' && <Award size={14} className="mr-2 text-yellow-500" />}
                                                            <span>{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isEnrolled && (
                                                    <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                                                        <Button size="sm" variant={lesson.completed ? "outline" : "primary"}>
                                                            {lesson.completed ? 'Review' : 'Start'}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/*  Enhanced Quiz Section */}
                            {quiz && (
                                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-amber-100 p-2 rounded-lg mr-3">
                                                    <Award size={18} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">Final Quiz</h3>
                                                    <p className="text-slate-600 mt-1 text-sm">Test your knowledge and earn your certificate</p>
                                                </div>
                                            </div>
                                            {isEnrolled ? (
                                                quizScore ? (
                                                    <Link to={`/courses/${id}/quiz`}>
                                                        <Button variant="outline">
                                                            View Results
                                                        </Button>
                                                    </Link>
                                                ) : progress === "100" ? (
                                                    <Link to={`/courses/${id}/quiz`}>
                                                        <Button>
                                                            Start Quiz
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button disabled>
                                                        Complete Course First
                                                    </Button>
                                                )
                                            ) : (
                                                <Button disabled>
                                                    Enroll to Access
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/*  Enhanced Instructor Info Sidebar */}
                        <div className="space-y-6">
                            <Card className="bg-white border border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                                        <div className="bg-indigo-100 p-2 rounded-lg mr-2">
                                            <Users size={16} className="text-indigo-600" />
                                        </div>
                                        Instructor
                                    </h3>
                                    <div className="text-center">
                                        <div className="relative inline-block mb-4">
                                            <img
                                                src={course.instructor_avatar || '/placeholder.svg?height=80&width=80&query=instructor'}
                                                alt={course.instructor}
                                                className="w-16 h-16 rounded-full mx-auto border-4 border-indigo-100 shadow"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                                        </div>
                                        <h4 className="font-semibold text-slate-900 text-base">{course.instructor}</h4>
                                        <p className="text-indigo-600 text-xs mb-3">{course.instructor_title}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*  Enhanced Course Resources */}
                            <Card className="bg-white border border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center text-base">
                                        <div className="bg-emerald-100 p-2 rounded-lg mr-2">
                                            <Download size={16} className="text-emerald-600" />
                                        </div>
                                        Course Resources
                                    </h3>
                                    {!isEnrolled ? (
                                        <div className="text-slate-600 text-sm">Enroll to access resources and notes.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notesBucket?.loading && (
                                                <div className="text-slate-500 text-sm">Loading resources...</div>
                                            )}
                                            {!notesBucket?.loading && (notesBucket?.data || []).length === 0 && (
                                                <div className="text-slate-500 text-sm">No resources available.</div>
                                            )}
                                            {(notesBucket?.data || []).map((note) => (
                                                <a
                                                    key={note.id}
                                                    href={note.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="bg-green-100 p-2 rounded-lg mr-2">
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 text-sm">{getNoteDisplayName(note)}</p>
                                                        <p className="text-xs text-slate-500 break-all">{note.file_url}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/*  Significantly enhanced Enrollment Section */}
                {activeSection === 'enroll' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-10">
                                    <div className="text-center">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 w-16 h-16 mx-auto mb-6 shadow-lg">
                                            <BookOpen size={32} className="text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                            {isEnrolled ? 'Continue Learning' : 'Enroll in Course'}
                                        </h2>
                                        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                                            {isEnrolled
                                                ? 'Pick up where you left off and continue your learning journey with expert guidance.'
                                                : 'Join thousands of learners and start your professional development journey today.'
                                            }
                                        </p>

                                        {progress !== "100" && (
                                            <div className="mb-8">
                                                {isEnrolled ? (
                                                    <Link to={`/courses/${course.id}/lessons/${userLessons[0]?.id || ''}`}>
                                                        <Button
                                                            size="lg"
                                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                            leftIcon={<Play size={24} />}
                                                        >
                                                            Continue Learning
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleEnroll(course.id)}
                                                        size="lg"
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                        leftIcon={<BookOpen size={24} />}
                                                    >
                                                        Enroll Now
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {progress === "100" && (
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                                                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                                                    <CheckCircle size={24} className="text-green-600" />
                                                </div>
                                                <p className="text-green-800 font-bold text-xl">Course Completed!</p>
                                                <p className="text-green-700 mt-2">Congratulations on finishing the course successfully.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-10">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                                        <div className="bg-slate-100 p-2 rounded-lg mr-3">
                                            <Info size={24} className="text-slate-600" />
                                        </div>
                                        Course Details
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                            <div className="bg-blue-100 p-2 rounded-lg mr-4">
                                                <Clock size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Duration</p>
                                                <p className="text-slate-600 font-medium">{course.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <BarChart size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Level</p>
                                                <p className="text-slate-600 font-medium">{course.level}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                            <div className="bg-amber-100 p-2 rounded-lg mr-4">
                                                <Award size={20} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Certificate</p>
                                                <p className="text-slate-600 font-medium">Upon completion</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                            <div className="bg-purple-100 p-2 rounded-lg mr-4">
                                                <FileText size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Lessons</p>
                                                <p className="text-slate-600 font-medium">{userLessons.length} lessons</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isEnrolled && quizScore && (
                                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                            <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                                                <TrendingUp size={20} className="mr-2" />
                                                Quiz Performance
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6 text-center">
                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                    <div className="text-2xl font-bold text-blue-600">{quizScore.percentage}%</div>
                                                    <div className="text-sm text-slate-600 font-medium">Score</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                    <div className="text-2xl font-bold text-green-600">{quizScore.correctQuestions}</div>
                                                    <div className="text-sm text-slate-600 font-medium">Correct</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/*  Significantly enhanced Live Sessions Section */}
                {activeSection === 'sessions' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-6 shadow-lg">
                                <Video size={32} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Live Sessions</h2>
                            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                                Join interactive live sessions with your instructor and fellow learners. Get real-time feedback and collaborate on projects.
                            </p>
                        </div>

                        {isEnrolled ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
                                <LearnerLiveSessions courseId={course.id} />
                            </div>
                        ) : (
                            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="bg-slate-200 rounded-full p-6 w-20 h-20 mx-auto mb-8">
                                        <Video size={32} className="text-slate-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Enroll to Access Live Sessions</h3>
                                    <p className="text-slate-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                                        Get access to interactive live sessions, Q&A with instructors, and real-time collaboration with other students.
                                    </p>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-center text-slate-600">
                                            <CheckCircle size={20} className="text-green-500 mr-3" />
                                            <span>Interactive live sessions</span>
                                        </div>
                                        <div className="flex items-center justify-center text-slate-600">
                                            <CheckCircle size={20} className="text-green-500 mr-3" />
                                            <span>Direct Q&A with instructors</span>
                                        </div>
                                        <div className="flex items-center justify-center text-slate-600">
                                            <CheckCircle size={20} className="text-green-500 mr-3" />
                                            <span>Collaborate with peers</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleEnroll(course.id)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                        leftIcon={<UserCheck size={24} />}
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
    );
};

export default CourseView;
