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
import { supabase } from '../../../lib/supabase';

// Types
type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching';

interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: QuizQuestion[];
}

const QuizAttempt = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
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
      if (!courseId) {
        addToast({ type: 'error', title: 'Error', message: 'Course ID is missing.' });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quizes')
          .select('*')
          .eq('course_id', courseId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          addToast({ type: 'error', title: 'Quiz not found', message: 'There is no quiz associated with this course.' });
          navigate(`/courses/${courseId}`);
          return;
        }

        setQuiz(data);
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // convert to seconds
        }
      } catch (error: any) {
        console.error('Error loading quiz:', error);
        addToast({
          type: 'error',
          title: 'Failed to load quiz',
          message: error.message || 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [courseId, addToast, navigate]);

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
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
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
    if (!quiz) {
      return { points: 0, percentage: 0, passed: false };
    }

    let pointsEarned = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    quiz.questions.forEach(question => {
      const selectedOptionId = answers[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          pointsEarned += question.points;
        }
      }
    });

    const percentage = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    return {
      points: pointsEarned,
      percentage: percentage,
      passed: passed,
    };
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    if (quizSubmitted || !quiz) return;

    const results = calculateResults();
    setScore(results);
    setQuizSubmitted(true);

    // In a real app, we would send results to the backend
    addToast({
      type: results.passed ? 'success' : 'warning',
      title: results.passed ? 'Quiz Completed Successfully' : 'Quiz Completed',
      message: results.passed
        ? `You scored ${results.percentage}% and passed!`
        : `You scored ${results.percentage}%. Required: ${quiz.passingScore}%`,
    });
  };

  // Confirm before submitting
  const confirmSubmit = () => {
    const unansweredCount = quiz?.questions.length ? quiz.questions.length - Object.keys(answers).length : 0;

    if (unansweredCount > 0) {
      if (window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        handleSubmitQuiz();
      }
    } else {
      handleSubmitQuiz();
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    return currentQuestion ? !!answers[currentQuestion.id] : false;
  };

  // Return to course
  const handleReturnToCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
        <p className="text-slate-600 mb-6">We couldn't find the quiz for this course.</p>
        <Button onClick={handleReturnToCourse}>Return to Course</Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {!quizSubmitted ? (
        // Quiz attempt view
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{quiz.title}</CardTitle>
                <div className="text-sm text-slate-500">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-lg font-medium text-slate-800">{currentQuestion.text}</p>
                  <div className="text-sm text-slate-500 mt-1">
                    {currentQuestion.points} points
                  </div>
                </div>
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                        ${answers[currentQuestion.id] === option.id
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                          : 'border-slate-300 hover:border-blue-500'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0
                        ${answers[currentQuestion.id] === option.id
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-400'
                        }`}
                      ></div>
                      <span className="text-slate-700">{option.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeRemaining !== null ? (
                  <div className="text-4xl font-bold text-center text-slate-800">
                    {formatTime(timeRemaining)}
                  </div>
                ) : (
                  <div className="text-center text-slate-500">No time limit</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle size={20} className="mr-2" />
                  Quiz Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`h-10 w-10 rounded-md flex items-center justify-center font-medium
                        ${index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : answers[q.id]
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                leftIcon={<Flag size={16} />}
                onClick={handleFlagQuestion}
              >
                Flag for Review
              </Button>
              <Button
                variant="primary"
                leftIcon={<Save size={16} />}
                onClick={confirmSubmit}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Quiz result view
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {score ? (
              <>
                {score.passed ? (
                  <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                ) : (
                  <XCircle size={64} className="mx-auto text-red-500 mb-4" />
                )}
                <h2 className={`text-3xl font-bold ${score.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {score.passed ? 'Congratulations, you passed!' : 'Better luck next time!'}
                </h2>
                <p className="text-slate-600 mt-2 mb-6">
                  You needed a score of {quiz.passingScore}% to pass.
                </p>
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <div className="font-bold text-slate-800">{score.percentage}%</div>
                    <div className="text-sm text-slate-500">Your Score</div>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <div className="font-bold text-slate-800">{score.points} / {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</div>
                    <div className="text-sm text-slate-500">Points</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <AlertCircle size={48} className="text-slate-500 mb-4" />
                <p className="text-slate-600">Your results are being calculated.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleReturnToCourse}>
              Return to Course
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default QuizAttempt;