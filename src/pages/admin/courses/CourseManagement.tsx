import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, Edit, Trash } from 'lucide-react';
import { UserProvider, useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';
import { supabase } from '../../../lib/supabase';

const CourseManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const { user } = useUser();
  const { addToast } = useToast();

  // Define fetchCourses outside useEffect so it can be called elsewhere
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      if (typeof addToast === 'function') {
        addToast({
          title: 'Error fetching courses',
          message: error.message,
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

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
    
    setIsLoading(true);

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
        setIsLoading(false);
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
          await tryDeleteFromFolders(['avatars', 'instructorAvatar'], avatarFile);
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
      fetchCourses();

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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {course.enrolled || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/admin/courses/${course.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No courses found. Try adjusting your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;