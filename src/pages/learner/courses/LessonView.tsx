import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Video, 
  Bookmark, 
  MessageSquare,
  CheckCircle,
  Award,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { useToast } from '../../../components/ui/Toaster';
import { supabase } from '../../../lib/supabase';

interface Lesson {
  id: string;
  type: 'video' | 'text' | 'quiz';
  title: string;
  video?: any;
  duration: string;
  videoUrl: string;
  completed: boolean;
  content?: string;
  resources?: any[];
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
  progress?: number;
}

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchCourseAndLesson = async () => {
      setIsLoading(true);
      try {
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        if (courseData) {
          const completedLessonsCount = courseData.lessons.filter((l: Lesson) => l.completed).length;
          const totalLessonsCount = courseData.lessons.length;
          const calculatedProgress = totalLessonsCount > 0 
            ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
            : 0;

          setCourse({
            ...courseData,
            progress: calculatedProgress
          });
          
          // Find the current lesson from the course's lessons array
          const currentLesson = courseData.lessons.find((l: Lesson) => l.id === lessonId);
          if (currentLesson) {
            setLesson(currentLesson);
          }
        }
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error loading lesson',
          message: error.message,
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndLesson();
  }, [courseId, lessonId, addToast]);

  const markAsComplete = async () => {
    try {
      // Update the lesson's completed status in the course's lessons array
      const updatedLessons = course?.lessons.map((l: Lesson) => 
        l.id === lessonId ? { ...l, completed: true } : l
      );

      // Calculate new progress
      const completedLessonsCount = updatedLessons?.filter((l: Lesson) => l.completed).length || 0;
      const totalLessonsCount = updatedLessons?.length || 0;
      const newProgress = totalLessonsCount > 0 
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
        : 0;

      // Update the course in Supabase
      const { error } = await supabase
        .from('courses')
        .update({ lessons: updatedLessons })
        .eq('id', courseId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Lesson completed',
        message: 'Your progress has been updated',
        duration: 3000
      });
      
      // Update local state
      setLesson(prev => prev ? { ...prev, completed: true } : null);
      setCourse(prev => prev ? { ...prev, lessons: updatedLessons || [], progress: newProgress } : null);
      
      // Find the next lesson
      const currentIndex = course?.lessons.findIndex((l: Lesson) => l.id === lessonId);
      if (currentIndex !== undefined && currentIndex < (course?.lessons.length || 0) - 1) {
        const nextLesson = course?.lessons[currentIndex + 1];
        navigate(`/courses/${courseId}/lessons/${nextLesson?.id}`);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error updating progress',
        message: error.message,
        duration: 5000
      });
    }
  };

  const handleSaveNotes = () => {
    // In a real app, this would save to the database
    addToast({
      type: 'success',
      title: 'Notes saved',
      duration: 3000
    });
  };

  // Navigate to previous/next lesson
  const navigateLesson = (direction: 'prev' | 'next') => {
    const currentIndex = course?.lessons.findIndex((l: Lesson) => l.id === lessonId);
    
    if (currentIndex !== undefined) {
      if (direction === 'prev' && currentIndex > 0) {
        const prevLesson = course?.lessons[currentIndex - 1];
        navigate(`/courses/${courseId}/lessons/${prevLesson?.id}`);
      } else if (direction === 'next' && currentIndex < (course?.lessons.length || 0) - 1) {
        const nextLesson = course?.lessons[currentIndex + 1];
        navigate(`/courses/${courseId}/lessons/${nextLesson?.id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Lesson not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
        <Link to={`/courses/${courseId}`}>
          <Button>Back to Course</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/courses/${courseId}`} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Course</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateLesson('prev')}
              disabled={course.lessons.findIndex((l: Lesson) => l.id === lessonId) === 0}
              leftIcon={<ArrowLeft size={16} />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateLesson('next')}
              disabled={course.lessons.findIndex((l: Lesson) => l.id === lessonId) === course.lessons.length - 1}
              rightIcon={<ArrowRight size={16} />}
            >
              Next
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {lesson.type === 'video' && <Video size={20} className="text-red-500 dark:text-red-400 mr-2" />}
                {lesson.type === 'text' && <FileText size={20} className="text-blue-500 dark:text-blue-400 mr-2" />}
                {lesson.type === 'quiz' && <Award size={20} className="text-amber-500 dark:text-amber-400 mr-2" />}
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
              </div>
              {lesson.duration && (
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Clock size={16} className="mr-1" />
                  <span>{lesson.duration}</span>
                </div>
              )}
            </div>

            {lesson.type === 'video' && lesson.videoUrl && (
              <div className="aspect-video bg-slate-900 rounded-lg mb-6">
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full h-full rounded-lg"
                />
              </div>
            )}

            {lesson.type === 'text' && lesson.content && (
              <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Bookmark size={16} />}
                  onClick={() => addToast({
                    type: 'success',
                    title: 'Bookmarked',
                    message: 'Lesson added to your bookmarks',
                    duration: 3000
                  })}
                >
                  Bookmark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MessageSquare size={16} />}
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? 'Hide Notes' : 'Add Notes'}
                </Button>
              </div>
              
              <div className="flex space-x-3">
                {lesson.completed ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle size={18} className="mr-1" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <Button 
                    onClick={markAsComplete}
                    leftIcon={<CheckCircle size={16} />}
                  >
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>
            
            {showNotes && (
              <div className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">My Notes</h3>
                <textarea
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-slate-100"
                  rows={5}
                  placeholder="Type your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleSaveNotes}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">Was this lesson helpful?</h3>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ThumbsUp size={16} />}
                  onClick={() => addToast({
                    type: 'success',
                    title: 'Thank you for your feedback!',
                    duration: 3000
                  })}
                >
                  Yes, it was helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ThumbsDown size={16} />}
                  onClick={() => addToast({
                    type: 'info',
                    title: 'Thanks for your feedback',
                    message: 'We\'ll work on improving this lesson',
                    duration: 3000
                  })}
                >
                  No, needs improvement
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {lesson.resources && lesson.resources.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">Lesson Resources</h3>
              <div className="space-y-3">
                {lesson.resources.map((resource: any) => (
                  <a 
                    key={resource.id}
                    href={resource.url}
                    className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{resource.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{resource.type.toUpperCase()} Document</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Course Progress</h3>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {course.progress || 0}% complete
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {course.lessons.filter((l: Lesson) => l.completed).length} of {course.lessons.length} lessons
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>

            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Lesson Navigator</h3>
            <div className="space-y-1">
              {course.lessons.map((courseLesson: Lesson) => (
                <Link
                  key={courseLesson.id}
                  to={`/courses/${courseId}/lessons/${courseLesson.id}`}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    courseLesson.id === lessonId
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {courseLesson.completed ? (
                    <CheckCircle size={16} className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                  ) : (
                    <div className={`w-4 h-4 flex items-center justify-center rounded-full mr-2 flex-shrink-0 ${
                      courseLesson.id === lessonId
                        ? 'border-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-400'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}>
                      <span className="text-xs">{course.lessons.indexOf(courseLesson) + 1}</span>
                    </div>
                  )}
                  <span className={`text-sm truncate ${
                    courseLesson.id === lessonId
                      ? 'font-medium text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {courseLesson.title}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              {!lesson.completed ? (
                <Button
                  onClick={markAsComplete}
                  leftIcon={<CheckCircle size={16} />}
                  fullWidth
                >
                  Complete & Continue
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigateLesson('next')}
                  rightIcon={<ArrowRight size={16} />}
                  fullWidth
                  disabled={course.lessons.findIndex((l: Lesson) => l.id === lessonId) === course.lessons.length - 1}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonView;