import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Save, ArrowLeft, Trash2, Plus, Image, Edit, FileText, Video, Award, Upload, Loader2, X, Info } from 'lucide-react';
import { useToast } from '../../../components/ui/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchCourseById, createCourse, updateCourse, clearCurrentCourse } from '../../../store/coursesSlice';
import { supabase } from '../../../lib/supabase';

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  instructor: string;
  instructorTitle: string;
  instructor_avatar: File | null;
  instructor_avatarUrl: string;
  objectives: string[];
  category: 'Technology' | 'Food' | 'Education' | 'Travel' | 'Life Lessons' | 'Others';
  lessons: {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'text' | 'quiz';
    video?: File | null;
    videoUrl?: string;
    content?: string;
  }[];
}

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCourse, loading, error } = useSelector((state: RootState) => state.courses);
  const isEditing = !!id;

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    thumbnail: null,
    thumbnailUrl: '',
    duration: '',
    level: 'beginner',
    isActive: true,
    instructor: '',
    instructorTitle: '',
    instructor_avatar: null,
    instructor_avatarUrl: '',
    objectives: [],
    category: 'Education',
    lessons: []
  });

  const [errors, setErrors] = useState<Partial<CourseFormData>>({});
  const [lessons, setLessons] = useState<{ id: string; title: string; order: number; type: 'text' | 'video' | 'quiz' }[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchCourseById(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (currentCourse && isEditing) {
      setFormData({
        title: currentCourse.title,
        description: currentCourse.description,
        thumbnail: null,
        thumbnailUrl: currentCourse.thumbnail || '',
        duration: currentCourse.duration,
        level: currentCourse.level as 'beginner' | 'intermediate' | 'advanced',
        isActive: currentCourse.is_active,
        instructor: currentCourse.instructor,
        instructorTitle: currentCourse.instructor_title || '',
        instructor_avatar: null,
        instructor_avatarUrl: currentCourse.instructor_avatar || '',
        objectives: currentCourse.objectives || [],
        category: currentCourse.category as 'Technology' | 'Food' | 'Education' | 'Travel' | 'Life Lessons' | 'Others',
        lessons: currentCourse.lessons || []
      });
    }
  }, [currentCourse, isEditing]);

  const validateForm = () => {
    const newErrors: Partial<CourseFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'instructor_avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') setThumbnailUploading(true);
    if (type === 'instructor_avatar') setAvatarUploading(true);

    try {
      const filePath = `${type}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('course-assets').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-assets').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, [type]: file, [`${type}Url`]: publicUrl }));
    } catch (error) {
      addToast({ type: 'error', title: `Error uploading ${type}`, message: 'Please try again.' });
    } finally {
      if (type === 'thumbnail') setThumbnailUploading(false);
      if (type === 'instructor_avatar') setAvatarUploading(false);
    }
  };

  const removeThumbnail = () => setFormData(prev => ({ ...prev, thumbnail: null, thumbnailUrl: '' }));
  const removeAvatar = () => setFormData(prev => ({ ...prev, instructor_avatar: null, instructor_avatarUrl: '' }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let thumbUrl = formData.thumbnailUrl;
      let instructor_avatarUrl = formData.instructor_avatarUrl;

      // Upload thumbnail if a new file is selected
      if (formData.thumbnail) {
        const thumbnailPath = `thumbnails/${Date.now()}_${formData.thumbnail.name}`;
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('course-assets')
          .upload(thumbnailPath, formData.thumbnail);
        if (thumbError) throw thumbError;
        const { data: thumbUrlData } = supabase
          .storage
          .from('course-assets')
          .getPublicUrl(thumbnailPath);
        thumbUrl = thumbUrlData.publicUrl;
      }

      // Upload instructor avatar if a new file is selected
      if (formData.instructor_avatar) {
        const avatarPath = `avatars/${Date.now()}_${formData.instructor_avatar.name}`;
        const { data: avatarData, error: avatarError } = await supabase.storage
          .from('course-assets')
          .upload(avatarPath, formData.instructor_avatar);
        if (avatarError) throw avatarError;
        const { data: avatarUrlData } = supabase
          .storage
          .from('course-assets')
          .getPublicUrl(avatarPath);
        instructor_avatarUrl = avatarUrlData.publicUrl;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        thumbnail: thumbUrl,
        duration: formData.duration,
        level: formData.level,
        is_active: formData.isActive,
        instructor: formData.instructor,
        instructor_title: formData.instructorTitle,
        instructor_avatar: instructor_avatarUrl,
        category: formData.category,
        objectives: formData.objectives,
        lessons: formData.lessons,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        // Update existing course
        const { error: updateError } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        // Create new course
        const { error: insertError } = await supabase
          .from('courses')
          .insert([courseData]);

        if (insertError) throw insertError;
      }

      addToast({
        type: 'success',
        title: `Course ${isEditing ? 'updated' : 'created'} successfully`,
        duration: 5000,
      });
      navigate('/admin/courses');
          } catch (error) {
        console.error('Error saving course:', error);
        addToast({
          type: 'error',
          title: 'Error saving course',
          message: 'Please try again later.',
          duration: 5000,
        });
      }
  };

  const handleAddLesson = () => {
    const newLesson = {
      id: `temp-${Date.now()}`,
      title: 'New Lesson',
      duration: '',
      type: 'text' as const,
      video: null,
      videoUrl: '',
      content: '',
    };

    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
  };

  const handleLessonChange = (lessonId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(prev => (prev === lessonId ? null : lessonId));
  };

  const handleLessonVideoChange = async (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLessonId(lessonId);
    try {
      const filePath = `lessons/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('course-assets').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-assets').getPublicUrl(filePath);
      handleLessonChange(lessonId, 'video', file);
      handleLessonChange(lessonId, 'videoUrl', publicUrl);
    } catch (error) {
      addToast({ type: 'error', title: 'Error uploading video', message: 'Please try again.' });
    } finally {
      setUploadingLessonId(null);
    }
  };

  const handleAddObjective = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleEditLesson = (lessonId: string) => {
    navigate(`/admin/courses/${id}/lessons/${lessonId}`);
  };

  const handleDeleteLesson = (lessonId: string) => {
    // In a real app, we would delete the lesson via API
    // For demo purposes, we'll just remove it from the local state
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    

    try {
      // Delete the course from Supabase
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete associated files from storage
      if (formData.thumbnailUrl) {
        const thumbnailPath = formData.thumbnailUrl.split('/').pop();
        if (thumbnailPath) {
          await supabase.storage
            .from('course-assets')
            .remove([`thumbnails/${thumbnailPath}`]);
        }
      }

      if (formData.instructor_avatarUrl) {
        const avatarPath = formData.instructor_avatarUrl.split('/').pop();
        if (avatarPath) {
          await supabase.storage
            .from('course-assets')
            .remove([`avatars/${avatarPath}`]);
        }
      }

      // Delete lesson videos
      for (const lesson of formData.lessons) {
        if (lesson.videoUrl) {
          const videoPath = lesson.videoUrl.split('/').pop();
          if (videoPath) {
            await supabase.storage
              .from('course-assets')
              .remove([`lessons/${videoPath}`]);
          }
        }
      }

      addToast({
        type: 'success',
        title: 'Course deleted successfully',
        duration: 5000,
      });

      // Navigate back to courses list
      navigate('/admin/courses', { replace: true });
    } catch (error) {
      console.error('Error deleting course:', error);
      addToast({
        type: 'error',
        title: 'Error deleting course',
        message: 'Please try again later.',
        duration: 5000,
      });
    } finally {
      
    }
  };

  // Helper function to get icon based on lesson type
  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-red-500 dark:text-red-400" />;
      case 'quiz':
        return <Award size={16} className="text-amber-500 dark:text-amber-400" />;
      default:
        return <FileText size={16} className="text-blue-500 dark:text-blue-400" />;
    }
  };

  // Helper function to reorder lessons
  const handleReorderLesson = (id: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(lesson => lesson.id === id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      const newLessons = [...lessons];
      const temp = newLessons[currentIndex - 1].order;
      newLessons[currentIndex - 1].order = newLessons[currentIndex].order;
      newLessons[currentIndex].order = temp;
      newLessons.sort((a, b) => a.order - b.order);
      setLessons(newLessons);
    } else if (direction === 'down' && currentIndex < lessons.length - 1) {
      const newLessons = [...lessons];
      const temp = newLessons[currentIndex + 1].order;
      newLessons[currentIndex + 1].order = newLessons[currentIndex].order;
      newLessons[currentIndex].order = temp;
      newLessons.sort((a, b) => a.order - b.order);
      setLessons(newLessons);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back to Courses
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 ml-4">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>

        {isEditing && (
          <Button
            variant="danger"
            onClick={handleDeleteCourse}
            leftIcon={<Trash2 size={18} />}
            isLoading={loading}
          >
            Delete Course
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Basic information about the course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="title"
                  name="title"
                  label="Course Title"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  fullWidth
                  disabled={loading}
                  className='p-2'
                />

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    className="w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Describe the course content and learning objectives"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course Thumbnail
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="thumbnail"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                        className="hidden"
                      />
                      <label
                        htmlFor="thumbnail"
                        className="flex items-center justify-center w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload size={16} className="mr-2" />
                        {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                        {thumbnailUploading && <Loader2 className="ml-2 animate-spin text-white" size={18} />}
                      </label>
                    </div>
                    {formData.thumbnailUrl && (
                      <div className="w-20 h-20 relative rounded-md overflow-hidden border border-slate-200 shadow">
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={removeThumbnail}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-100"
                          title="Remove"
                          type="button"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="instructor"
                    name="instructor"
                    label="Instructor Name"
                    placeholder="Enter instructor name"
                    value={formData.instructor}
                    onChange={handleChange}
                    fullWidth
                    className='p-2'
                    disabled={loading}
                  />
                  <Input
                    id="instructorTitle"
                    name="instructorTitle"
                    label="Instructor Title"
                    placeholder="Enter instructor title"
                    className='p-2'
                    value={formData.instructorTitle}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Instructor Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 ">
                      <input
                        type="file"
                        id="instructor_avatar"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'instructor_avatar')}
                        className="hidden"
                      />
                      <label
                        htmlFor="instructor_avatar"
                        className="flex items-center justify-center w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload size={16} className="mr-2" />
                        {formData.instructor_avatar ? 'Change Avatar' : 'Upload Avatar'}
                        {avatarUploading && <Loader2 className="ml-2 animate-spin text-white" size={18} />}
                      </label>
                    </div>
                    {formData.instructor_avatarUrl && (
                      <div className="w-20 h-20 relative rounded-full overflow-hidden border border-slate-200 shadow">
                        <img
                          src={formData.instructor_avatarUrl}
                          alt="Instructor avatar"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={removeAvatar}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-100"
                          title="Remove"
                          type="button"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="duration"
                    name="duration"
                    label="Duration"
                    placeholder="e.g., 3 hours, 2 weeks"
                    className='p-2'
                    value={formData.duration}
                    onChange={handleChange}
                    error={errors.duration}
                    fullWidth
                    disabled={loading}
                  />

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      className="w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 p-2"
                      value={formData.level}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="p-2 w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Food">Food</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Life Lessons">Life Lessons</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="flex items-center h-full pt-6">
                  <input
                    id="isActive"
                    name="isActive"

                    type="checkbox"
                    className="p-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Course is active and visible to learners
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Objectives</CardTitle>
                <CardDescription>What will students learn in this course?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                        placeholder="Enter learning objective"
                        className='p-2'
                        fullWidth
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handleRemoveObjective(index); }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={(e) => { handleAddObjective(e); }}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Objective
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>Add and organize your course content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-lg border shadow-sm bg-white dark:bg-slate-900">
                      <div
                        className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-t-lg cursor-pointer"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        <div className="flex items-center gap-2">
                          {getLessonTypeIcon(lesson.type)}
                          <span className="font-semibold">{lesson.title || 'Untitled Lesson'}</span>
                          {lesson.duration && <span className="text-xs text-slate-500 ml-2">{lesson.duration}</span>}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${lesson.type === 'video' ? 'bg-blue-100 text-blue-700' : lesson.type === 'quiz' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                          title="Remove Lesson"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      {expandedLesson === lesson.id && (
                        <div className="p-4 space-y-4 border-t dark:border-slate-700">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Lesson Title"
                              className='p-2'
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="Duration"
                              className='p-2'
                              value={lesson.duration}
                              onChange={(e) => handleLessonChange(lesson.id, 'duration', e.target.value)}
                              placeholder="e.g., 30 min"
                              fullWidth
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Lesson Type
                            </label>
                            <select
                              value={lesson.type}
                              onChange={(e) => handleLessonChange(lesson.id, 'type', e.target.value)}
                              className="w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="text">Text</option>
                              <option value="video">Video</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </div>
                          {lesson.type === 'video' && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Lesson Video
                              </label>
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    accept=".mkv, .mp4"
                                    onChange={(e) => handleLessonVideoChange(lesson.id, e)}
                                    className="hidden p-2"
                                    id={`video-${lesson.id}`}
                                  />
                                  <label
                                    htmlFor={`video-${lesson.id}`}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Upload size={16} className="mr-2" />
                                    {lesson.video ? 'Change Video' : 'Upload Video'}
                                  </label>
                                </div>
                                {uploadingLessonId === lesson.id ? (
                                  <div className="w-20 h-20 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <Loader2 className="animate-spin text-blue-500" size={28} />
                                  </div>
                                ) : lesson.videoUrl ? (
                                  <div className="w-20 h-20 relative bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                                    <Video size={24} className="text-slate-400" />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                          {lesson.type === 'text' && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Lesson Content
                              </label>
                              <textarea
                                value={lesson.content || ''}
                                onChange={(e) => handleLessonChange(lesson.id, 'content', e.target.value)}
                                className="p-2 w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                                rows={6}
                                placeholder="Enter the lesson content here..."
                              />
                            </div>
                          )}

                          {lesson.type === 'quiz' && (
                            <div className="mt-2">
                              {isEditing ? (
                                <Link to={`/admin/courses/${id}/quiz`}>
                                  <Button variant="outline" leftIcon={<Edit size={16} />}>Build/Edit Quiz</Button>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-slate-100 text-slate-500 text-sm">
                                  <Info size={16} />
                                  <span>Save the course to create a quiz.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="primary"
                    onClick={(e) => { e.preventDefault(); handleAddLesson(); }}
                    leftIcon={<Plus size={16} />}
                    fullWidth
                  >
                    Add Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex justify-end space-x-4 p-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/courses')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save size={18} />}
                  isLoading={loading}
                >
                  {isEditing ? 'Update Course' : 'Create Course'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.thumbnailUrl ? (
                  <div className="aspect-video overflow-hidden rounded-md mb-4">
                    <img
                      src={formData.thumbnailUrl}
                      alt={formData.title || 'Course thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center mb-4">
                    <Image size={48} className="text-slate-400 dark:text-slate-500" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                    {formData.title || 'Course Title'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {formData.description || 'Course description will appear here'}
                  </p>

                  <div className="flex items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="mr-2">{formData.duration || 'Duration'}</span>
                    <span className="mr-2">•</span>
                    <span>{formData.level.charAt(0).toUpperCase() + formData.level.slice(1)}</span>
                    <span className="mr-2">•</span>
                    <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                {/* Objectives Preview */}
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Objectives ({formData.objectives.length})</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                    {formData.objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                    {formData.objectives.length === 0 && <li>No objectives added yet.</li>}
                  </ul>
                </div>

                {/* Lessons Preview */}
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Lessons ({formData.lessons.length})</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                    {formData.lessons.map((lesson, idx) => (
                      <li key={lesson.id} className="mb-1">
                        <span className="font-medium">{lesson.title || `Lesson ${idx + 1}`}</span>
                        {lesson.duration && <span className="ml-2 text-xs">({lesson.duration})</span>}
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{lesson.type}</span>
                      </li>
                    ))}
                    {formData.lessons.length === 0 && <li>No lessons added yet.</li>}
                  </ul>
                </div>

                {/* Course Object Preview (for debugging) */}

              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;