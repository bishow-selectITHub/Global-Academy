import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ui/Toaster';

interface HostLiveSessionProps {
  course: any;
  onBack: () => void;
}

// Mock data for enrolled users and feedback
const mockEnrolledUsers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', progress: 80 },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', progress: 55 },
  { id: '3', name: 'Charlie Lee', email: 'charlie@example.com', progress: 100 },
];
const mockFeedback = [
  { id: 'f1', user: 'Alice Johnson', comment: 'Great course!', date: '2024-06-01' },
  { id: 'f2', user: 'Bob Smith', comment: 'Loved the live session.', date: '2024-06-02' },
  { id: 'f3', user: 'Charlie Lee', comment: 'Could use more examples.', date: '2024-06-03' },
];

const HostLiveSession: React.FC<HostLiveSessionProps> = ({ course, onBack }) => {
  const [form, setForm] = useState({
    roomName: '',
    startDate: '',
    maxParticipants: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const { addToast } = useToast();

  // Fetch live sessions for this course
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', course.id)
        .order('start_time', { ascending: false });
      if (error) {
        addToast && addToast({ type: 'error', title: 'Error', message: 'Could not fetch live sessions.' });
      } else {
        setSessions(data || []);
      }
      setLoadingSessions(false);
    };
    fetchSessions();
  }, [course.id, addToast]);

  // Fetch enrolled users for this course
  useEffect(() => {
    const fetchEnrolled = async () => {
      setLoadingEnrolled(true);
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('user_id, user:users(id, name, email, avatar)')
        .eq('course_id', course.id);
      if (error) {
        console.error(error);
        addToast && addToast({ type: 'error', title: 'Error', message: 'Could not fetch enrolled users.' });
        setEnrolledUsers([]);
      } else {
        setEnrolledUsers(data || []);
      }
      setLoadingEnrolled(false);
    };
    fetchEnrolled();
  }, [course.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // 1. Call backend to create a 100ms room
    const roomRes = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: form.roomName,
        description: form.description,
      }),
    });
    let roomData;
    try {
      roomData = await roomRes.json();
    } catch {
      roomData = { message: 'No response from server' };
    }
    if (!roomRes.ok) {
      addToast && addToast({ type: 'error', title: 'Error', message: roomData.message || 'Could not create room.' });
      setSubmitting(false);
      return;
    }
    const realRoomId = roomData.id; // 100ms returns the room id as 'id'
    // 2. Save to Supabase
    const { error } = await supabase.from('live_sessions').insert({
      course_id: course.id,
      room_id: realRoomId,
      room_name: form.roomName,
      start_time: form.startDate,
      max_participants: form.maxParticipants,
      description: form.description,
      status: 'scheduled',
    });
    setSubmitting(false);
    if (error) {
      addToast && addToast({ type: 'error', title: 'Error', message: 'Could not schedule live session.' });
    } else {
      addToast && addToast({ type: 'success', title: 'Live session scheduled', message: 'Room created successfully.' });
      setForm({ roomName: '', startDate: '', maxParticipants: '', description: '' });
      // Refresh session list
      const { data } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', course.id)
        .order('start_time', { ascending: false });
      setSessions(data || []);
    }
  };

  const handleCopy = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    addToast && addToast({ type: 'info', title: 'Copied', message: 'Room ID copied to clipboard.' });
  };

  // Mock instructor details (replace with real user lookup if available)
  const instructor = course.instructor || 'Dr. Jane Doe';
  const instructorTitle = course.instructor_title || 'Lead Instructor';
  const instructorAvatar = course.instructor_avatar || 'https://ui-avatars.com/api/?name=Jane+Doe';

  return (
    <div className="max-w-6xl mx-auto mt-12 bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <button
          className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
          onClick={onBack}
        >
          ← Back to Courses
        </button>
        {/* Course Info */}
        <div className="flex items-center gap-4 mb-8">
          <img src={instructorAvatar} alt="Instructor" className="w-16 h-16 rounded-full object-cover border" />
          <div>
            <div className="text-2xl font-bold text-blue-700 mb-1">{course.title}</div>
            <div className="text-gray-700 font-semibold">{instructor}</div>
            <div className="text-gray-500 text-sm">{instructorTitle}</div>
          </div>
        </div>
        {/* Enrolled Users */}
        <div className="mb-8">
          <div className="font-semibold text-lg mb-2">Enrolled Users</div>
          <div className="overflow-x-auto">
            {loadingEnrolled ? (
              <div className="text-gray-500">Loading enrolled users...</div>
            ) : (
              <table className="min-w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Profile</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledUsers.map((enroll, idx) => (
                    <tr key={enroll.user?.id || idx} className="border-t">
                      <td className="px-4 py-2">
                        {enroll.user?.avatar ? (
                          <img src={enroll.user.avatar} alt={enroll.user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?</div>
                        )}
                      </td>
                      <td className="px-4 py-2">{enroll.user?.name || '-'}</td>
                      <td className="px-4 py-2">{enroll.user?.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Feedback/Comments */}
        <div>
          <div className="font-semibold text-lg mb-2">Feedback & Comments</div>
          <div className="space-y-3">
            {mockFeedback.map(fb => (
              <div key={fb.id} className="border rounded p-3 bg-gray-50">
                <div className="font-semibold text-blue-800">{fb.user}</div>
                <div className="text-gray-700">{fb.comment}</div>
                <div className="text-xs text-gray-500 mt-1">{fb.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Sidebar: Schedule & Sessions */}
      <div className="w-full md:w-96 flex-shrink-0">
        <div className="mb-8 p-4 bg-blue-50 rounded">
          <div className="font-semibold text-lg mb-2">Schedule a Live Session</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Name</label>
              <input
                type="text"
                name="roomName"
                value={form.roomName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold mt-2"
              disabled={submitting}
            >
              {submitting ? 'Scheduling...' : 'Schedule Live Session'}
            </button>
          </form>
        </div>
        <div>
          <div className="font-semibold text-lg mb-2">Scheduled Live Sessions</div>
          {loadingSessions ? (
            <div className="text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400">No live sessions scheduled for this course.</div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="border rounded p-4 bg-gray-50">
                  <div className="font-semibold text-blue-800 text-lg">{session.room_name}</div>
                  <div className="text-sm text-gray-600">Start: {new Date(session.start_time).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Max Participants: {session.max_participants}</div>
                  <div className="text-sm text-gray-600">Status: <span className="font-medium">{session.status}</span></div>
                  {session.description && <div className="text-sm text-gray-500 mt-1">{session.description}</div>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Room ID:</span>
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">{session.room_id}</span>
                    <button
                      className="ml-2 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                      onClick={() => handleCopy(session.room_id)}
                    >Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostLiveSession; 