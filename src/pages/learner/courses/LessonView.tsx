"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
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
  Clock,
} from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent } from "../../../components/ui/Card"
import { useToast } from "../../../components/ui/Toaster"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateEnrollment } from "../../../store/enrollmentsSlice"
import type { RootState } from "../../../store"
import { supabase } from "../../../lib/supabase"
import { useUser } from "../../../contexts/UserContext"
import type { AppDispatch } from "../../../store" // Import AppDispatch

interface Lesson {
  id: string
  type: "video" | "text" | "quiz"
  title: string
  video?: any
  duration: string
  videoUrl: string
  completed: boolean
  content?: string
  resources?: any[]
  custom_fields?: any
  notes?: string
  time_spent?: number
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  lessons: Lesson[]
  progress: number
  [key: string]: any // for any extra fields
}

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const { user } = useUser()
  const [hasQuiz, setHasQuiz] = useState(false)
  const dispatch: AppDispatch = useDispatch() // Declare dispatch with AppDispatch type

  // Defensive checks for slices
  const courseSlice = useSelector((state: RootState) => state.courses || { data: [] })
  const enrollmentSlice = useSelector((state: RootState) => state.enrollments || { data: [] })

  const course = courseSlice.data.find((c: any) => c.id === courseId)
  const enrollment: Enrollment | undefined = (enrollmentSlice.data as Enrollment[]).find(
    (e) => e.course?.id === courseId,
  )

  const courseLessons = useMemo(() => course?.lessons || [], [course?.lessons])
  const enrollmentLessons = useMemo(() => enrollment?.lessons || [], [enrollment?.lessons])

  // Merge course lessons with enrollment completion status
  const userLessons = useMemo(() => {
    return courseLessons.map((courseLesson: any) => {
      const enrollmentLesson = enrollmentLessons.find((el: any) => el.id === courseLesson.id)
      return {
        ...courseLesson,
        completed: enrollmentLesson?.completed || false,
      }
    })
  }, [courseLessons, enrollmentLessons])

  const lesson = userLessons.find((l: any) => l.id === lessonId)

  const [localLessons, setLocalLessons] = useState<Lesson[]>(userLessons)
  const [localProgress, setLocalProgress] = useState<number>(enrollment?.progress || 0)

  // Helper function to calculate accurate progress
  const calculateProgress = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return 0
    const completedCount = lessons.filter(lesson => lesson.completed).length
    return Math.round((completedCount / lessons.length) * 100)
  }

  // Helper function to get lesson completion status
  const getLessonCompletionStatus = (lessonId: string) => {
    if (!enrollment?.lessons) return false
    const lesson = enrollment.lessons.find((l: any) => l.id === lessonId)
    return lesson?.completed || false
  }

  useEffect(() => {
    setLocalLessons(userLessons)
  }, [userLessons])

  useEffect(() => {
    setLocalProgress(enrollment?.progress || 0)
  }, [enrollment?.progress])

  useEffect(() => {
    const checkQuiz = async () => {
      if (!courseId) return
      const { data, error } = await supabase.from("quizes").select("id").eq("course_id", courseId).maybeSingle()
      setHasQuiz(!!data && !error)
    }
    checkQuiz()
  }, [courseId])

  if (!lesson || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Lesson not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The lesson you're looking for doesn't exist or has been removed.
        </p>
        <Link to={`/courses/${courseId}`}>
          <Button>Back to Course</Button>
        </Link>
      </div>
    )
  }

  const markAsComplete = async () => {
    try {
      if (!user || !courseId) {
        throw new Error("User or course not found")
      }

      // Check if lesson is already completed
      if (lesson.completed) {
        addToast({
          type: "info",
          title: "Lesson Already Completed",
          message: "This lesson has already been marked as complete.",
          duration: 3000,
        })
        return
      }

      // 1. Update local instantly (optimistic UI)
      const updatedLessons = localLessons.map((l) => (l.id === lessonId ? { ...l, completed: true } : l))
      const newProgress = calculateProgress(updatedLessons)

      setLocalLessons(updatedLessons)
      setLocalProgress(newProgress)

      // 2. Prepare lessons data for database storage
      // Merge with existing lesson data to preserve any additional information
      const existingLessons = enrollment?.lessons || []
      const lessonsForStorage = updatedLessons.map((lesson) => {
        const existingLesson = existingLessons.find((el: any) => el.id === lesson.id)
        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          completed: lesson.completed,
          completed_at: lesson.completed ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
          // Preserve any existing custom fields
          ...(existingLesson && { 
            custom_fields: existingLesson.custom_fields,
            notes: existingLesson.notes,
            time_spent: existingLesson.time_spent
          })
        }
      })

      // Validate data before sending
      if (!lessonsForStorage || lessonsForStorage.length === 0) {
        throw new Error("Invalid lessons data")
      }

      // Validate that the lesson being completed exists
      const lessonToComplete = lessonsForStorage.find(l => l.id === lessonId)
      if (!lessonToComplete) {
        throw new Error("Lesson not found in course data")
      }

      // Validate progress calculation
      if (newProgress < 0 || newProgress > 100) {
        throw new Error("Invalid progress calculation")
      }

      // 3. Update database directly first
      if (!enrollment) {
        // Try to create an enrollment if it doesn't exist
        console.log("No enrollment found, attempting to create one...")
        
        const { data: newEnrollment, error: createError } = await supabase
          .from("course_enrollments")
          .insert({
            user_id: user.id,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            progress: 0,
            lessons: [],
            status: "active"
          })
          .select()
          .single()

        if (createError) {
          console.error("Failed to create enrollment:", createError)
          throw new Error("Failed to create enrollment. Please try enrolling in the course first.")
        }

        console.log("New enrollment created:", newEnrollment)
      }

      // Update the course_enrollments table directly
      const { data: updateResult, error: updateError } = await supabase
        .from("course_enrollments")
        .update({
          lessons: lessonsForStorage,
          progress: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .select()

      if (updateError) {
        console.error("Database update error:", updateError)
        throw new Error(`Failed to update database: ${updateError.message}`)
      }

      console.log("Database updated successfully:", updateResult)

      // 4. Update Redux store
      const result = await dispatch(
        updateEnrollment({
          userId: user.id,
          courseId,
          lessons: lessonsForStorage,
          progress: newProgress,
        }),
      )

      // Refresh enrollment data to ensure UI is in sync
      try {
        const { data: refreshedEnrollment, error: refreshError } = await supabase
          .from("course_enrollments")
          .select("*, course:courses(*)")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single()

        if (!refreshError && refreshedEnrollment) {
          console.log("Enrollment data refreshed:", refreshedEnrollment)
          // Update local state with fresh data
          setLocalProgress(refreshedEnrollment.progress || 0)
        }
      } catch (refreshError) {
        console.warn("Failed to refresh enrollment data:", refreshError)
      }

      // 5. Show success message
      addToast({
        type: "success",
        title: "Lesson Completed! 🎉",
        message: `Great job! You've completed "${lesson.title}"`,
        duration: 3000,
      })

      // Log completion for debugging
      console.log(`Lesson completed: ${lesson.title} (${lesson.id})`)
      console.log(`New progress: ${newProgress}%`)
      console.log(`Completed lessons: ${updatedLessons.filter(l => l.completed).length}/${updatedLessons.length}`)
      console.log("Lessons data saved to database:", lessonsForStorage)

      // 6. Navigation
      const currentIndex = localLessons.findIndex((l) => l.id === lessonId)
      const isLastLesson = currentIndex === localLessons.length - 1

      if (isLastLesson && newProgress === 100) {
        addToast({
          type: "success",
          title: "🎉 Course Completed!",
          message: "Congratulations! You've finished all lessons in this course!",
          duration: 5000,
        })

        // Update course completion status in the database
        try {
          const { error: completionError } = await supabase
            .from("course_enrollments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("course_id", courseId)

          if (completionError) {
            console.warn("Failed to update course completion status:", completionError)
          } else {
            console.log("Course marked as completed in database")
          }
        } catch (completionError) {
          console.warn("Failed to update course completion status:", completionError)
        }

        setTimeout(() => {
          navigate(`/courses/${courseId}`)
        }, 2000)
      } else if (currentIndex < localLessons.length - 1) {
        const nextLesson = localLessons[currentIndex + 1]
        setTimeout(() => {
          navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)
        }, 1000) // slightly longer delay to show completion message
      }
    } catch (error: any) {
      // Revert optimistic updates on error
      setLocalLessons(userLessons)
      setLocalProgress(enrollment?.progress || 0)
      
      console.error("Lesson completion error:", error)
      
      addToast({
        type: "error",
        title: "Error updating progress",
        message: error.message,
        duration: 5000,
      })
    }
  }

  const handleSaveNotes = () => {
    // In a real app, this would save to the database
    addToast({
      type: "success",
      title: "Notes saved",
      duration: 3000,
    })
  }

  // Navigate to previous/next lesson
  const navigateLesson = (direction: "prev" | "next") => {
    const currentIndex = localLessons.findIndex((l: Lesson) => l.id === lessonId)

    if (currentIndex !== undefined) {
      if (direction === "prev" && currentIndex > 0) {
        const prevLesson = localLessons[currentIndex - 1]
        navigate(`/courses/${courseId}/lessons/${prevLesson?.id}`)
      } else if (direction === "next" && currentIndex < (localLessons.length || 0) - 1) {
        const nextLesson = localLessons[currentIndex + 1]
        navigate(`/courses/${courseId}/lessons/${nextLesson?.id}`)
      }
    }
  }

  const allLessonsCompleted = localLessons.length > 0 && localLessons.every((l) => l.completed)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Course</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateLesson("prev")}
              disabled={localLessons.findIndex((l: Lesson) => l.id === lessonId) === 0}
              leftIcon={<ArrowLeft size={16} />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateLesson("next")}
              disabled={localLessons.findIndex((l: Lesson) => l.id === lessonId) === localLessons.length - 1}
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
                {lesson.type === "video" && <Video size={20} className="text-red-500 dark:text-red-400 mr-2" />}
                {lesson.type === "text" && <FileText size={20} className="text-blue-500 dark:text-blue-400 mr-2" />}
                {lesson.type === "quiz" && <Award size={20} className="text-amber-500 dark:text-amber-400 mr-2" />}
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
              </div>
              {lesson.duration && (
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Clock size={16} className="mr-1" />
                  <span>{lesson.duration}</span>
                </div>
              )}
            </div>

            {lesson.type === "video" && lesson.videoUrl && (
              <div className="aspect-video bg-slate-900 rounded-lg mb-6">
                <video src={lesson.videoUrl} controls className="w-full h-full rounded-lg" />
              </div>
            )}

            {lesson.type === "text" && lesson.content && (
              <div
                className="prose dark:prose-invert max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            )}

                         <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
               <div className="flex space-x-2">
                 <Button
                   variant="outline"
                   size="sm"
                   leftIcon={<Bookmark size={16} />}
                   onClick={() =>
                     addToast({
                       type: "success",
                       title: "Bookmarked",
                       message: "Lesson added to your bookmarks",
                       duration: 3000,
                     })
                   }
                 >
                   Bookmark
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   leftIcon={<MessageSquare size={16} />}
                   onClick={() => setShowNotes(!showNotes)}
                 >
                   {showNotes ? "Hide Notes" : "Add Notes"}
                 </Button>
               </div>

               <div className="flex space-x-3">
                 {lesson.completed ? (
                   <div className="flex items-center text-green-600 dark:text-green-400">
                     <CheckCircle size={18} className="mr-1" />
                     <span>Completed</span>
                   </div>
                 ) : (
                   <Button onClick={markAsComplete} leftIcon={<CheckCircle size={16} />}>
                     Mark as Complete
                   </Button>
                 )}
               </div>
             </div>

             {/* Course Completion Button - Shows when all lessons are completed */}
             {localProgress === 100 && (
               <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <CheckCircle size={24} className="text-green-600 dark:text-green-400 mr-3" />
                     <div>
                       <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                         🎉 Course Completed!
                       </h3>
                       <p className="text-green-600 dark:text-green-400 text-sm">
                         Congratulations! You've finished all lessons in this course.
                       </p>
                     </div>
                   </div>
                   <div className="flex space-x-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => navigate(`/courses/${courseId}`)}
                       className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800"
                     >
                       Back to Course
                     </Button>
                     {hasQuiz && (
                       <Button
                         size="sm"
                         onClick={() => navigate(`/courses/${courseId}/quizzes/attempt`)}
                         className="bg-green-600 hover:bg-green-700 text-white"
                       >
                         Take Quiz
                       </Button>
                     )}
                   </div>
                 </div>
               </div>
             )}

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
                  <Button size="sm" variant="outline" onClick={handleSaveNotes}>
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
                  onClick={() =>
                    addToast({
                      type: "success",
                      title: "Thank you for your feedback!",
                      duration: 3000,
                    })
                  }
                >
                  Yes, it was helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ThumbsDown size={16} />}
                  onClick={() =>
                    addToast({
                      type: "info",
                      title: "Thanks for your feedback",
                      message: "We'll work on improving this lesson",
                      duration: 3000,
                    })
                  }
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {resource.type.toUpperCase()} Document
                      </p>
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
              <span className="text-sm text-slate-600 dark:text-slate-400">{localProgress}% complete</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {localLessons.filter((l: Lesson) => l.completed).length} of {localLessons.length} lessons
              </span>
            </div>
            {localProgress > 0 && (
              <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                {localProgress === 100 ? "🎉 Course completed!" : `${localLessons.length - localLessons.filter((l: Lesson) => l.completed).length} lessons remaining`}
              </div>
            )}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                style={{ width: `${localProgress}%` }}
              ></div>
            </div>

            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Lesson Navigator</h3>
            <div className="space-y-1">
              {localLessons.map((courseLesson: Lesson) => (
                <Link
                  key={courseLesson.id}
                  to={`/courses/${courseId}/lessons/${courseLesson.id}`}
                  className={`flex items-center px-3 py-2 rounded-md ${courseLesson.id === lessonId
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  {courseLesson.completed ? (
                    <CheckCircle size={16} className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                  ) : (
                    <div
                      className={`w-4 h-4 flex items-center justify-center rounded-full mr-2 flex-shrink-0 ${courseLesson.id === lessonId
                          ? "border-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-400"
                          : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      <span className="text-xs">{localLessons.indexOf(courseLesson) + 1}</span>
                    </div>
                  )}
                  <span
                    className={`text-sm truncate ${courseLesson.id === lessonId
                        ? "font-medium text-blue-700 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {courseLesson.title}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              {allLessonsCompleted ? (
                <>
                  <Button
                    fullWidth
                    leftIcon={<CheckCircle size={16} />}
                    disabled
                    className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                  >
                    Completed
                  </Button>
                  {hasQuiz && (
                    <Button
                      className="mt-3 bg-transparent"
                      fullWidth
                      variant="outline"
                      onClick={() => navigate(`/courses/${courseId}/quizzes/attempt`)}
                    >
                      Take the quiz
                    </Button>
                  )}
                </>
              ) : !lesson.completed ? (
                <Button onClick={markAsComplete} leftIcon={<CheckCircle size={16} />} fullWidth>
                  Complete & Continue
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigateLesson("next")}
                  rightIcon={<ArrowRight size={16} />}
                  fullWidth
                  disabled={localLessons.findIndex((l: Lesson) => l.id === lessonId) === localLessons.length - 1}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LessonView
