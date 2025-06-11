import { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../contexts/UserContext';

interface Lesson {
  id: string;
  type: 'video' | 'text' | 'quiz';
  title: string;
  video?: any;
  duration: string;
  videoUrl: string;
  completed: boolean;
  content?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  duration: string;
  instructor: string;
  instructorTitle: string;
  instructor_avatar: string;
  rating: number;
  enrolled: number;
  updatedAt: string;
  objectives: string[];
  lessons: Lesson[];
  progress: number;
}

const CourseView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const {addToast} = useToast();
  const [isEnrolled,setIsEnrolled] = useState(false); 
  const {user} = useUser();
  useEffect(()=>{
    const fetchEnrollStatus = async()=>{
      if (!user) return;
      const {data,error} = await supabase.from("course_enrollments").select("id").eq("user_id",user.id).eq("course_id",id).maybeSingle();
      setIsEnrolled(!!data);

      console.log(!!data);
    }

    if (user) {
      fetchEnrollStatus();
    }
  },[isEnrolled, id, user]);


  useEffect(() => {

    const fetchCourse = async()=>{
      if (!user) return;
      try{

        const {data,error} = await supabase.from("courses").select("*").eq("id",id).single();
        if(error) throw error
        
        if (data) {
          const completedLessonsCount = data.lessons?.filter((l: Lesson) => l.completed).length || 0;
          const totalLessonsCount = data.lessons?.length || 0;
          const calculatedProgress = totalLessonsCount > 0 
            ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
            : 0;

          setCourse({
            ...data,
            progress: calculatedProgress
          });
          console.log(data)
        }
        setIsLoading(false)
      }catch(error:any){
        addToast({
          title:"Error fetching course",
          message:error.message,
          type:'error'
        })
      }finally{
        setIsLoading(false);
      }
    }
    if (user) {
      fetchCourse();
    }
  }, [id, addToast, user]);

  const handleEnroll = (courseId:string) => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'User not logged in.',
        duration: 3000
      });
      return;
    }
    // Navigate to EnrollPage.tsx instead of direct enrollment
    navigate(`/enroll/${courseId}`);
  }
  

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-200 rounded-lg mb-6"></div>
        <div className="h-24 bg-slate-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-200 rounded-lg col-span-2"></div>
          <div className="h-40 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
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
          {isEnrolled ? (
            <Link to={`/courses/${course.id}/lessons/${course.lessons?.[0]?.id || ''}`}>
              <Button
                leftIcon={<Play size={20} />}
              >
                Continue Learning
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => handleEnroll(course.id)}
              leftIcon={<BookOpen size={20} />}
            >
              Enroll Course
            </Button>
          )}
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
                    className={`pb-4 text-sm font-medium border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`pb-4 text-sm font-medium border-b-2 ${
                      activeTab === 'curriculum'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => setActiveTab('curriculum')}
                  >
                    Curriculum
                  </button>
                  <button
                    className={`pb-4 text-sm font-medium border-b-2 ${
                      activeTab === 'resources'
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Instructor</h3>
                    <div className="flex items-center">
                      <img 
                        src={course.instructor_avatar}
                        alt={course.instructor}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{course.instructor}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{course.instructorTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'curriculum' && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Course Content</h2>
                  
                  <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{course.lessons.length} lessons</span>
                      <span className="mx-2">•</span>
                      <span>{course.duration} total</span>
                    </div>
                    
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Expand All
                    </button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 dark:border-slate-700 dark:divide-slate-700">
                    {course.lessons.map((lesson: Lesson, index: number) => (
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
                        {!lesson.completed && index > 0 && !course.lessons[index-1].completed && (
                          <Lock size={14} className="ml-auto text-slate-400 flex-shrink-0" />
                        )}
                      </Link>
                    ))}
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
        </div>
        
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <Button
                onClick={() => isEnrolled ? navigate(`/courses/${course.id}/lessons/${course.lessons?.[0]?.id || ''}`) : handleEnroll(course.id)}
                leftIcon={isEnrolled ? <Play size={18} /> : <BookOpen size={18} />}
                fullWidth
              >
                {isEnrolled ? (course.progress > 0 ? 'Continue Course' : 'Start Course') : 'Enroll Now'}
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">{course.lessons.length} lessons</p>
                  </div>
                </div>
              </div>

              {isEnrolled &&  (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Course Progress</h3>
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {Math.round(course.progress)}% complete
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {course.lessons.filter((l: Lesson) => l.completed).length} of {course.lessons.length} lessons
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-4 dark:bg-slate-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full dark:bg-blue-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    {course.lessons.map((lesson: Lesson, index: number) => (
                      <Link 
                        key={lesson.id}
                        to={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {lesson.completed ? (
                          <CheckCircle size={16} className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 mr-2 flex-shrink-0">
                            <span className="text-xs text-slate-600 dark:text-slate-400">{index + 1}</span>
                          </div>
                        )}
                        <span className="text-sm truncate text-slate-700 dark:text-slate-300">
                          {lesson.title}
                        </span>
                        {!lesson.completed && index > 0 && !course.lessons[index-1].completed && (
                          <Lock size={14} className="ml-auto text-slate-400 flex-shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
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