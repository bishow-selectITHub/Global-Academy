import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';
import { Video, Clock, BookOpen, Play, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import HMSRoomKitHost from '../../../components/live/HMSRoomKitHost';

interface LiveRoom {
    id: string;
    room_id: string;
    room_name: string;
    active: boolean;
    created_at: string;
    course_id?: string;
    course?: {
        title: string;
    };
}

interface GroupedRooms {
    [courseId: string]: {
        courseTitle: string;
        rooms: LiveRoom[];
    };
}

// API Constants
const CREATE_ROOM_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/create-hms-room`
const GENERATE_TOKEN_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://smqnaddacvwwuehxymbr.supabase.co'}/functions/v1/generate-hms-token`

const AdminMeetings = () => {
    const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningSession, setJoiningSession] = useState<string | null>(null);
    const [videoToken, setVideoToken] = useState<string | null>(null);
    const [videoUserName, setVideoUserName] = useState<string>("");
    const [currentSessionData, setCurrentSessionData] = useState<{ roomId: string; sessionId: string } | null>(null);
    const { user } = useUser();
    const { addToast } = useToast();

    useEffect(() => {
        fetchLiveRooms();
    }, []);

    const fetchLiveRooms = async () => {
        try {
            setLoading(true);

            // Fetch all live rooms with course information
            const { data, error } = await supabase
                .from('live_rooms')
                .select(`
          *,
          course:course_id (
            title
          )
        `)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setLiveRooms(data || []);
        } catch (error: any) {
            console.error('Error fetching live rooms:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to fetch live rooms',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (session: LiveRoom) => {
        if (!user) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'You must be logged in to join a session',
                duration: 5000,
            });
            return;
        }

        setJoiningSession(session.id);
        try {
            console.log("🚀 [DEBUG] handleJoinSession called with session:", {
                sessionId: session.id,
                sessionRoomId: session.room_id,
                sessionData: session
            });

            const { data: { session: authSession } } = await supabase.auth.getSession();
            if (!authSession?.access_token) {
                throw new Error("You must be logged in to start a session.");
            }

            console.log("🚀 [DEBUG] User authenticated, starting session creation");

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
            });

            if (!createRoomRes.ok) {
                const errorData = await createRoomRes.json();
                throw new Error(errorData.error || "Failed to create HMS room");
            }

            const createRoomData = await createRoomRes.json();
            console.log("🚀 [DEBUG] HMS room created:", createRoomData);

            // Generate token for the admin
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
            });

            if (!tokenRes.ok) {
                const errorData = await tokenRes.json();
                throw new Error(errorData.error || "Failed to generate host token");
            }

            const tokenData = await tokenRes.json();
            console.log("🚀 [DEBUG] Admin token generated:", {
                hasToken: !!tokenData.token,
                tokenLength: tokenData.token?.length
            });

            // Set the video session data
            setVideoToken(tokenData.token);
            setVideoUserName(user.name || user.email || "Admin");
            setCurrentSessionData({
                roomId: session.room_id,
                sessionId: session.id
            });

            console.log("🚀 [DEBUG] Video session started successfully");
        } catch (error: any) {
            console.error("Failed to start session:", error);
            addToast({
                type: "error",
                title: "Error",
                message: error.message || "Failed to start session",
                duration: 5000,
            });
        } finally {
            setJoiningSession(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const created = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const groupRoomsByCourse = (): GroupedRooms => {
        const grouped: GroupedRooms = {};

        liveRooms.forEach(room => {
            const courseId = room.course_id || 'uncategorized';
            const courseTitle = room.course?.title || 'Uncategorized Course';

            if (!grouped[courseId]) {
                grouped[courseId] = {
                    courseTitle,
                    rooms: []
                };
            }

            grouped[courseId].rooms.push(room);
        });

        return grouped;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                                <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                                <div className="space-y-3">
                                    {[1, 2].map((j) => (
                                        <div key={j} className="h-20 bg-slate-200 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const groupedRooms = groupRoomsByCourse();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Live Meetings</h1>
                <p className="text-slate-600 mt-1">Monitor and join live sessions across all courses</p>
            </div>

            {Object.keys(groupedRooms).length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No live meetings
                    </h3>
                    <p className="text-slate-500">
                        There are currently no live sessions across any courses.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedRooms).map(([courseId, courseData], index) => {
                        // Generate different colors for each course header
                        const courseColors = [
                            'from-blue-500 to-indigo-600',
                            'from-purple-500 to-pink-600',
                            'from-emerald-500 to-teal-600',
                            'from-orange-500 to-red-600',
                            'from-cyan-500 to-blue-600',
                            'from-violet-500 to-purple-600'
                        ];
                        const courseColor = courseColors[index % courseColors.length];

                        return (
                            <div key={courseId} className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
                                {/* Course Header */}
                                <div className={`bg-gradient-to-r ${courseColor} p-6`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg mr-4">
                                                <BookOpen className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    {courseData.courseTitle}
                                                </h2>
                                                <p className="text-white/80">
                                                    {courseData.rooms.length} room{courseData.rooms.length !== 1 ? 's' : ''} • {courseData.rooms.filter(r => r.active).length} active
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">
                                                {courseData.rooms.filter(r => r.active).length}
                                            </div>
                                            <div className="text-white/80 text-sm">Active Sessions</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rooms Grid */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {courseData.rooms.map((room, roomIndex) => {
                                            // Generate different colors for room cards
                                            const roomColors = [
                                                'from-emerald-50 to-green-50 border-emerald-200',
                                                'from-blue-50 to-cyan-50 border-blue-200',
                                                'from-purple-50 to-violet-50 border-purple-200',
                                                'from-orange-50 to-amber-50 border-orange-200',
                                                'from-pink-50 to-rose-50 border-pink-200',
                                                'from-teal-50 to-emerald-50 border-teal-200'
                                            ];
                                            const roomColor = room.active ? roomColors[roomIndex % roomColors.length] : 'from-slate-50 to-gray-50 border-slate-200';

                                            return (
                                                <div
                                                    key={room.id}
                                                    className={`bg-gradient-to-br ${roomColor} border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:scale-105`}
                                                >
                                                    {/* Room Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center">
                                                            <div className={`p-2 rounded-lg mr-3 ${room.active
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg'
                                                                    : 'bg-gradient-to-r from-slate-400 to-gray-500'
                                                                }`}>
                                                                <Video className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-slate-900 text-sm">
                                                                    {room.room_name}
                                                                </h3>
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.active
                                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                                                                        : 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                                                                    }`}>
                                                                    {room.active ? '● LIVE' : '● ENDED'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Room Details */}
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center text-xs text-slate-600">
                                                            <div className="p-1 bg-gradient-to-r from-blue-400 to-cyan-500 rounded mr-2">
                                                                <Calendar className="h-3 w-3 text-white" />
                                                            </div>
                                                            <span>{getTimeAgo(room.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-slate-600">
                                                            <div className="p-1 bg-gradient-to-r from-purple-400 to-violet-500 rounded mr-2">
                                                                <Clock className="h-3 w-3 text-white" />
                                                            </div>
                                                            <span>{formatDate(room.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Join Button - Always visible */}
                                                    <Button
                                                        onClick={() => handleJoinSession(room)}
                                                        disabled={joiningSession === room.id}
                                                        className={`w-full text-sm font-medium py-2 transition-all duration-200 ${room.active
                                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                                            }`}
                                                    >
                                                        {joiningSession === room.id ? (
                                                            <div className="flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                                Starting...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center">
                                                                <Play className="h-3 w-3 mr-2" />
                                                                {room.active ? 'Join Meeting' : 'Start Session'}
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Video Call Modal */}
            {videoToken && createPortal(
                <div className="fixed inset-0 bg-black" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999 }}>
                    {/* Meeting popup container - full screen */}
                    <div className="w-full h-full bg-black relative">
                        <button
                            onClick={() => {
                                setVideoToken(null);
                                setVideoUserName("");
                                setCurrentSessionData(null);
                                setJoiningSession(null);
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
                            onRoomEnd={() => {
                                setVideoToken(null);
                                setVideoUserName("");
                                setCurrentSessionData(null);
                                setJoiningSession(null);
                            }}
                            onSessionStarted={(sessionId) => {
                                console.log("🚀 [DEBUG] Session started with ID:", sessionId);
                                setCurrentSessionData(prev => prev ? { ...prev, sessionId } : null);
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminMeetings;
