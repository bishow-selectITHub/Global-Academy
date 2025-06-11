import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Flag,
  Save,
  HelpCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';

// Types
type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching';

interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: {
    id: string;
    text: string;
  }[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  passingScore: number; // percentage
}

// Mock data for the quiz
const mockQuiz: Quiz = {
  id: 'q1',
  title: 'Data Security Fundamentals Quiz',
  description: 'Test your knowledge of basic data security concepts and best practices.',
  courseId: 'c2',
  courseName: 'Data Security Fundamentals',
  timeLimit: 30,
  totalQuestions: 10,
  totalPoints: 100,
  passingScore: 70
};

// Mock questions for the quiz
const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1-1',
    text: 'Which of the following is the best practice for password management?',
    type: 'multiple-choice',
    options: [
      { id: 'q1-1-a', text: 'Using the same password for all accounts' },
      { id: 'q1-1-b', text: 'Writing passwords down on sticky notes' },
      { id: 'q1-1-c', text: 'Using a password manager with unique passwords' },
      { id: 'q1-1-d', text: 'Sharing passwords with team members' },
    ],
    points: 10
  },
  {
    id: 'q1-2',
    text: 'Multi-factor authentication provides an additional layer of security beyond passwords.',
    type: 'true-false',
    options: [
      { id: 'q1-2-a', text: 'True' },
      { id: 'q1-2-b', text: 'False' },
    ],
    points: 10
  },
  {
    id: 'q1-3',
    text: 'Which of the following is NOT a common type of cyber attack?',
    type: 'multiple-choice',
    options: [
      { id: 'q1-3-a', text: 'Phishing' },
      { id: 'q1-3-b', text: 'Malware' },
      { id: 'q1-3-c', text: 'Data Compression' },
      { id: 'q1-3-d', text: 'Ransomware' },
    ],
    points: 10
  },
  {
    id: 'q1-4',
    text: 'What should you do if you receive an email with an unexpected attachment?',
    type: 'multiple-choice',
    options: [
      { id: 'q1-4-a', text: 'Open it immediately to check its contents' },
      { id: 'q1-4-b', text: 'Delete it without opening if it\'s from an unknown sender' },
      { id: 'q1-4-c', text: 'Forward it to colleagues to see if they know what it is' },
      { id: 'q1-4-d', text: 'Save it to your desktop to check later' },
    ],
    points: 10
  },
  {
    id: 'q1-5',
    text: 'Regular software updates are important because they often include security patches.',
    type: 'true-false',
    options: [
      { id: 'q1-5-a', text: 'True' },
      { id: 'q1-5-b', text: 'False' },
    ],
    points: 10
  }
];

