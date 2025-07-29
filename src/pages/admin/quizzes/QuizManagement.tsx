"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../../../lib/supabase"
import { useToast } from "../../../components/ui/Toaster"
import { Plus, Edit, CheckCircle, FileText, HelpCircle } from "lucide-react"

interface CourseWithQuiz {
  id: string
  title: string
  thumbnail: string
  quizStatus: "Published" | "Draft" | "No Quiz"
  questionCount: number
}

const QuizManagement = () => {
  const [courses, setCourses] = useState<CourseWithQuiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchCoursesAndQuizzes = async () => {
      setIsLoading(true)
      try {
        const { data: coursesData, error: coursesError } = await supabase.from("courses").select("id, title, thumbnail")

        if (coursesError) throw coursesError
        if (!coursesData) return

        const courseIds = coursesData.map((c) => c.id)
        const { data: quizzesData, error: quizzesError } = await supabase
          .from("quizes")
          .select("course_id, isPublished, questions")
          .in("course_id", courseIds)

        if (quizzesError) throw quizzesError

        const coursesWithQuizInfo = coursesData.map((course) => {
          const quiz = quizzesData?.find((q) => q.course_id === course.id)
          let quizStatus: "Published" | "Draft" | "No Quiz" = "No Quiz"
          if (quiz) {
            quizStatus = quiz.isPublished ? "Published" : "Draft"
          }

          const questionCount = quiz?.questions?.length || 0

          return {
            ...course,
            quizStatus,
            questionCount,
          }
        })

        setCourses(coursesWithQuizInfo)
      } catch (err: any) {
        addToast({ type: "error", title: "Error fetching data", message: err.message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoursesAndQuizzes()
  }, [addToast])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Published":
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case "Draft":
        return <Edit className="w-3 h-3 text-yellow-600" />
      default:
        return <HelpCircle className="w-3 h-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-50 text-green-700 border-green-200"
      case "Draft":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Quiz Management</h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage quizzes for your courses</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-4 h-4" />
              <span>{courses.length} courses</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Published Quizzes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {courses.filter((c) => c.quizStatus === "Published").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Draft Quizzes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {courses.filter((c) => c.quizStatus === "Draft").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Edit className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">No Quiz</p>
                <p className="text-lg font-semibold text-gray-900">
                  {courses.filter((c) => c.quizStatus === "No Quiz").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"
            >
              {/* Course Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-xs">No thumbnail</p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                      course.quizStatus,
                    )}`}
                  >
                    {getStatusIcon(course.quizStatus)}
                    <span>{course.quizStatus}</span>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2 leading-tight">{course.title}</h3>

                {/* Quiz Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Quiz Status:</span>
                    <span className="font-medium text-gray-900">{course.quizStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium text-gray-900">
                      {course.questionCount > 0 ? `${course.questionCount} questions` : "No questions"}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link to={`/admin/courses/${course.id}/quiz`} className="block">
                  <button
                    className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                      course.quizStatus === "No Quiz"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {course.quizStatus === "No Quiz" ? (
                      <>
                        <Plus className="w-3 h-3" />
                        Create Quiz
                      </>
                    ) : (
                      <>
                        <Edit className="w-3 h-3" />
                        Edit Quiz
                      </>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500 text-xs mb-4">Create some courses first to start building quizzes.</p>
            <Link
              to="/admin/courses/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm inline-flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizManagement
