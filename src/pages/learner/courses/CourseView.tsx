import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Clock,
    BarChart,
    CheckCircle,
    Lock,
    Play,
    FileText,
    Users,
    Award,
    BookOpen,
    HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

import { supabase } from '../../../lib/supabase';
import { HMSRoomProvider } from "@100mslive/react-sdk";
import { HMSPrebuilt } from "@100mslive/roomkit-react";

const GENERATE_TOKEN_ENDPOINT = "https://smqnaddacvwwuehxymbr.supabase.co/functions/v1/generate-hms-token";

// Add type for LiveSessionModal props
interface LiveSessionModalProps {
    open: boolean;
    onClose: () => void;
    token: string | null;
    userId: string;
    roomId: string;
}

const LiveSessionModal = ({ open, onClose, token, userId, roomId }: LiveSessionModalProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="w-full h-full relative">

                {token ? (
                    <HMSPrebuilt authToken={token} userName={userId} />
                ) : (
                    <div className="flex items-center justify-center h-full text-white text-lg">Joining live session...</div>
                )}
            </div>
        </div>
    );
};

const LearnerLiveSessions = ({ courseId }: { courseId: string }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinModal, setJoinModal] = useState<{ open: boolean, token: string | null, userId: string, roomId: string } | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('live_sessions')
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
                }),
            });
            const data = await res.json();
            console.log(data.sessionInstanceId)
            if (!res.ok) throw new Error(data.error || 'Failed to generate 100ms token');

            // Insert attendance record
            const { error: attendanceError } = await supabase
                .from('students_attendance')
                .insert([
                    {
                        session_id: session.id, // using session.id as session_id
                        user_id: user.id,
                        joined_at: new Date().toISOString(),
                    }
                ]);
            if (attendanceError) {
                console.error('Attendance insert error:', attendanceError);
                // Optionally show a toast or alert
            }

            setJoinModal({ open: true, token: data.token, userId: user.id, roomId: session.room_id });
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div>Loading live sessions...</div>;

    return (
        <HMSRoomProvider>
            <div>
                <h3 className="text-lg font-semibold mb-4">Live Sessions</h3>
                {sessions.length === 0 ? (
                    <div className="text-slate-500">No live sessions scheduled for this course.</div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between bg-white rounded-lg shadow p-4 border border-slate-200"
                            >
                                <div>
                                    <div className="font-semibold text-slate-800">{session.room_name}</div>
                                    <div className="text-sm text-slate-500">{new Date(session.start_time).toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={() => handleJoinSession(session)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                >
                                    Join Live Session
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {joinModal && joinModal.open && (
                    <LiveSessionModal
                        open={joinModal.open}
                        onClose={() => setJoinModal(null)}
                        token={joinModal.token}
                        userId={joinModal.userId}
                        roomId={joinModal.roomId}
                    />
                )}
            </div>
        </HMSRoomProvider>
    );
};

const CourseView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [courseQuiz, setCourseQuiz] = useState<any>(null);

    // Defensive checks for slices
    const courseSlice = useSelector((state: RootState) => state.courses || { data: [] });
    const enrollmentSlice = useSelector((state: RootState) => state.enrollments || { data: [] });
    const quizSlice = useSelector((state: RootState) => state.quizzes || { data: [] });

    const course = courseSlice.data.find((c: any) => c.id === id);
    console.log(course);
    const enrollment = enrollmentSlice.data.find((e: any) => e.course?.id === id);
    console.log(enrollment)
    const quiz = quizSlice.data.find((q: any) => q.course_id === id);

    const quizScore = enrollment?.quizScore;
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress || 0;
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

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
                    <div className="flex items-center text-sm text-slate-600 mt-1">
                        <span className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {course.duration}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                            <BarChart size={16} className="mr-1" />
                            {course.level}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                            <Users size={16} className="mr-1" />
                            {course.enrolled} enrolled
                        </span>
                    </div>
                </div>
                <div className="flex items-center">
                    {
                        progress !== "100" && <> {isEnrolled ? (
                            <Link to={`/courses/${course.id}/lessons/${userLessons[0]?.id || ''}`}>
                                <Button leftIcon={<Play size={20} />}>Continue Learning</Button>
                            </Link>
                        ) : (
                            <Button onClick={() => handleEnroll(course.id)} leftIcon={<BookOpen size={20} />}>
                                Enroll Course
                            </Button>
                        )}</>
                    }

                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden mb-6">
                        <div className="aspect-video bg-slate-200 relative">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                <button className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg hover:bg-opacity-100 transition">
                                    <Play size={24} className="text-blue-700" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Tabs */}
                            <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                                <div className="flex space-x-8">
                                    <button
                                        className={`pb-4 text-sm font-medium border-b-2 ${activeTab === 'overview'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        className={`pb-4 text-sm font-medium border-b-2 ${activeTab === 'curriculum'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        onClick={() => setActiveTab('curriculum')}
                                    >
                                        Curriculum
                                    </button>
                                    <button
                                        className={`pb-4 text-sm font-medium border-b-2 ${activeTab === 'resources'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        onClick={() => setActiveTab('resources')}
                                    >
                                        Resources
                                    </button>
                                </div>
                            </div>

                            {/* Tab content */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">About This Course</h2>
                                        <p className="text-slate-700 dark:text-slate-300">{course.description}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">What You'll Learn</h3>
                                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                                            {course.objectives.map((objective: string, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                                    <span>{objective}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Instructor</h3>
                                        <div className="flex items-center">
                                            <img
                                                src={course.instructor_avatar || '/path-to-default-avatar.png'}
                                                alt={course.instructor}
                                                className="h-16 w-16 rounded-full mr-4"
                                            />
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{course.instructor}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructorTitle}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {quiz && (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Final Quiz</h3>
                                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center mb-2">
                                                        <Award size={20} className="text-amber-500 mr-2" />
                                                        <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{quiz.title}</h4>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        Complete the course to unlock the final quiz and earn your certificate.
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {isEnrolled ? (
                                                        quizScore ? (
                                                            <Link to={`/courses/${id}/quiz`}>
                                                                <Button variant="outline">View Quiz</Button>
                                                            </Link>
                                                        ) : progress === "100" ? (
                                                            <Link to={`/courses/${id}/quiz`}>
                                                                <Button variant="primary">Start Quiz</Button>
                                                            </Link>
                                                        ) : (
                                                            <Button variant="primary" disabled title="Complete all lessons to unlock the quiz">
                                                                Start Quiz
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <Button variant="primary" disabled title="Enroll in the course to take the quiz">
                                                            Start Quiz
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {isEnrolled && progress !== 100 && !quizScore && (
                                                <p className="text-sm text-slate-500 mt-3">
                                                    Your current progress is {progress}%. Complete all lessons to take the quiz.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'curriculum' && (
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Course Content</h2>

                                    <div className="mb-4 flex justify-between items-center">
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-medium">{userLessons.length} lessons</span>
                                            <span className="mx-2">•</span>
                                            <span>{course.duration} total</span>
                                        </div>

                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                            Expand All
                                        </button>
                                    </div>

                                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 dark:border-slate-700 dark:divide-slate-700">
                                        {userLessons.map((lesson: any, index: number) => (
                                            <Link
                                                key={lesson.id}
                                                to={`/courses/${course.id}/lessons/${lesson.id}`}
                                                className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {lesson.completed ? (
                                                            <CheckCircle size={18} className="text-green-500 mr-3" />
                                                        ) : (
                                                            <div className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 mr-3">
                                                                <span className="text-xs text-slate-600 dark:text-slate-400">{index + 1}</span>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="font-medium text-slate-800 dark:text-slate-200">{lesson.title}</h4>
                                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                {lesson.type === 'video' && <Play size={12} className="mr-1" />}
                                                                {lesson.type === 'text' && <FileText size={12} className="mr-1" />}
                                                                {lesson.type === 'quiz' && <Award size={12} className="mr-1" />}
                                                                <span>{lesson.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button size="sm" variant={lesson.completed ? "outline" : "primary"}>
                                                        {lesson.completed ? 'Review' : 'Start'}
                                                    </Button>
                                                </div>
                                                {!lesson.completed && index > 0 && !userLessons[index - 1].completed && (
                                                    <Lock size={14} className="ml-auto text-slate-400 flex-shrink-0" />
                                                )}
                                            </Link>
                                        ))}
                                        {quiz && (
                                            <div
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                                            >
                                                <div className="flex items-center">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mr-4">
                                                        <HelpCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{quiz.title}</h4>
                                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                            <Clock size={14} className="mr-1" />
                                                            <span>{quiz.timeLimit} minutes</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isEnrolled ? (
                                                    quizScore ? (
                                                        <Link to={`/courses/${id}/quiz`}>
                                                            <Button variant="outline">View Quiz</Button>
                                                        </Link>
                                                    ) : progress === "100" ? (
                                                        <Link to={`/courses/${id}/quiz`}>
                                                            <Button variant="primary">Start Quiz</Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="primary" disabled title="Complete all lessons to unlock the quiz">
                                                            Start Quiz
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button variant="primary" disabled title="Enroll in the course to take the quiz">
                                                        Start Quiz
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Course Resources</h2>

                                    <div className="space-y-3">
                                        <a
                                            href="#"
                                            className="flex items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-700"
                                        >
                                            <FileText className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-400" />
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">Employee Handbook.pdf</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2.4 MB • PDF Document</p>
                                            </div>
                                        </a>

                                        <a
                                            href="#"
                                            className="flex items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-700"
                                        >
                                            <FileText className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-400" />
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">Company Structure Chart.pdf</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1.8 MB • PDF Document</p>
                                            </div>
                                        </a>

                                        <a
                                            href="#"
                                            className="flex items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-700"
                                        >
                                            <FileText className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-400" />
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">IT Security Guidelines.pdf</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3.2 MB • PDF Document</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {isEnrolled && (
                        <LearnerLiveSessions courseId={course.id} />
                    )}
                </div>

                <div className="md:col-span-1">
                    <Card className="sticky top-6">
                        <CardContent className="p-6">
                            <Button
                                onClick={() => isEnrolled ? navigate(`/courses/${course.id}/lessons/${userLessons?.[0]?.id || ''}`) : handleEnroll(course.id)}
                                leftIcon={isEnrolled ? <Play size={18} /> : <BookOpen size={18} />}
                                fullWidth
                                disabled={isEnrolled && progress === "100"}
                                className={isEnrolled && progress === "100" ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' : ''}
                            >
                                {isEnrolled
                                    ? progress === "100"
                                        ? 'Completed'
                                        : progress > 0
                                            ? 'Continue Course'
                                            : 'Start Course'
                                    : 'Enroll Now'}
                            </Button>

                            <div className="space-y-4 mt-6">
                                <div className="flex items-center">
                                    <Clock size={20} className="text-slate-500 dark:text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Duration</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{course.duration}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <BarChart size={20} className="text-slate-500 dark:text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Level</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{course.level}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Award size={20} className="text-slate-500 dark:text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Certificate</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Upon completion</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <FileText size={20} className="text-slate-500 dark:text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Resources</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">3 downloadable resources</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <BookOpen size={20} className="text-slate-500 dark:text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Lessons</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{userLessons.length} lessons</p>
                                    </div>
                                </div>
                            </div>

                            {isEnrolled && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Course Progress</h3>
                                    <div className="mb-2 flex justify-between items-center">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {Math.round(progress)}% complete
                                        </span>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            {Math.round(Number(progress) / 100 * userLessons.length)} of {userLessons.length} lessons
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-4 dark:bg-slate-700">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full dark:bg-blue-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>

                                    {quizScore && (
                                        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl shadow flex flex-col items-center">
                                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <Award size={20} className="text-amber-500" /> Quiz Score
                                            </h4>
                                            <div className="flex flex-col items-center w-full">
                                                {/* Progress Circle for Percentage */}
                                                <div className="relative flex items-center justify-center mb-3">
                                                    <svg width="64" height="64" viewBox="0 0 64 64">
                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="#dbeafe" strokeWidth="8" />
                                                        <circle
                                                            cx="32"
                                                            cy="32"
                                                            r="28"
                                                            fill="none"
                                                            stroke="#2563eb"
                                                            strokeWidth="8"
                                                            strokeDasharray={2 * Math.PI * 28}
                                                            strokeDashoffset={2 * Math.PI * 28 * (1 - quizScore.percentage / 100)}
                                                            strokeLinecap="round"
                                                            style={{ transition: 'stroke-dashoffset 0.6s' }}
                                                        />
                                                        <text x="32" y="38" textAnchor="middle" fontSize="1.3em" fill="#2563eb" fontWeight="bold">
                                                            {quizScore.percentage}%
                                                        </text>
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col gap-2 w-full mt-2">
                                                    <div className="flex items-center gap-2 text-blue-800 text-base">
                                                        <CheckCircle size={18} className="text-green-500" />
                                                        <span>Correct Questions:</span>
                                                        <span className="font-bold text-green-700">{quizScore.correctQuestions}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-800 text-base">
                                                        <BarChart size={18} className="text-blue-500" />
                                                        <span>Percentage:</span>
                                                        <span className="font-bold text-blue-700">{quizScore.percentage}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-800 text-base">
                                                        <Award size={18} className="text-amber-500" />
                                                        <span>Points:</span>
                                                        <span className="font-bold text-amber-600">{quizScore.points}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {courseQuiz && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-center">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Available Quiz</h3>
                                    <p className="mb-3 text-blue-800">{courseQuiz.title || 'Quiz'}</p>
                                    <Link to={''}>
                                        <Button variant="primary">Take Quiz</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseView;