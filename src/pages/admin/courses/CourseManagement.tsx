import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, Edit, Trash } from 'lucide-react';
import { UserProvider, useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchCourses, fetchCourseById, deleteCourse, clearCurrentCourse } from '../../../store/coursesSlice';
import { supabase } from '../../../lib/supabase';
import HostLiveSession from '../live/HostLiveSession';

const CourseManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: courses, loading, error, currentCourse } = useSelector((state: RootState) => state.courses);
  const { user } = useUser();
  const { addToast } = useToast();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [selectedCourseForLive, setSelectedCourseForLive] = useState<any | null>(null);
  const [liveForm, setLiveForm] = useState({
    roomName: '',
    startDate: '',
    maxParticipants: '',
    description: '',
  });
  const handleLiveFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLiveForm(prev => ({ ...prev, [name]: value }));
  };
  const handleScheduleLive = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement scheduling logic (API call, etc.)
    setShowLiveModal(false);
    setLiveForm({ roomName: '', startDate: '', maxParticipants: '', description: '' });
    setSelectedCourseForLive(null);
    if (typeof addToast === 'function') {
      addToast({
        type: 'success',
        title: 'Live class scheduled',
        message: 'Your live class has been scheduled.',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      setCourseDetails(currentCourse);
    } else {
      dispatch(fetchCourses());
      setCourseDetails(null);
    }
  }, [dispatch, id, currentCourse]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    // Filter by is_active status
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Active' && course.is_active) ||
      (selectedStatus === 'Draft' && !course.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      // 1. Fetch the course object to get file URLs
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (fetchError) throw fetchError;
              if (!course) {
          if (typeof addToast === 'function') {
            addToast({
              type: 'error',
              title: 'Course not found',
              message: 'Could not retrieve course details for deletion.',
              duration: 5000,
            });
          }
          return;
        }

      // Helper to try deleting a file from a list of possible folders
      const tryDeleteFromFolders = async (folders: string[], filename: string) => {
        for (const folder of folders) {
          try {
            const { error: removeError } = await supabase.storage
              .from('course-assets')
              .remove([`${folder}/${filename}`]);
            if (removeError && removeError.message !== 'The resource was not found') {
              console.warn(`Warning: Could not delete ${filename} from ${folder}:`, removeError);
            } else if (!removeError) {
              console.log(`Successfully deleted ${filename} from ${folder}`); // For debugging
            }
          } catch (e) {
            console.warn(`Error trying to delete ${filename} from ${folder}:`, e);
          }
        }
      };

      // 2. Delete associated files from storage
      if (course.thumbnail) {
        const thumbnailFile = course.thumbnail.split('/').pop();
        if (thumbnailFile) {
          await tryDeleteFromFolders(['thumbnails', 'thumbnail'], thumbnailFile);
        }
      }

      if (course.instructor_avatar) {
        const avatarFile = course.instructor_avatar.split('/').pop();
        if (avatarFile) {
          await tryDeleteFromFolders(['avatars', 'instructor_avatar'], avatarFile);
        }
      }

      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson.type === 'video' && lesson.videoUrl) {
            const videoFile = lesson.videoUrl.split('/').pop();
            if (videoFile) {
              await tryDeleteFromFolders(['lessons'], videoFile);
            }
          }
        }
      }

      // 3. Delete the course record from the database
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) throw deleteError;

      if (typeof addToast === 'function') {
        addToast({
          type: 'success',
          title: 'Course deleted successfully',
          duration: 5000,
        });
      }

      // Crucial: Update the frontend state to reflect the deletion
      dispatch(fetchCourses());

    } catch (error: any) {
      console.error('Error deleting course:', error);
      if (typeof addToast === 'function') {
        addToast({
          type: 'error',
          title: 'Error deleting course',
          message: error.message || 'Please try again later.',
          duration: 5000,
        });
      }
    }
  };

  // Helper to close menu when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.card-menu')) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>
  );

  // If viewing a single course
  if (id && courseDetails) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <button
          className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
          onClick={() => navigate('/admin/courses')}
        >
          ← Back to Courses
        </button>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8 w-full">
          <div className="flex-shrink-0 w-full md:w-80">
            <img
              src={courseDetails.thumbnail}
              alt={courseDetails.title}
              className="rounded-lg w-full h-56 object-cover mb-4"
            />
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block px-3 py-1 text-xs rounded-full ${courseDetails.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}>{courseDetails.is_active ? 'Active' : 'Draft'}</span>
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{courseDetails.level?.charAt(0).toUpperCase() + courseDetails.level?.slice(1)}</span>
            </div>
            <div className="mb-2 text-sm text-gray-500">{courseDetails.category}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Duration:</b> {courseDetails.duration}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Price:</b> {courseDetails.price ? `$${courseDetails.price}` : 'Free'}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Enrolled:</b> {courseDetails.enrollments?.[0]?.count || 0}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Created:</b> {courseDetails.created_at ? new Date(courseDetails.created_at).toLocaleDateString() : ''}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Updated:</b> {courseDetails.updated_at ? new Date(courseDetails.updated_at).toLocaleDateString() : ''}</div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{courseDetails.title}</h2>
            <p className="mb-6 text-gray-700 text-lg leading-relaxed">{courseDetails.description}</p>
            {/* Instructor */}
            {courseDetails.instructor && (
              <div className="flex items-center gap-3 mb-6">
                {courseDetails.instructor_avatar && (
                  <img src={courseDetails.instructor_avatar} alt="Instructor" className="w-14 h-14 rounded-full object-cover" />
                )}
                <div>
                  <div className="font-semibold text-gray-800 text-lg">{courseDetails.instructor}</div>
                  <div className="text-sm text-gray-500">{courseDetails.instructor_title}</div>
                </div>
              </div>
            )}
            {/* Objectives */}
            {Array.isArray(courseDetails.objectives) && courseDetails.objectives.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Objectives</h3>
                <ul className="list-disc list-inside text-gray-700 text-base">
                  {courseDetails.objectives.map((obj: string, idx: number) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Lessons */}
            {Array.isArray(courseDetails.lessons) && courseDetails.lessons.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Lessons</h3>
                <ul className="divide-y divide-gray-200">
                  {courseDetails.lessons.map((lesson: any, idx: number) => (
                    <li key={lesson.id || idx} className="py-2 flex items-center gap-2">
                      <span className="font-medium text-gray-700">{lesson.title}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{lesson.type}</span>
                      {lesson.duration && <span className="text-xs text-gray-500 ml-2">{lesson.duration}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Quiz Info */}
            {Array.isArray(courseDetails.lessons) && courseDetails.lessons.some((l: any) => l.type === 'quiz') && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Quiz Information</h3>
                <ul className="list-disc list-inside text-gray-700 text-base">
                  {courseDetails.lessons.filter((l: any) => l.type === 'quiz').map((quiz: any, idx: number) => (
                    <li key={quiz.id || idx}>{quiz.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Resources */}
            {Array.isArray(courseDetails.resources) && courseDetails.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Resources</h3>
                <ul className="list-disc list-inside text-gray-700 text-base">
                  {courseDetails.resources.map((res: string, idx: number) => (
                    <li key={idx}>{res}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Assignments */}
            {Array.isArray(courseDetails.assignments) && courseDetails.assignments.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Assignments</h3>
                <ul className="list-disc list-inside text-gray-700 text-base">
                  {courseDetails.assignments.map((assn: string, idx: number) => (
                    <li key={idx}>{assn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showLiveModal && selectedCourseForLive) {
    return (
      <HostLiveSession
        course={selectedCourseForLive}
        onBack={() => {
          setShowLiveModal(false);
          setSelectedCourseForLive(null);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {courseDetails ? (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 relative">
          <button
            className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
            onClick={() => setCourseDetails(null)}
          >
            ← Back to Courses
          </button>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-64">
              <img
                src={courseDetails.thumbnail}
                alt={courseDetails.title}
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-3 py-1 text-xs rounded-full ${courseDetails.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}>{courseDetails.is_active ? 'Active' : 'Draft'}</span>
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{courseDetails.level?.charAt(0).toUpperCase() + courseDetails.level?.slice(1)}</span>
              </div>
              <div className="mb-2 text-sm text-gray-500">{courseDetails.category}</div>
              <div className="mb-2 text-sm text-gray-700"><b>Duration:</b> {courseDetails.duration}</div>
              <div className="mb-2 text-sm text-gray-700"><b>Price:</b> {courseDetails.price ? `$${courseDetails.price}` : 'Free'}</div>
              <div className="mb-2 text-sm text-gray-700"><b>Enrolled:</b> {courseDetails.enrollments?.[0]?.count || 0}</div>
              <div className="mb-2 text-sm text-gray-700"><b>Created:</b> {courseDetails.created_at ? new Date(courseDetails.created_at).toLocaleDateString() : ''}</div>
              <div className="mb-2 text-sm text-gray-700"><b>Updated:</b> {courseDetails.updated_at ? new Date(courseDetails.updated_at).toLocaleDateString() : ''}</div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{courseDetails.title}</h2>
              <p className="mb-4 text-gray-700">{courseDetails.description}</p>
              {/* Instructor */}
              {courseDetails.instructor && (
                <div className="flex items-center gap-3 mb-4">
                  {courseDetails.instructor_avatar && (
                    <img src={courseDetails.instructor_avatar} alt="Instructor" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-800">{courseDetails.instructor}</div>
                    <div className="text-sm text-gray-500">{courseDetails.instructor_title}</div>
                  </div>
                </div>
              )}
              {/* Objectives */}
              {Array.isArray(courseDetails.objectives) && courseDetails.objectives.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Objectives</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {courseDetails.objectives.map((obj: string, idx: number) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Lessons */}
              {Array.isArray(courseDetails.lessons) && courseDetails.lessons.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Lessons</h3>
                  <ul className="divide-y divide-gray-200">
                    {courseDetails.lessons.map((lesson: any, idx: number) => (
                      <li key={lesson.id || idx} className="py-2 flex items-center gap-2">
                        <span className="font-medium text-gray-700">{lesson.title}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{lesson.type}</span>
                        {lesson.duration && <span className="text-xs text-gray-500 ml-2">{lesson.duration}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Quiz Info */}
              {Array.isArray(courseDetails.lessons) && courseDetails.lessons.some((l: any) => l.type === 'quiz') && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Quiz Information</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {courseDetails.lessons.filter((l: any) => l.type === 'quiz').map((quiz: any, idx: number) => (
                      <li key={quiz.id || idx}>{quiz.title}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Resources */}
              {Array.isArray(courseDetails.resources) && courseDetails.resources.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Resources</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {courseDetails.resources.map((res: string, idx: number) => (
                      <li key={idx}>{res}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Assignments */}
              {Array.isArray(courseDetails.assignments) && courseDetails.assignments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Assignments</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {courseDetails.assignments.map((assn: string, idx: number) => (
                      <li key={idx}>{assn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <Link
            to="/admin/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Link>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              {/* <option value="Archived">Archived</option> Uncomment if you have an 'Archived' status in your DB and logic*/}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Card Grid Start */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
                  {/* 3-dot menu button */}
                  <div className="absolute top-2 right-2 z-10 card-menu">
                    <button
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-100 focus:outline-none"
                      onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                      aria-label="More options"
                      type="button"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>
                    {openMenuId === course.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 card-menu">
                        <button
                          onClick={() => { setOpenMenuId(null); handleDeleteCourse(course.id); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Thumbnail */}
                  <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>
                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h2>
                    <div className="mb-2 text-sm text-gray-500">{course.category}</div>
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}>{course.is_active ? 'Active' : 'Draft'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                      <div>
                        <span className="font-semibold">Enrolled:</span> {course.enrollments?.[0]?.count || 0}
                      </div>
                      <div>
                        <span className="font-semibold">Updated:</span> {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-center text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        className="flex-1 bg-[#ed1e24] hover:bg-white hover:text-[#ed1e24] hover:outline-2 hover:outline-[#ed1e24] text-white px-3 py-2 rounded-lg text-center text-sm font-medium"
                        onClick={() => {
                          setSelectedCourseForLive(course);
                          setShowLiveModal(true);
                        }}
                        type="button"
                      >
                        Live
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No courses found. Try adjusting your search or filter.
              </div>
            )}
          </div>
          {/* Card Grid End */}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;