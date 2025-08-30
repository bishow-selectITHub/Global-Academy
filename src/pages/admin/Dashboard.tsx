"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Users,
  BookOpen,
  Award,
  FileText,
  Package,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  BarChart3,
} from "lucide-react"
import { useUser } from "../../contexts/UserContext"
import { Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { useToast } from "../../components/ui/Toaster"

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
              {changeType === "negative" && <TrendingDown className="w-3 h-3" />}
              <span className="font-semibold">{change}</span>
            </div>
          )}
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

const RecentActivityItem = ({
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
  <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 group">
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

// Course completion data
const courseCompletionData = [
  {
    name: "Onboarding Essentials",
    completionRate: 92,
    totalEnrolled: 145,
    completed: 133,
    trend: "increase",
    trendValue: 4,
    status: "excellent",
  },
  {
    name: "Data Security",
    completionRate: 78,
    totalEnrolled: 210,
    completed: 164,
    trend: "increase",
    trendValue: 6,
    status: "good",
  },
  {
    name: "Client Communication",
    completionRate: 65,
    totalEnrolled: 178,
    completed: 116,
    trend: "decrease",
    trendValue: 3,
    status: "average",
  },
  {
    name: "Advanced Excel",
    completionRate: 45,
    totalEnrolled: 92,
    completed: 41,
    trend: "increase",
    trendValue: 2,
    status: "poor",
  },
  {
    name: "Leadership Skills",
    completionRate: 32,
    totalEnrolled: 56,
    completed: 18,
    trend: "decrease",
    trendValue: 8,
    status: "critical",
  },
]

const AdminDashboard = () => {
  const { user } = useUser()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [fetchedCourses, setFetchedCourses] = useState([])
  const [fetchedUsers, setFetchedUsers] = useState([])
  const [fetchedDocs, setFetchedDocs] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("*")
        if (error) throw error
        setFetchedCourses(data)
      } catch (error: any) {
        addToast({
          title: "Error retrieving courses",
          message: error.message,
          type: "error",
        })
      }
    }
    fetchCourses()
  }, [user])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase.from("notes").select("*")
        if (error) throw error
        setFetchedDocs(data)
      } catch (error: any) {
        addToast({
          title: "Error retrieving courses",
          message: error.message,
          type: "error",
        })
      }
    }
    fetchDocuments()
  }, [user])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("user_roles").select("*").eq("role", "learner")
        if (error) throw error
        setFetchedUsers(data)
      } catch (error: any) {
        addToast({
          title: "Error retrieving users",
          message: error.message,
          type: "error",
        })
      }
    }
    fetchUsers()
  }, [user])

  // Calculate the average completion rate
  const avgCompletionRate = Math.round(
    courseCompletionData.reduce((sum, course) => sum + course.completionRate, 0) / courseCompletionData.length,
  )

  // Count courses by status
  const courseCounts = {
    excellent: courseCompletionData.filter((c) => c.status === "excellent").length,
    good: courseCompletionData.filter((c) => c.status === "good").length,
    average: courseCompletionData.filter((c) => c.status === "average").length,
    poor: courseCompletionData.filter((c) => c.status === "poor").length,
    critical: courseCompletionData.filter((c) => c.status === "critical").length,
  }

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "average":
        return "bg-yellow-500"
      case "poor":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excellent"
      case "good":
        return "Good"
      case "average":
        return "Average"
      case "poor":
        return "Poor"
      case "critical":
        return "Critical"
      default:
        return "Unknown"
    }
  }

  // Get course that needs the most attention
  const priorityCourse = courseCompletionData.sort((a, b) => a.completionRate - b.completionRate)[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 ml-10">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
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
            title="Total Learners"
            value={fetchedUsers.length}
            icon={<Users className="w-6 h-6" />}
            change="+12% vs last month"
            changeType="positive"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Courses"
            value={fetchedCourses.length}
            icon={<BookOpen className="w-6 h-6" />}
            change="+3 this month"
            changeType="positive"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Certificates"
            value="327"
            icon={<Award className="w-6 h-6" />}
            change="+18 this week"
            changeType="positive"
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            title="Documents"
            value={fetchedDocs.length}
            icon={<FileText className="w-6 h-6" />}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Assets"
            value="142"
            icon={<Package className="w-6 h-6" />}
            change="5 pending"
            changeType="neutral"
            iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Appointments"
            value="38"
            icon={<Calendar className="w-6 h-6" />}
            change="6 this week"
            changeType="neutral"
            iconBg="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Latest system updates</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                <RecentActivityItem
                  title="New Registration"
                  time="2m ago"
                  description="James Wilson completed registration and needs document verification"
                  icon={<Users className="w-4 h-4" />}
                  iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <RecentActivityItem
                  title="Certificate Issued"
                  time="1h ago"
                  description="15 learners received their Advanced Project Management certificates"
                  icon={<Award className="w-4 h-4" />}
                  iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
                />
                <RecentActivityItem
                  title="Course Published"
                  time="1d ago"
                  description="Data Privacy Essentials course is now live with 8 lessons"
                  icon={<BookOpen className="w-4 h-4" />}
                  iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <RecentActivityItem
                  title="Asset Assignment"
                  time="2d ago"
                  description="12 new laptops were assigned to the customer service team"
                  icon={<Package className="w-4 h-4" />}
                  iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course Performance</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Track learning progress</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/analytics"
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-2 rounded-lg transition-all duration-200 group"
                  >
                    View Analytics
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {/* Summary Stats */}
                <div className="flex items-center justify-between mb-6 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">{avgCompletionRate}%</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Average Completion Rate
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {courseCompletionData.length} active courses
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold border border-emerald-200 dark:border-emerald-800">
                      {courseCounts.excellent + courseCounts.good} performing well
                    </div>
                    <div className="text-sm px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-semibold border border-red-200 dark:border-red-800">
                      {courseCounts.poor + courseCounts.critical} need attention
                    </div>
                  </div>
                </div>

                {/* Course List */}
                <div className="space-y-4">
                  {courseCompletionData.map((course, i) => (
                    <div
                      key={i}
                      className="bg-slate-50/80 backdrop-blur-sm dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {course.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {course.trend === "increase" ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-sm font-medium">+{course.trendValue}%</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                                <TrendingDown className="w-3 h-3" />
                                <span className="text-sm font-medium">-{course.trendValue}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {course.completed} / {course.totalEnrolled} completed
                          </div>
                          <div
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${course.status === "excellent"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : course.status === "good"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : course.status === "average"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                    : course.status === "poor"
                                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                              }`}
                          >
                            {course.completionRate}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${getStatusColor(course.status)} transition-all duration-500 ease-out rounded-full shadow-sm`}
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Critical Alert */}
                {priorityCourse.status === "critical" && (
                  <div className="mt-6 bg-red-50/80 backdrop-blur-sm dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-5 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex-shrink-0 shadow-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Action Required</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4 leading-relaxed">
                          "{priorityCourse.name}" has a critically low completion rate ({priorityCourse.completionRate}
                          %). Consider reviewing course content or sending reminders to enrolled learners.
                        </p>
                        <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                          Review Course
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
