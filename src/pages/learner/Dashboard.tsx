import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { BookOpen, Award, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import Button from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toaster';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  videoUrl?: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  instructor: string;
  instructor_title: string;
  instructor_avatar: string;
  objectives: string[];
  category: 'Technology' | 'Food' | 'Education' | 'Travel' | 'Life Lessons' | 'Others';
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
  progress?: number;
  lastAccessed?: string;
  nextLesson?: string;
  enrolled?: number;
  rating?: number;
}

const LearnerDashboard = () => {
  const [fetchedCourses, setFetchedCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const { user } = useUser();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const achievements = [
    {
      id: '1',
      title: 'Completed First Course',
      date: 'Apr 15, 2025',
      icon: <CheckCircle2 size={24} className="text-green-500" />
    },
    {
      id: '2',
      title: 'Perfect Quiz Score',
      date: 'Apr 22, 2025',
      icon: <Award size={24} className="text-amber-500" />
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select('*')
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        // Add mock progress data for demonstration
        const coursesWithProgress = data.map((course: Course) => ({
          ...course,
          progress: Math.floor(Math.random() * 100), // Random progress for demo
          lastAccessed: '2 days ago', // Mock last accessed
          nextLesson: course.lessons?.[0]?.title || 'Start Course' // Use first lesson or default
        }));

        setFetchedCourses(coursesWithProgress);
      } catch (error: any) {
        addToast({
          title: "Error retrieving courses",
          message: error.message,
          type: "error"
        });
      }
    };

    fetchCourses();
  }, [user, addToast]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('course_enrollments')
          .select('courses (*)')
          .eq('user_id', user.id);

        if (error) throw error;

        const enrolledCourses = data.map(enrollment=> enrollment.courses);
      
      

        setMyCourses(enrolledCourses);
      } catch (error: any) {
        addToast({
          title: "Error receiving courses",
          message: error.message,
          type: "error",
        });
      } 
    };

    if (user) {
      fetchMyCourses();
    }
  }, [user]);



  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-600 mt-1">
          Your learning journey continues. You have {fetchedCourses.length} courses in progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Courses in Progress</p>
                <p className="text-2xl font-semibold">{fetchedCourses.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BookOpen size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Certificates Earned</p>
                <p className="text-2xl font-semibold">2</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Award size={20} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Learning Hours</p>
                <p className="text-2xl font-semibold">14.5</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Clock size={20} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Continue Learning</h2>
          
          <div className="space-y-6">
            {myCourses.map(course => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="sm:flex">
                  <div className="sm:w-1/3 h-48 sm:h-auto">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.title}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Progress</span>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-4">
                      <p>Last accessed: {course.lastAccessed}</p>
                      <p>Next: {course.nextLesson}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button size="sm" variant="primary" as={Link} to={`/courses/${course.id}`}>
                        Continue
                      </Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {fetchedCourses.length === 0 && (
              <div className="text-center py-4 text-slate-500">No courses in progress.</div>
            )}
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Recommended Courses</h2>
              <Link to="/courses" className="text-sm text-blue-600 hover:text-blue-700">
                View All Courses
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fetchedCourses.slice(0, 4).map(course => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                    <div className="flex items-center text-sm text-slate-600 mb-3">
                      <Clock size={16} className="mr-1" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{course.level}</span>
                    </div>
                    <Button size="sm" variant="outline" fullWidth onClick={() => handleEnroll(course.id)}>
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {fetchedCourses.length === 0 && (
                <div className="text-center py-4 text-slate-500 col-span-2">
                  No recommended courses found. Please add some courses in the admin panel.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg mb-4">
                <BarChart3 size={24} className="text-blue-700 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">On Track</p>
                  <p className="text-xs text-blue-600">You're making good progress!</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Weekly Goal</span>
                    <span className="text-sm font-medium">3/5 hours</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Monthly Courses</span>
                    <span className="text-sm font-medium">1/2 completed</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-start">
                      <div className="mr-3">{achievement.icon}</div>
                      <div>
                        <p className="font-medium text-slate-900">{achievement.title}</p>
                        <p className="text-sm text-slate-600">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Complete courses to earn achievements
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm font-medium text-amber-800">Data Security Quiz</p>
                  <p className="text-xs text-amber-700 mt-1">Due in 2 days</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">Document Upload</p>
                  <p className="text-xs text-blue-700 mt-1">Due next week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;