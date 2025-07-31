"use client"

import type React from "react"
import { useEffect } from "react"
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Star,
  Play,
  Activity,
  ChevronRight,
  Trophy,
  Zap,
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
  description,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  iconBg: string
  description?: string
}) => {
  const changeColor =
    changeType === "positive" ? "text-green-600" : changeType === "negative" ? "text-red-600" : "text-gray-600"

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">{value}</h4>
          {change && (
            <div className={`text-sm flex items-center gap-1.5 ${changeColor}`}>
              {changeType === "positive" && <TrendingUp className="w-4 h-4" />}
              <span className="font-medium">{change}</span>
            </div>
          )}
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-2.5 ${iconBg} rounded-xl shadow-sm`}>
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
  <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150">
    <div className={`p-2.5 ${iconBg} rounded-lg flex-shrink-0 shadow-sm`}>
      <div className="text-white">{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h5 className="text-sm font-semibold text-gray-900 truncate">{title}</h5>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">{time}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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

  const achievements = [
    {
      id: "1",
      title: "First Course Completed",
      date: "Apr 15, 2025",
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconBg: "bg-green-600",
      description: "Completed your first learning journey",
    },
    {
      id: "2",
      title: "Perfect Quiz Score",
      date: "Apr 22, 2025",
      icon: <Trophy className="w-5 h-5" />,
      iconBg: "bg-amber-600",
      description: "Scored 100% on Data Security quiz",
    },
    {
      id: "3",
      title: "Learning Streak",
      date: "Apr 25, 2025",
      icon: <Zap className="w-5 h-5" />,
      iconBg: "bg-purple-600",
      description: "7 days of continuous learning",
    },
  ]

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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-600 mt-1">
              Your learning journey continues. You have {enrollments.length} courses in progress.
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Courses in Progress"
            value={enrollments.length}
            icon={<BookOpen className="w-6 h-6" />}
            change="+2 this month"
            changeType="positive"
            iconBg="bg-blue-600"
            description="Active learning paths"
          />
          <StatCard
            title="Certificates Earned"
            value={completedCourses}
            icon={<Award className="w-6 h-6" />}
            change="+1 this week"
            changeType="positive"
            iconBg="bg-emerald-600"
            description="Completed achievements"
          />
          <StatCard
            title="Learning Hours"
            value={`${totalLearningHours}h`}
            icon={<Clock className="w-6 h-6" />}
            change="3.5h this week"
            changeType="positive"
            iconBg="bg-purple-600"
            description="Total time invested"
          />
          <StatCard
            title="Average Progress"
            value={`${avgProgress}%`}
            icon={<BarChart3 className="w-6 h-6" />}
            change="+12% this month"
            changeType="positive"
            iconBg="bg-amber-600"
            description="Across all courses"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Continue Learning Section */}
          <div className="xl:col-span-2 space-y-8">
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
                  <div className="space-y-6">
                    {enrollments.slice(0, 3).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="lg:w-48 h-32 lg:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                            {enrollment.course.thumbnail ? (
                              <img
                                src={enrollment.course.thumbnail || "/placeholder.svg"}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  {enrollment.course.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Instructor: {enrollment.course.instructor || "TBD"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  {enrollment.course.level || "Beginner"}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-bold text-gray-900">{enrollment.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                <p>Last accessed: {enrollment.lastAccessed || "Recently"}</p>
                                <p>Next: {enrollment.nextLesson || "Continue where you left off"}</p>
                              </div>
                              <div className="flex gap-2">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
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
                  <h2 className="text-base font-semibold text-gray-900">All Courses</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course: any) => {
                    const enrollment = enrollmentMap[course.id]
                    return (
                      <div
                        key={course.id}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 group"
                      >
                        <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-gray-400" />
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
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {course.description || "Enhance your skills with this comprehensive course"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">4.8</span>
                              <span className="text-xs text-gray-500">(124)</span>
                            </div>
                            {enrollment ? (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Continue
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Enroll Now
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
            {/* Learning Stats */}
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
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-900">On Track!</div>
                        <div className="text-xs text-blue-700">You're making great progress</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                      <span className="text-sm font-bold text-gray-900">3/5 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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

            {/* Achievements */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Recent Achievements</h2>
                </div>
              </div>
              <div className="p-6">
                {achievements.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 ${achievement.iconBg} rounded-lg flex-shrink-0`}>
                          <div className="text-white">{achievement.icon}</div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                          <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                          <p className="text-xs text-gray-500">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Complete courses to earn achievements</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-600 rounded-lg">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Upcoming Deadlines</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">Data Security Quiz</p>
                        <p className="text-xs text-amber-700">Due in 2 days</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900">Document Upload</p>
                        <p className="text-xs text-blue-700">Due next week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboard
