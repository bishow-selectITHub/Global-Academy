"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Circle,
  ArrowLeft,
  MoveUp,
  MoveDown,
  HelpCircle,
  Clock,
  GripVertical,
  Eye,
  Settings,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { supabase } from "../../../lib/supabase"
import { useToast } from "../../../components/ui/Toaster"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { DragEndEvent } from "@dnd-kit/core"

// Question types
type QuestionType = "multiple-choice" | "true-false" | "short-answer" | "matching"

// Answer option
interface AnswerOption {
  id: string
  text: string
  isCorrect: boolean
}

// Question interface
interface Question {
  id: string
  type: QuestionType
  text: string
  options: AnswerOption[]
  points: number
  explanation?: string
}

// Quiz interface
interface Quiz {
  id: string
  title: string
  description: string
  courseId?: string
  courseName?: string
  timeLimit?: number // in minutes
  passingScore: number // percentage
  questions: Question[]
  isPublished: boolean
}

// Props for SortableQuestionItem
interface SortableQuestionItemProps {
  id: string
  index: number
  question: Question
  activeQuestionIndex: number | null
  setActiveQuestionIndex: (index: number) => void
}

// SortableQuestionItem component
const SortableQuestionItem = ({
  id,
  index,
  question,
  activeQuestionIndex,
  setActiveQuestionIndex,
}: SortableQuestionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isActive = activeQuestionIndex === index

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isActive ? "border-blue-300 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between" onClick={() => setActiveQuestionIndex(index)}>
        <div className="flex items-center space-x-3">
          <div
            {...listeners}
            className="cursor-grab p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">Question {index + 1}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {question.type.replace("-", " ")}
              </span>
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {question.text || <span className="text-gray-400 italic">No question text</span>}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">{question.points} pts</div>
      </div>
    </div>
  )
}

