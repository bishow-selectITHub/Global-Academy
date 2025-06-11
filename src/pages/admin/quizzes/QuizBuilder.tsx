import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  Circle, 
  ArrowLeft,
  MoveUp,
  MoveDown,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Question types
type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching';

// Answer option
interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Question interface
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: AnswerOption[];
  points: number;
  explanation?: string;
}

// Quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  courseName?: string;
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  questions: Question[];
  isPublished: boolean;
}

const QuizBuilder = () => {
  // Sample initial quiz data
  const [quiz, setQuiz] = useState<Quiz>({
    id: 'q1',
    title: 'Data Security Fundamentals',
    description: 'Test your knowledge of basic data security concepts and best practices.',
    courseId: 'c2',
    courseName: 'Data Security Fundamentals',
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: 'q1-1',
        type: 'multiple-choice',
        text: 'Which of the following is the best practice for password management?',
        points: 10,
        options: [
          { id: 'q1-1-a', text: 'Using the same password for all accounts', isCorrect: false },
          { id: 'q1-1-b', text: 'Writing passwords down on sticky notes', isCorrect: false },
          { id: 'q1-1-c', text: 'Using a password manager with unique passwords', isCorrect: true },
          { id: 'q1-1-d', text: 'Sharing passwords with team members', isCorrect: false },
        ],
        explanation: 'Password managers allow you to create and store unique, complex passwords for each account, which is the most secure approach.'
      },
      {
        id: 'q1-2',
        type: 'true-false',
        text: 'Multi-factor authentication provides an additional layer of security beyond passwords.',
        points: 5,
        options: [
          { id: 'q1-2-a', text: 'True', isCorrect: true },
          { id: 'q1-2-b', text: 'False', isCorrect: false },
        ],
        explanation: 'Multi-factor authentication requires multiple forms of verification, making unauthorized access more difficult.'
      }
    ],
    isPublished: false
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Handler for updating quiz info
  const updateQuizInfo = (field: keyof Quiz, value: any) => {
    setQuiz((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for adding a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      text: '',
      options: [
        { id: `q-${Date.now()}-a`, text: '', isCorrect: false },
        { id: `q-${Date.now()}-b`, text: '', isCorrect: false },
      ],
      points: 10
    };

    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Set the new question as active
    setActiveQuestionIndex(quiz.questions.length);
  };

  // Handler for removing a question
  const removeQuestion = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));

    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null);
    } else if (activeQuestionIndex !== null && activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  // Handler for updating a question
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Handler for adding an option to a question
  const addOption = (questionIndex: number) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const optionId = `q-${Date.now()}-opt-${updatedQuestions[questionIndex].options.length}`;
      
      updatedQuestions[questionIndex].options.push({
        id: optionId,
        text: '',
        isCorrect: false
      });
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Handler for removing an option from a question
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Handler for updating an option
  const updateOption = (questionIndex: number, optionIndex: number, field: keyof AnswerOption, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options[optionIndex] = {
        ...updatedQuestions[questionIndex].options[optionIndex],
        [field]: value
      };
      
      // If setting this option as correct for multiple-choice, make others incorrect
      if (field === 'isCorrect' && value === true && updatedQuestions[questionIndex].type === 'multiple-choice') {
        updatedQuestions[questionIndex].options.forEach((option, i) => {
          if (i !== optionIndex) {
            option.isCorrect = false;
          }
        });
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Handler for moving a question up or down
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === quiz.questions.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });

    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(newIndex);
    } else if (activeQuestionIndex === newIndex) {
      setActiveQuestionIndex(index);
    }
  };

  // Handler for saving the quiz
  const saveQuiz = () => {
    // In a real app, this would send the quiz data to a backend API
    console.log('Saving quiz:', quiz);
    alert('Quiz saved successfully!');
  };

  // Handler for publishing the quiz
  const publishQuiz = () => {
    setQuiz((prev) => ({
      ...prev,
      isPublished: true
    }));
    
    // In a real app, this would make the quiz available to learners
    alert('Quiz published successfully!');
  };

  // Render the active question editor
  const renderQuestionEditor = () => {
    if (activeQuestionIndex === null) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
          <HelpCircle size={48} className="mb-3 text-slate-400" />
          <h3 className="text-lg font-medium mb-2">No Question Selected</h3>
          <p className="mb-4">Select a question from the list or add a new one to edit its details.</p>
          <Button onClick={addQuestion} leftIcon={<Plus size={16} />}>
            Add New Question
          </Button>
        </div>
      );
    }

    const question = quiz.questions[activeQuestionIndex];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Question {activeQuestionIndex + 1}</h3>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => moveQuestion(activeQuestionIndex, 'up')}
              disabled={activeQuestionIndex === 0}
              leftIcon={<MoveUp size={16} />}
            >
              Move Up
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => moveQuestion(activeQuestionIndex, 'down')}
              disabled={activeQuestionIndex === quiz.questions.length - 1}
              leftIcon={<MoveDown size={16} />}
            >
              Move Down
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => removeQuestion(activeQuestionIndex)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="question-type" className="block text-sm font-medium text-slate-700 mb-1">
              Question Type
            </label>
            <select
              id="question-type"
              value={question.type}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'type', e.target.value as QuestionType)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
              <option value="matching">Matching</option>
            </select>
          </div>

          <div>
            <Input
              id="question-text"
              label="Question Text"
              value={question.text}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'text', e.target.value)}
              placeholder="Enter your question here..."
              fullWidth
            />
          </div>

          <div>
            <Input
              id="question-points"
              label="Points"
              type="number"
              value={question.points.toString()}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'points', parseInt(e.target.value) || 0)}
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => updateOption(activeQuestionIndex, optionIndex, 'isCorrect', !option.isCorrect)}
                    className="flex-shrink-0"
                  >
                    {option.isCorrect ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Circle size={20} className="text-slate-400" />
                    )}
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(activeQuestionIndex, optionIndex, 'text', e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    fullWidth
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(activeQuestionIndex, optionIndex)}
                    disabled={question.options.length <= 2}
                    leftIcon={<Trash2 size={16} />}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOption(activeQuestionIndex)}
                leftIcon={<Plus size={16} />}
              >
                Add Option
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-slate-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              id="explanation"
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'explanation', e.target.value)}
              placeholder="Provide an explanation for the correct answer..."
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render quiz preview
  const renderQuizPreview = () => {
    return (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-800 mb-2">Quiz Preview</h3>
          <p className="text-sm text-blue-700">This is how the quiz will appear to learners.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-slate-600 mb-4">{quiz.description}</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 flex items-center">
              <Clock size={16} className="mr-1" />
              {quiz.timeLimit} minutes
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 flex items-center">
              <CheckCircle size={16} className="mr-1" />
              Passing: {quiz.passingScore}%
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 flex items-center">
              <HelpCircle size={16} className="mr-1" />
              {quiz.questions.length} questions
            </div>
          </div>
          
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="border border-slate-200 rounded-md p-4">
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <span className="text-sm text-slate-500">{question.points} points</span>
                </div>
                <p className="mb-4">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <div className="h-5 w-5 border border-slate-300 rounded-full"></div>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => setPreviewMode(false)}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Editor
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Builder</h1>
          <p className="text-slate-600">Create and manage quizzes for your courses</p>
        </div>
        <div className="flex space-x-3">
          {!previewMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setPreviewMode(true)}
                leftIcon={<BookOpen size={16} />}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={saveQuiz}
                leftIcon={<Save size={16} />}
              >
                Save Draft
              </Button>
              <Button
                onClick={publishQuiz}
                leftIcon={<CheckCircle size={16} />}
                disabled={quiz.questions.length === 0}
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      {previewMode ? (
        renderQuizPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="quiz-title"
                  label="Quiz Title"
                  value={quiz.title}
                  onChange={(e) => updateQuizInfo('title', e.target.value)}
                  fullWidth
                />
                
                <div>
                  <label htmlFor="quiz-description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="quiz-description"
                    value={quiz.description}
                    onChange={(e) => updateQuizInfo('description', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="time-limit"
                    label="Time Limit (minutes)"
                    type="number"
                    value={quiz.timeLimit?.toString() || ''}
                    onChange={(e) => updateQuizInfo('timeLimit', parseInt(e.target.value) || '')}
                    fullWidth
                  />
                  
                  <Input
                    id="passing-score"
                    label="Passing Score (%)"
                    type="number"
                    value={quiz.passingScore.toString()}
                    onChange={(e) => updateQuizInfo('passingScore', parseInt(e.target.value) || 0)}
                    fullWidth
                  />
                </div>
                
                <div>
                  <label htmlFor="course-select" className="block text-sm font-medium text-slate-700 mb-1">
                    Associated Course
                  </label>
                  <select
                    id="course-select"
                    value={quiz.courseId || ''}
                    onChange={(e) => updateQuizInfo('courseId', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a course</option>
                    <option value="c1">Onboarding Essentials</option>
                    <option value="c2">Data Security Fundamentals</option>
                    <option value="c3">Client Communication</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quiz.questions.length > 0 ? (
                    quiz.questions.map((question, index) => (
                      <div 
                        key={question.id}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-slate-50 ${
                          activeQuestionIndex === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                        }`}
                        onClick={() => setActiveQuestionIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Question {index + 1}</div>
                          <div className="text-sm text-slate-500">{question.points} pts</div>
                        </div>
                        <div className="text-sm truncate mt-1">
                          {question.text || <span className="text-slate-400">No question text</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      No questions added yet
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={addQuestion} 
                  variant="outline" 
                  fullWidth
                  leftIcon={<Plus size={16} />}
                >
                  Add Question
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeQuestionIndex === null 
                    ? 'Question Editor' 
                    : `Edit Question ${activeQuestionIndex + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderQuestionEditor()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;

// Add missing import for Clock component
import { Clock } from 'lucide-react';