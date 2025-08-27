import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Clock, DollarSign, Users, Calendar, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';


const lessonTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4 text-blue-500" />;
    if (type === 'text') return <FileText className="w-4 h-4 text-gray-500" />;
    if (type === 'quiz') return <HelpCircle className="w-4 h-4 text-yellow-500" />;
    return <BookOpen className="w-4 h-4 text-gray-400" />;
};

const CourseViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<any | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*,enrollments:course_enrollments(count)')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setCourse(data);
            } catch (error) {
                setCourse(null);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchCourse();
    }, [id]);



    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
        </div>
    );

    if (!course) return (
        <div className="w-full max-w-3xl mx-auto px-4 py-10 text-center text-gray-500">
            Course not found.
            <div>
                <button
                    className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
                    onClick={() => navigate('/admin/courses')}
                >
                    ← Back to Courses
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
            <div className="flex gap-3 mb-8 ml-2">
                <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-sm"
                    onClick={() => navigate('/admin/courses')}
                >
                    ← Back to Courses
                </button>

            </div>
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row gap-0">
                {/* Left: Image & Meta */}
                <div className="flex-[1_1_0%] lg:basis-1/3 bg-gray-50 p-8 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-100 min-w-[320px]">
                    <div className="w-full bg-white rounded-xl shadow p-4 flex flex-col items-center mb-6">
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="rounded-lg w-full h-40 object-cover mb-4 shadow-sm border"
                        />
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 text-xs rounded-full font-semibold ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{course.is_active ? 'Active' : 'Draft'}</span>
                            <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700">{course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}</span>
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex items-center gap-2 text-gray-600"><BookOpen className="w-4 h-4" /><span>{course.category}</span></div>
                            <div className="flex items-center gap-2 text-gray-700"><Clock className="w-4 h-4" /><span><b>Duration:</b> {course.duration}</span></div>
                            <div className="flex items-center gap-2 text-gray-700"><DollarSign className="w-4 h-4" /><span><b>Price:</b> {course.price ? `$${course.price}` : 'Free'}</span></div>
                            <div className="flex items-center gap-2 text-gray-700"><Users className="w-4 h-4" /><span><b>Enrolled:</b> {course.enrollments?.[0]?.count || 0}</span></div>
                            <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4" /><span><b>Created:</b> {course.created_at ? new Date(course.created_at).toLocaleDateString() : ''}</span></div>
                            <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4" /><span><b>Updated:</b> {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : ''}</span></div>
                        </div>
                    </div>
                </div>
                {/* Right: Main Content */}
                <div className="flex-[2_1_0%] lg:basis-2/3 p-10 flex flex-col">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{course.title}</h1>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">{course.description}</p>
                    {/* Instructor */}
                    {course.instructor && (
                        <div className="flex items-center gap-3 mb-6">
                            {course.instructor_avatar && (
                                <img src={course.instructor_avatar} alt="Instructor" className="w-12 h-12 rounded-full object-cover border shadow" />
                            )}
                            <div>
                                <div className="font-bold text-gray-800 text-lg">{course.instructor}</div>
                                <div className="text-sm text-gray-500">{course.teacherEmail}</div>
                            </div>
                        </div>
                    )}
                    {/* Objectives */}
                    {Array.isArray(course.objectives) && course.objectives.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-900 text-xl mb-2">Objectives</h2>
                            <ul className="list-disc list-inside text-gray-700 text-base space-y-1">
                                {course.objectives.map((obj: string, idx: number) => (
                                    <li key={idx}>{obj}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Lessons */}
                    {Array.isArray(course.lessons) && course.lessons.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-900 text-xl mb-2">Lessons</h2>
                            <div className="flex flex-col gap-3">
                                {course.lessons.map((lesson: any, idx: number) => (
                                    <div key={lesson.id || idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border mr-2">
                                            {lessonTypeIcon(lesson.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800 text-base">{lesson.title}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${lesson.type === 'video' ? 'bg-blue-100 text-blue-700' : lesson.type === 'quiz' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{lesson.type}</span>
                                                <span className="text-xs text-gray-500 ml-2 flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Quiz Info */}
                    {Array.isArray(course.lessons) && course.lessons.some((l: any) => l.type === 'quiz') && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-900 text-xl mb-2">Quiz Information</h2>
                            <ul className="list-disc list-inside text-gray-700 text-base">
                                {course.lessons.filter((l: any) => l.type === 'quiz').map((quiz: any, idx: number) => (
                                    <li key={quiz.id || idx}>{quiz.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Resources */}
                    {Array.isArray(course.resources) && course.resources.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-900 text-xl mb-2">Resources</h2>
                            <ul className="list-disc list-inside text-gray-700 text-base">
                                {course.resources.map((res: string, idx: number) => (
                                    <li key={idx}>{res}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Assignments */}
                    {Array.isArray(course.assignments) && course.assignments.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-900 text-xl mb-2">Assignments</h2>
                            <ul className="list-disc list-inside text-gray-700 text-base">
                                {course.assignments.map((assn: string, idx: number) => (
                                    <li key={idx}>{assn}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseViewPage; 