const QuizBuilder = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { addToast } = useToast()
  const [quiz, setQuiz] = useState<Quiz>({
    id: "",
    title: "",
    description: "",
    courseId: courseId,
    courseName: "",
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    isPublished: false,
  })
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!courseId) {
        addToast({ type: "error", title: "No Course ID provided." })
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .single()
        if (courseError) throw new Error(`Failed to fetch course: ${courseError.message}`)
        if (!course) throw new Error("Course not found")

        const { data: existingQuiz, error: quizError } = await supabase
          .from("quizes")
          .select("*")
          .eq("course_id", courseId)
          .maybeSingle()
        if (quizError) throw new Error(`Failed to fetch quiz: ${quizError.message}`)

        if (existingQuiz) {
          setQuiz({
            id: existingQuiz.id,
            title: existingQuiz.title || "",
            description: existingQuiz.description || "",
            courseId: existingQuiz.course_id,
            courseName: course.title,
            timeLimit: existingQuiz.timeLimit ?? 30,
            passingScore: existingQuiz.passingScore ?? 70,
            questions: existingQuiz.questions || [],
            isPublished: existingQuiz.isPublished || false,
          })
        } else {
          setQuiz((prev) => ({
            ...prev,
            title: `${course.title} Quiz`,
            description: `A quiz for the course: ${course.title}.`,
            courseName: course.title,
          }))
        }
      } catch (err: any) {
        addToast({ type: "error", title: "Error loading quiz data", message: err.message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizData()
  }, [courseId, addToast])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("id, title")
        if (error) throw error
        setCourses(data || [])
      } catch (err: any) {
        addToast({ type: "error", title: "Error loading courses", message: err.message })
      }
    }
    fetchCourses()
  }, [addToast])

  // Handler for updating quiz info
  const updateQuizInfo = (field: keyof Quiz, value: any) => {
    setQuiz((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handler for adding a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: "multiple-choice",
      text: "",
      options: [
        { id: `q-${Date.now()}-a`, text: "", isCorrect: false },
        { id: `q-${Date.now()}-b`, text: "", isCorrect: false },
      ],
      points: 10,
    }
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
    setActiveQuestionIndex(quiz.questions.length)
  }

  // Handler for removing a question
  const removeQuestion = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null)
    } else if (activeQuestionIndex !== null && activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  // Handler for updating a question
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      }
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  // Handler for adding an option to a question
  const addOption = (questionIndex: number) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions]
      const optionId = `q-${Date.now()}-opt-${updatedQuestions[questionIndex].options.length}`
      updatedQuestions[questionIndex].options.push({
        id: optionId,
        text: "",
        isCorrect: false,
      })
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  // Handler for removing an option from a question
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex,
      )
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  // Handler for updating an option
  const updateOption = (questionIndex: number, optionIndex: number, field: keyof AnswerOption, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[questionIndex].options[optionIndex] = {
        ...updatedQuestions[questionIndex].options[optionIndex],
        [field]: value,
      }
      // If setting this option as correct for multiple-choice, make others incorrect
      if (field === "isCorrect" && value === true && updatedQuestions[questionIndex].type === "multiple-choice") {
        updatedQuestions[questionIndex].options.forEach((option, i) => {
          if (i !== optionIndex) {
            option.isCorrect = false
          }
        })
      }
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  // Handler for moving a question up or down
  const moveQuestion = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === quiz.questions.length - 1)) {
      return
    }
    const newIndex = direction === "up" ? index - 1 : index + 1
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions]
      ;[updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]]
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(newIndex)
    } else if (activeQuestionIndex === newIndex) {
      setActiveQuestionIndex(index)
    }
  }

  // Handler for saving the quiz
  const saveQuiz = async (publish = false) => {
    if (!courseId) {
      addToast({ type: "error", title: "Error", message: "Course ID is missing." })
      return
    }
    // Validation: Each question must have exactly one correct answer
    for (const [idx, question] of quiz.questions.entries()) {
      const correctCount = question.options.filter((opt) => opt.isCorrect).length
      if (correctCount !== 1) {
        addToast({
          type: "error",
          title: "Validation Error",
          message: `Question ${idx + 1} must have exactly one correct answer.`,
        })
        return
      }
    }

    const quizDataForDb = {
      course_id: courseId,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: quiz.questions,
      isPublished: publish,
    }

    try {
      let response
      if (quiz.id) {
        // Update existing quiz
        response = await supabase.from("quizes").update(quizDataForDb).eq("id", quiz.id).select().single()
      } else {
        // Insert new quiz
        response = await supabase.from("quizes").insert(quizDataForDb).select().single()
      }

      const { data: savedQuiz, error } = response
      if (error) throw error

      setQuiz((prev) => ({ ...prev, ...savedQuiz, courseId: savedQuiz.course_id }))
      addToast({
        type: "success",
        title: `Quiz ${publish ? "Published" : "Saved"}!`,
        message: "Your changes have been saved.",
      })
    } catch (err: any) {
      addToast({ type: "error", title: `Error ${publish ? "saving" : "saving"} quiz`, message: err.message })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setQuiz((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
        const newIndex = prev.questions.findIndex((q) => q.id === over.id)
        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        }
      })
    }
  }

  // Render the active question editor
  const renderQuestionEditor = () => {
    if (activeQuestionIndex === null) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Selected</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Select a question from the sidebar to edit its details, or create a new question to get started.
          </p>
          <button
            onClick={addQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Question
          </button>
        </div>
      )
    }

    const question = quiz.questions[activeQuestionIndex]

    return (
      <div className="space-y-8">
        {/* Question Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Question {activeQuestionIndex + 1}</h3>
            <p className="text-sm text-gray-600 mt-1">Configure your question settings and options</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveQuestion(activeQuestionIndex, "up")}
              disabled={activeQuestionIndex === 0}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveQuestion(activeQuestionIndex, "down")}
              disabled={activeQuestionIndex === quiz.questions.length - 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeQuestion(activeQuestionIndex)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
            <select
              value={question.type}
              onChange={(e) => updateQuestion(activeQuestionIndex, "type", e.target.value as QuestionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
              <option value="matching">Matching</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
            <input
              type="number"
              value={question.points.toString()}
              onChange={(e) => updateQuestion(activeQuestionIndex, "points", Number.parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              min="1"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
          <textarea
            value={question.text}
            onChange={(e) => updateQuestion(activeQuestionIndex, "text", e.target.value)}
            placeholder="Enter your question here..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            rows={3}
          />
        </div>

        {/* Answer Options */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Answer Options</label>
            <button
              onClick={() => addOption(activeQuestionIndex)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <div
                key={option.id}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => updateOption(activeQuestionIndex, optionIndex, "isCorrect", !option.isCorrect)}
                  className="flex-shrink-0"
                >
                  {option.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                <input
                  value={option.text}
                  onChange={(e) => updateOption(activeQuestionIndex, optionIndex, "text", e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 px-3 py-2 border-0 focus:ring-0 text-sm bg-transparent"
                />
                <button
                  onClick={() => removeOption(activeQuestionIndex, optionIndex)}
                  disabled={question.options.length <= 2}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={question.explanation || ""}
            onChange={(e) => updateQuestion(activeQuestionIndex, "explanation", e.target.value)}
            placeholder="Provide an explanation for the correct answer..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            rows={3}
          />
        </div>
      </div>
    )
  }

  // Render quiz preview
  const renderQuizPreview = () => {
    return (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Quiz Preview</h3>
          </div>
          <p className="text-sm text-blue-700">This is how the quiz will appear to your students.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{quiz.title}</h2>
            <p className="text-gray-600 mb-6">{quiz.description}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {quiz.timeLimit} minutes
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Passing: {quiz.passingScore}%
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {quiz.questions.length} questions
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{question.points} points</span>
                </div>
                <p className="text-gray-800 mb-6">{question.text}</p>
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-gray-700">{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setPreviewMode(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading quiz builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin/quizzes" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Quiz Builder</h1>
            </div>
            <p className="text-sm text-gray-600">Create and manage quiz questions for your course</p>
          </div>
          <div className="flex items-center space-x-3">
            {!previewMode && (
              <>
                <button
                  onClick={() => setPreviewMode(true)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => saveQuiz(false)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  onClick={() => saveQuiz(true)}
                  disabled={quiz.questions?.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish Quiz
                </button>
              </>
            )}
          </div>
        </div>

        {previewMode ? (
          renderQuizPreview()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quiz Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Quiz Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                    <input
                      value={quiz.title || ""}
                      onChange={(e) => updateQuizInfo("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={quiz.description || ""}
                      onChange={(e) => updateQuizInfo("description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      rows={3}
                      placeholder="Brief description of the quiz"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time (min)</label>
                      <input
                        type="number"
                        value={quiz.timeLimit?.toString() ?? ""}
                        onChange={(e) =>
                          updateQuizInfo(
                            "timeLimit",
                            e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pass %</label>
                      <input
                        type="number"
                        value={quiz.passingScore?.toString() ?? ""}
                        onChange={(e) => updateQuizInfo("passingScore", Number.parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Questions ({quiz.questions?.length || 0})</h3>
                  <button
                    onClick={addQuestion}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={quiz.questions?.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {quiz.questions?.length > 0 ? (
                        quiz.questions?.map((question, index) => (
                          <SortableQuestionItem
                            key={question.id}
                            id={question.id}
                            index={index}
                            question={question}
                            activeQuestionIndex={activeQuestionIndex}
                            setActiveQuestionIndex={setActiveQuestionIndex}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm">No questions yet</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-8">{renderQuestionEditor()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizBuilder
