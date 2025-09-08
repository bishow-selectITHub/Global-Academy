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
  Trophy,
  BookMarked,
  GraduationCap,
  Users,
  Brain,
  Flame,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchEnrollments } from "../../store/enrollmentsSlice"
import type { RootState } from "../../store"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "../../components/ui/Toaster"
import { useUser } from "../../contexts/UserContext"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  teacherEmail: string
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
    changeType === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : changeType === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-slate-600 dark:text-slate-400"

  return (
    <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{value}</h4>
          {change && (
            <div className={`text-xs flex items-center gap-1 ${changeColor}`}>
              {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
              <span className="font-semibold">{change}</span>
            </div>
          )}
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <div
          className={`p-2.5 ${iconBg} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  )
}

const ChartCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden ${className}`}>
    <div className="px-6 py-4 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-700/20 dark:to-slate-600/20 border-b border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
)

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
  <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 group">
    <div
      className={`p-2 ${iconBg} rounded-lg flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-200`}
    >
      <div className="text-white">{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h5>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full whitespace-nowrap ml-2 font-medium">
          {time}
        </span>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </div>
  </div>
)

const LearnerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useUser()
  const courses = useSelector((state: RootState) => state.courses.data)
  const enrollments = useSelector((state: RootState) => state.enrollments.data)
  const loading = useSelector((state: RootState) => state.users.loading)
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
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      description: "Completed your first learning journey",
    },
    {
      id: "2",
      title: "Perfect Quiz Score",
      date: "Apr 22, 2025",
      icon: <Trophy className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      description: "Scored 100% on Data Security quiz",
    },
    {
      id: "3",
      title: "Learning Streak",
      date: "Apr 25, 2025",
      icon: <Flame className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
      description: "7 days of continuous learning",
    },
  ]

  const recentActivity = [
    {
      title: "Course Progress",
      time: "2h ago",
      description: "Completed lesson 3 of Data Security Fundamentals",
      icon: <BookOpen className="w-4 h-4" />,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Quiz Completed",
      time: "1d ago",
      description: "Scored 95% on Client Communication assessment",
      icon: <Award className="w-4 h-4" />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      title: "New Enrollment",
      time: "3d ago",
      description: "Enrolled in Advanced Excel Techniques course",
      icon: <GraduationCap className="w-4 h-4" />,
      iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 ml-10">
              Your learning journey continues. You have{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{enrollments.length} courses</span> in
              progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchEnrollments(user?.id))}
              className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group"
              title="Refresh enrollment data"
            >
              <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
            </button>
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 shadow-lg">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Today
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <StatCard
            title="Courses in Progress"
            value={enrollments.length}
            icon={<BookOpen className="w-6 h-6" />}
            change="+2 this month"
            changeType="positive"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            description="Active learning paths"
          />
          <StatCard
            title="Certificates Earned"
            value={completedCourses}
            icon={<Award className="w-6 h-6" />}
            change="+1 this week"
            changeType="positive"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            description="Completed achievements"
          />
          <StatCard
            title="Learning Hours"
            value={`${totalLearningHours}h`}
            icon={<Clock className="w-6 h-6" />}
            change="3.5h this week"
            changeType="positive"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            description="Total time invested"
          />
          <StatCard
            title="Average Progress"
            value={`${avgProgress}%`}
            icon={<BarChart3 className="w-6 h-6" />}
            change="+12% this month"
            changeType="positive"
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
            description="Across all courses"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Progress Chart */}
          <ChartCard title="Course Progress Overview">
            {enrollments.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No courses enrolled yet</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollments.map((enrollment: any) => ({
                  course: enrollment.course?.title?.substring(0, 20) + (enrollment.course?.title?.length > 20 ? '...' : ''),
                  progress: enrollment.progress || 0,
                  enrolled: enrollment.enrolled_at
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="course" 
                    stroke="#64748b"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value}%`, 'Progress']}
                  />
                  <Line 
                    type="monotone"
                    dataKey="progress" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

                     {/* Weekly Learning Activity Chart */}
           <ChartCard title="Weekly Learning Activity (Past 7 Days)">
             {enrollments.length === 0 ? (
               <div className="flex items-center justify-center h-[300px]">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                     <Activity className="w-8 h-8 text-slate-400" />
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400">No learning activity yet</p>
                 </div>
               </div>
             ) : (
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={(() => {
                   // Generate weekly data for the past 7 days
                   const weeklyData = [];
                   const now = new Date();
                   
                   for (let i = 6; i >= 0; i--) {
                     const date = new Date(now);
                     date.setDate(date.getDate() - i);
                     
                     // Calculate learning activity for this day (simulated based on enrollments)
                     const dayActivity = enrollments.reduce((total: number, enrollment: any) => {
                       // Simulate daily activity based on course progress and enrollment date
                       const enrolledDate = new Date(enrollment.enrolled_at);
                       const daysSinceEnrollment = Math.floor((now.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24));
                       
                       if (daysSinceEnrollment <= i && daysSinceEnrollment >= i - 1) {
                         // Higher activity for recent enrollments and active courses
                         return total + (enrollment.progress || 0) / 100;
                       }
                       return total;
                     }, 0);
                     
                     weeklyData.push({
                       date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                       activity: Math.min(1, Math.max(0, dayActivity)),
                       dateObj: date
                     });
                   }
                   
                   return weeklyData;
                 })()}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                   <XAxis 
                     dataKey="date" 
                     stroke="#64748b"
                     fontSize={12}
                   />
                   <YAxis 
                     stroke="#64748b"
                     fontSize={12}
                     domain={[0, 1]}
                     tickFormatter={(value) => `${Math.round(value * 100)}%`}
                   />
                   <Tooltip 
                     contentStyle={{
                       backgroundColor: 'rgba(255, 255, 255, 0.95)',
                       border: '1px solid #e2e8f0',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                     }}
                     formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Learning Activity']}
                   />
                   <Bar 
                     dataKey="activity" 
                     fill="#8b5cf6"
                     radius={[4, 4, 0, 0]}
                     fillOpacity={0.8}
                   />
                 </BarChart>
               </ResponsiveContainer>
             )}
           </ChartCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Continue Learning Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Current Courses */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Continue Learning</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Pick up where you left off</p>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-lg transition-all duration-200 group"
                  >
                    View All Courses
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-5">
                    {enrollments.slice(0, 3).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex flex-col lg:flex-row gap-5">
                          <div className="lg:w-48 h-32 lg:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex-shrink-0 shadow-lg">
                            {enrollment.course.thumbnail ? (
                              <img
                                src={enrollment.course.thumbnail || "/placeholder.svg"}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                  {enrollment.course.title}
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3 text-slate-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      {enrollment.course.instructor || "TBD"}
                                    </span>
                                  </div>
                                  <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                                    {enrollment.course.level || "Beginner"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Progress
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {enrollment.progress || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                <p className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  Last accessed: {enrollment.lastAccessed || "Recently"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Target className="w-3 h-3" />
                                  Next: {enrollment.nextLesson || "Continue where you left off"}
                                </p>
                              </div>
                              <Link to={`/courses/${enrollment.course.id}`}>
                                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl group">
                                  <Play className="w-3 h-3 group-hover:scale-110 transition-transform" />
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      No courses in progress
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      Start your learning journey by enrolling in a course and unlock your potential
                    </p>
                    <Link to="/courses">
                      <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                        Browse Courses
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Available Courses */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <BookMarked className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">All Courses</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Discover new learning opportunities</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map((course: any) => {
                    const enrollment = enrollmentMap[course.id]
                    return (
                      <div
                        key={course.id}
                        className="border border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                      >
                        <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 overflow-hidden relative">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-slate-400" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-full">
                              {course.category || "General"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">{course.duration || "2h"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">4.8</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">(124)</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 text-lg">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                            {course.description || "Enhance your skills with this comprehensive course"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-600 dark:text-slate-400">1.2k students</span>
                            </div>
                            {enrollment ? (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                Continue
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border border-slate-200 dark:border-slate-600"
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
          <div className="xl:col-span-1 space-y-5">
            {/* Learning Stats */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Learning Goals</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-900 dark:text-blue-100">On Track!</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">You're making great progress</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Goal</span>
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">3/5 hours</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: "60%" }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 hours remaining this week</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Courses</span>
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">1/2 completed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: "50%" }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 course to go this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
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