const QuizAttempt = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<{
    points: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  
  // Fetch quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch this data from an API
        // For demo purposes, we'll use our mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setQuiz(mockQuiz);
        setQuestions(mockQuestions);
        
        // Set initial time remaining
        setTimeRemaining(mockQuiz.timeLimit * 60); // convert to seconds
      } catch (error) {
        console.error('Error loading quiz:', error);
        addToast({
          type: 'error',
          title: 'Failed to load quiz',
          message: 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [courseId, addToast]);
  
  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || quizSubmitted || isLoading) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, quizSubmitted, isLoading]);
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle answer selection
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };
  
  // Navigation between questions
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Flag question for review (in a real app, this would be more functional)
  const handleFlagQuestion = () => {
    addToast({
      type: 'info',
      title: 'Question Flagged',
      message: 'This question has been flagged for review',
    });
  };
  
  // Calculate quiz results
  const calculateResults = () => {
    // In a real app, we would validate against correct answers from the backend
    // For demo, we'll use hardcoded correct answers
    const correctAnswers: Record<string, string> = {
      'q1-1': 'q1-1-c', // Password manager
      'q1-2': 'q1-2-a', // True for MFA
      'q1-3': 'q1-3-c', // Data Compression is not an attack
      'q1-4': 'q1-4-b', // Delete suspicious emails
      'q1-5': 'q1-5-a', // True for updates
    };
    
    let pointsEarned = 0;
    
    Object.entries(answers).forEach(([questionId, selectedOptionId]) => {
      if (correctAnswers[questionId] === selectedOptionId) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          pointsEarned += question.points;
        }
      }
    });
    
    const percentage = Math.round((pointsEarned / mockQuiz.totalPoints) * 100);
    const passed = percentage >= mockQuiz.passingScore;
    
    return {
      points: pointsEarned,
      percentage,
      passed,
    };
  };
  
  // Submit quiz
  const handleSubmitQuiz = () => {
    if (!quizSubmitted) {
      const results = calculateResults();
      setScore(results);
      setQuizSubmitted(true);
      
      // In a real app, we would send results to the backend
      addToast({
        type: results.passed ? 'success' : 'warning',
        title: results.passed ? 'Quiz Completed Successfully' : 'Quiz Completed',
        message: results.passed 
          ? `You scored ${results.percentage}% and passed!` 
          : `You scored ${results.percentage}%. Required: ${mockQuiz.passingScore}%`,
      });
    }
  };
  
  // Confirm before submitting
  const confirmSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      const confirmSubmission = window.confirm(
        `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?`
      );
      
      if (confirmSubmission) {
        handleSubmitQuiz();
      }
    } else {
      handleSubmitQuiz();
    }
  };
  
  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion ? !!answers[currentQuestion.id] : false;
  };
  
  // Return to course
  const handleReturnToCourse = () => {
    navigate(`/courses/${courseId}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Results view after quiz submission
  if (quizSubmitted && score && quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-6">
                <div className={`text-6xl mb-4 ${score.passed ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {score.passed ? <CheckCircle size={80} /> : <XCircle size={80} />}
                </div>
                <h2 className="text-2xl font-bold dark:text-slate-100 mb-2">
                  {score.passed ? 'Congratulations!' : 'Not Passed'}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {score.passed 
                    ? `You've passed the quiz with a score of ${score.percentage}%!` 
                    : `You've scored ${score.percentage}%. Required: ${quiz.passingScore}%`}
                </p>
                
                <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Questions</p>
                      <p className="text-lg font-semibold dark:text-slate-200">{questions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Answered</p>
                      <p className="text-lg font-semibold dark:text-slate-200">{Object.keys(answers).length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
                      <p className="text-lg font-semibold dark:text-slate-200">{score.points} / {quiz.totalPoints}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Percentage</p>
                      <p className="text-lg font-semibold dark:text-slate-200">{score.percentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleReturnToCourse}>
                Return to Course
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Quiz attempt view
  if (quiz && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{quiz.title}</h1>
              <p className="text-slate-600 dark:text-slate-300">{quiz.courseName}</p>
            </div>
            
            {timeRemaining !== null && (
              <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-md border border-amber-200 dark:border-amber-800">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  Time Remaining: {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Question sidebar - only visible on md+ */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-5 gap-2 p-4">
                    {questions.map((q, index) => (
                      <button
                        key={q.id}
                        className={`h-8 w-full flex items-center justify-center rounded-md text-sm font-medium ${
                          currentQuestionIndex === index
                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                            : answers[q.id]
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800 p-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-sm bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-800 mr-2"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Answered</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mr-2"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Unanswered</span>
                      </div>
                    </div>
                    <Button 
                      onClick={confirmSubmit} 
                      fullWidth
                      leftIcon={<Save size={16} />}
                    >
                      Submit Quiz
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Question content */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {currentQuestion.points} points
                    </span>
                    <button
                      onClick={handleFlagQuestion}
                      className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      title="Flag for review"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium dark:text-slate-100 mb-4">
                      {currentQuestion.text}
                    </h3>
                    
                    <div className="space-y-2 mt-4">
                      {currentQuestion.options.map(option => (
                        <div
                          key={option.id}
                          onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                          className={`flex items-center p-3 rounded-md cursor-pointer ${
                            answers[currentQuestion.id] === option.id
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 border'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border ${
                            answers[currentQuestion.id] === option.id
                              ? 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-600'
                              : 'border-slate-300 dark:border-slate-600'
                          } flex items-center justify-center mr-3`}>
                            {answers[currentQuestion.id] === option.id && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="dark:text-slate-100">{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    leftIcon={<ChevronLeft size={16} />}
                  >
                    Previous
                  </Button>
                  
                  <div className="md:hidden">
                    <Button
                      variant={isCurrentQuestionAnswered() ? 'primary' : 'outline'}
                      onClick={handleNextQuestion}
                      rightIcon={<ChevronRight size={16} />}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="hidden md:block">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={confirmSubmit}
                        leftIcon={<Save size={16} />}
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        variant={isCurrentQuestionAnswered() ? 'primary' : 'outline'}
                        onClick={handleNextQuestion}
                        rightIcon={<ChevronRight size={16} />}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              {/* Mobile quiz control bar */}
              <div className="md:hidden mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium dark:text-slate-200">
                          {Object.keys(answers).length} of {questions.length} answered
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={confirmSubmit}
                        leftIcon={<Save size={16} />}
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback if quiz data isn't loaded properly
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto">
        <AlertCircle size={64} className="mx-auto text-amber-500 dark:text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold dark:text-slate-100 mb-2">Quiz Not Available</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          The requested quiz could not be loaded. Please try again later.
        </p>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          Return to Course
        </Button>
      </div>
    </div>
  );
};

export default QuizAttempt;