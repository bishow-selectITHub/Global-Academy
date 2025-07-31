"use client"

import type React from "react"
import { useEffect } from "react"
import {
  BookOpen,
  Award,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Star,
  Play,
  Activity,
  ChevronRight,
  BookMarked,
  GraduationCap,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentUser } from "../../store/userSlice"
import { fetchEnrollments } from "../../store/enrollmentsSlice"
import type { RootState } from "../../store"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "../../components/ui/Toaster"
import { useUser } from "../../contexts/UserContext"

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "text" | "quiz"
  videoUrl?: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  level: "beginner" | "intermediate" | "advanced"
  is_active: boolean
  instructor: string
  instructor_title: string
  instructor_avatar: string
  objectives: string[]
  category: "Technology" | "Food" | "Education" | "Travel" | "Life Lessons" | "Others"
  lessons: Lesson[]
  created_at: string
  updated_at: string
  progress?: number
  lastAccessed?: string
  nextLesson?: string
  enrolled?: number
  rating?: number
}

interface CourseEnrollment {
  courses: Course
}

const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType,
  iconBg,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  iconBg: string
}) => {
  const changeColor =
    changeType === "positive" ? "text-green-600" : changeType === "negative" ? "text-red-600" : "text-gray-600"

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <h4 className="text-lg font-bold text-gray-900 mb-1">{value}</h4>
          {change && (
            <div className={`text-xs flex items-center gap-1 ${changeColor}`}>
              {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
              <span className="font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-2 ${iconBg} rounded-lg shadow-sm`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  )
}

const ActivityItem = ({
  title,
  time,
  description,
  icon,
  iconBg,
}: {
  title: string
  time: string
  description: string
  icon: React.ReactNode
  iconBg: string
}) => (
  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
    <div className={`p-2 ${iconBg} rounded-lg flex-shrink-0 shadow-sm`}>
      <div className="text-white">{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h5 className="text-sm font-semibold text-gray-900 truncate">{title}</h5>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">{time}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
)

const LearnerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useUser()
  const courses = useSelector((state: RootState) => state.courses.data)
  const enrollments = useSelector((state: RootState) => state.enrollments.data)
  const loading = useSelector((state: RootState) => state.enrollments.loading)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  const recentActivity = [
    {
      title: "Course Progress",
      time: "2h ago",
      description: "Completed lesson 3 of Data Security Fundamentals",
      icon: <BookOpen className="w-4 h-4" />,
      iconBg: "bg-blue-600",
    },
    {
      title: "Quiz Completed",
      time: "1d ago",
      description: "Scored 95% on Client Communication assessment",
      icon: <Award className="w-4 h-4" />,
      iconBg: "bg-emerald-600",
    },
    {
      title: "New Enrollment",
      time: "3d ago",
      description: "Enrolled in Advanced Excel Techniques course",
      icon: <GraduationCap className="w-4 h-4" />,
      iconBg: "bg-indigo-600",
    },
  ]

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (user?.id && (!enrollments || enrollments.length === 0)) {
      dispatch(fetchEnrollments(user.id))
    }
  }, [dispatch, user?.id, enrollments])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Map courseId to enrollment for quick lookup
  const enrollmentMap = Object.fromEntries(
    enrollments.filter((e: any) => e.user_id === user.id).map((e: any) => [e.course_id, e]),
  )

  // Calculate learning stats
  const totalProgress = enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0)
  const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0
  const completedCourses = enrollments.filter((e: any) => (e.progress || 0) >= 100).length
  const totalLearningHours = enrollments.length * 2.5 // Estimate

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Courses in Progress"
            value={enrollments.length}
            icon={<BookOpen className="w-5 h-5" />}
            change="+2 this month"
            changeType="positive"
            iconBg="bg-blue-600"
          />
          <StatCard
            title="Certificates Earned"
            value={completedCourses}
            icon={<Award className="w-5 h-5" />}
            change="+1 this week"
            changeType="positive"
            iconBg="bg-emerald-600"
          />
          <StatCard
            title="Learning Hours"
            value={`${totalLearningHours}h`}
            icon={<Clock className="w-5 h-5" />}
            change="3.5h this week"
            changeType="positive"
            iconBg="bg-purple-600"
          />
          <StatCard
            title="Average Progress"
            value={`${avgProgress}%`}
            icon={<BarChart3 className="w-5 h-5" />}
            change="+12% this month"
            changeType="positive"
            iconBg="bg-amber-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Continue Learning Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Current Courses */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Continue Learning</h2>
                  </div>
                  <Link
                    to="/courses"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View All Courses
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="lg:w-32 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                            {enrollment.course.thumbnail ? (
                              <img
                                src={enrollment.course.thumbnail || "/placeholder.svg"}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  {enrollment.course.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Instructor: {enrollment.course.instructor || "TBD"}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {enrollment.course.level || "Beginner"}
                              </span>
                            </div>

                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-bold text-gray-900">{enrollment.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                <p>Last accessed: {enrollment.lastAccessed || "Recently"}</p>
                              </div>
                              <Link to={`/courses/${enrollment.course.id}`}>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                  <Play className="w-4 h-4" />
                                  Continue
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">No courses in progress</h3>
                    <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                    <Link to="/courses">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Browse Courses
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Available Courses */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <BookMarked className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Recommended Courses</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course: any) => {
                    const enrollment = enrollmentMap[course.id]
                    return (
                      <div
                        key={course.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 group"
                      >
                        <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {course.category || "General"}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {course.duration || "2h"}
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">4.8</span>
                              <span className="text-xs text-gray-500">(124)</span>
                            </div>
                            {enrollment ? (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                Continue
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                Enroll
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Learning Goals */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Learning Goals</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                      <span className="text-sm font-bold text-gray-900">3/5 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: "60%" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2 hours remaining this week</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Courses</span>
                      <span className="text-sm font-bold text-gray-900">1/2 completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: "50%" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">1 course to go this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboard
