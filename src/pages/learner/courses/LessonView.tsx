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

// Mock lesson data
const lessonsMock = [
  {
    id: '1',
    courseId: '1',
    title: 'Welcome and Introduction',
    content: `
      <div class="prose max-w-none">
        <h2>Welcome to Onboarding Essentials</h2>
        <p>This course is designed to help you integrate smoothly into our organization. Over the next few lessons, you'll learn about our company culture, policies, and the resources available to you.</p>
        
        <h3>Course Objectives</h3>
        <ul>
          <li>Understand our company's mission, vision, and values</li>
          <li>Navigate important policies and procedures</li>
          <li>Learn about available resources and tools</li>
          <li>Connect with key teams and departments</li>
        </ul>
        
        <h3>What to Expect</h3>
        <p>This course consists of 6 lessons covering different aspects of your onboarding journey. Each lesson includes a mix of text, videos, and interactive elements.</p>
        
        <p>At the end of the course, you'll take a short assessment to test your knowledge. Upon successful completion, you'll receive a certificate of completion.</p>
        
        <h3>Getting Started</h3>
        <p>Navigate through the course using the lesson navigator on the right. You can mark lessons as complete once you've finished reviewing the material.</p>
        
        <p>Let's begin your journey with GlobalSelect!</p>
      </div>
    `,
    type: 'text',
    duration: '10 min',
    order: 1,
    completed: true,
    resources: [
      { id: 'r1', title: 'Welcome Guide.pdf', type: 'pdf', url: '#' }
    ]
  },
  {
    id: '2',
    courseId: '1',
    title: 'Company Policies Overview',
    content: `
      <div class="prose max-w-none">
        <h2>Company Policies Overview</h2>
        <p>Understanding our company policies is essential for your success at GlobalSelect. This lesson provides an overview of key policies that guide our work environment.</p>
        
        <h3>Code of Conduct</h3>
        <p>Our Code of Conduct establishes the ethical standards and professional behaviors expected of all employees. It covers:</p>
        <ul>
          <li>Ethical business practices</li>
          <li>Respectful workplace interactions</li>
          <li>Confidentiality requirements</li>
          <li>Conflict of interest guidelines</li>
        </ul>
        
        <h3>Attendance and Leave</h3>
        <p>Our attendance policy ensures fairness while maintaining operational efficiency. Key points include:</p>
        <ul>
          <li>Standard working hours: 9 AM to 5 PM, Monday through Friday</li>
          <li>Flexible schedule options (where applicable)</li>
          <li>Procedure for requesting time off</li>
          <li>Sick leave and vacation accrual rates</li>
        </ul>
        
        <h3>IT and Data Security</h3>
        <p>Protecting company and client data is a critical responsibility. Our security policies cover:</p>
        <ul>
          <li>Password requirements and management</li>
          <li>Acceptable use of company equipment</li>
          <li>Data classification and handling</li>
          <li>Reporting security incidents</li>
        </ul>
        
        <p>Please review the complete policy documents in the resources section for detailed information on these and other policies.</p>
      </div>
    `,
    type: 'text',
    duration: '25 min',
    order: 2,
    completed: true,
    resources: [
      { id: 'r2', title: 'Employee Handbook.pdf', type: 'pdf', url: '#' },
      { id: 'r3', title: 'IT Security Guidelines.pdf', type: 'pdf', url: '#' }
    ]
  },
  {
    id: '3',
    courseId: '1',
    title: 'IT Systems and Security',
    content: `<div class="prose max-w-none">
      <h2>IT Systems and Security</h2>
      <p>This lesson covers the essential IT systems you'll use and important security practices to protect company data.</p>
      
      <div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-600 p-4 my-4">
        <p class="text-blue-700 dark:text-blue-300">This lesson includes a video presentation that provides a visual walkthrough of our key systems.</p>
      </div>
      
      <div class="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6">
        <div class="text-center">
          <Video size={48} class="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p class="text-slate-600 dark:text-slate-400">Video placeholder - In a real implementation, this would be an embedded video player</p>
        </div>
      </div>
      
      <h3>Key Systems Overview</h3>
      <p>You'll regularly interact with the following systems:</p>
      <ul>
        <li><strong>Email and Calendar</strong> - Microsoft Outlook for communication and scheduling</li>
        <li><strong>Document Management</strong> - SharePoint for file storage and collaboration</li>
        <li><strong>CRM</strong> - Salesforce for customer relationship management</li>
        <li><strong>Project Management</strong> - Asana for task tracking and project coordination</li>
      </ul>
      
      <h3>Security Best Practices</h3>
      <ol>
        <li>Use strong, unique passwords for all accounts</li>
        <li>Enable two-factor authentication when available</li>
        <li>Lock your computer when away from your desk</li>
        <li>Be cautious with email attachments and links</li>
        <li>Report any suspicious activities to the IT department</li>
      </ol>
      
      <h3>Getting Support</h3>
      <p>For IT assistance, contact the IT Help Desk:</p>
      <ul>
        <li>Email: helpdesk@example.com</li>
        <li>Phone: 555-123-4567</li>
        <li>Hours: Monday-Friday, 8 AM - 6 PM</li>
      </ul>
      
      <p>Remember, maintaining data security is everyone's responsibility!</p>
    </div>`,
    type: 'video',
    duration: '20 min',
    order: 3,
    completed: false,
    videoUrl: 'https://example.com/videos/it-systems-overview.mp4',
    resources: [
      { id: 'r4', title: 'System Access Request Form.pdf', type: 'pdf', url: '#' }
    ]
  },
];

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // In a real app, this would fetch data from an API
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Find the current lesson
      const currentLesson = lessonsMock.find(l => l.id === lessonId);
      
      if (currentLesson) {
        setLesson(currentLesson);
        
        // Mock course data to show in the sidebar
        setCourse({
          id: courseId,
          title: 'Onboarding Essentials',
          lessons: lessonsMock,
          progress: 35
        });
      }
      
      setIsLoading(false);
    }, 500);
  }, [courseId, lessonId]);

  const markAsComplete = () => {
    // In a real app, this would call an API
    addToast({
      type: 'success',
      title: 'Lesson completed',
      message: 'Your progress has been updated',
      duration: 3000
    });
    
    // Update local state
    setLesson({
      ...lesson,
      completed: true
    });
    
    // Find the next lesson
    const currentIndex = lessonsMock.findIndex(l => l.id === lessonId);
    if (currentIndex < lessonsMock.length - 1) {
      const nextLesson = lessonsMock[currentIndex + 1];
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
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
    const currentIndex = lessonsMock.findIndex(l => l.id === lessonId);
    
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/courses/${courseId}/lessons/${lessonsMock[currentIndex - 1].id}`);
    } else if (direction === 'next' && currentIndex < lessonsMock.length - 1) {
      navigate(`/courses/${courseId}/lessons/${lessonsMock[currentIndex + 1].id}`);
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

  if (!lesson) {
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
              disabled={lesson.order === 1}
              leftIcon={<ArrowLeft size={16} />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateLesson('next')}
              disabled={lesson.order === lessonsMock.length}
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
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Clock size={16} className="mr-1" />
                <span>{lesson.duration}</span>
              </div>
            </div>

            {lesson.type === 'video' && (
              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <Video size={48} className="mx-auto text-white opacity-75 mb-2" />
                  <p className="text-white opacity-75">Video placeholder - In a real implementation, this would be an embedded video player</p>
                </div>
              </div>
            )}
            
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            
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
                {course.progress}% complete
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {course.lessons.filter((l: any) => l.completed).length} of {course.lessons.length} lessons
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>

            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Lesson Navigator</h3>
            <div className="space-y-1">
              {course.lessons.map((courseLesson: any) => (
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
                      <span className="text-xs">{courseLesson.order}</span>
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
                  disabled={lesson.order === lessonsMock.length}
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