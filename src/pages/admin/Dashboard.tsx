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
              {changeType === "negative" && <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 ${iconBg} rounded-xl shadow-sm`}>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Learners"
            value={fetchedUsers.length}
            icon={<Users className="w-5 h-5" />}
            change="+12% vs last month"
            changeType="positive"
            iconBg="bg-blue-600"
          />
          <StatCard
            title="Active Courses"
            value={fetchedCourses.length}
            icon={<BookOpen className="w-5 h-5" />}
            change="+3 this month"
            changeType="positive"
            iconBg="bg-emerald-600"
          />
          <StatCard
            title="Certificates"
            value="327"
            icon={<Award className="w-5 h-5" />}
            change="+18 this week"
            changeType="positive"
            iconBg="bg-amber-600"
          />
          <StatCard title="Documents" value="1,248" icon={<FileText className="w-5 h-5" />} iconBg="bg-purple-600" />
          <StatCard
            title="Assets"
            value="142"
            icon={<Package className="w-5 h-5" />}
            change="5 pending"
            changeType="neutral"
            iconBg="bg-indigo-600"
          />
          <StatCard
            title="Appointments"
            value="38"
            icon={<Calendar className="w-5 h-5" />}
            change="6 this week"
            changeType="neutral"
            iconBg="bg-rose-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                <RecentActivityItem
                  title="New Registration"
                  time="2m ago"
                  description="James Wilson completed registration and needs document verification"
                  icon={<Users className="w-4 h-4" />}
                  iconBg="bg-blue-600"
                />
                <RecentActivityItem
                  title="Certificate Issued"
                  time="1h ago"
                  description="15 learners received their Advanced Project Management certificates"
                  icon={<Award className="w-4 h-4" />}
                  iconBg="bg-amber-600"
                />
                <RecentActivityItem
                  title="Course Published"
                  time="1d ago"
                  description="Data Privacy Essentials course is now live with 8 lessons"
                  icon={<BookOpen className="w-4 h-4" />}
                  iconBg="bg-emerald-600"
                />
                <RecentActivityItem
                  title="Asset Assignment"
                  time="2d ago"
                  description="12 new laptops were assigned to the customer service team"
                  icon={<Package className="w-4 h-4" />}
                  iconBg="bg-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
                  </div>
                  <Link
                    to="/admin/analytics"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Analytics
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {/* Summary Stats */}
                <div className="flex items-center justify-between mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg font-bold">{avgCompletionRate}%</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">Average Completion Rate</div>
                      <div className="text-sm text-gray-600">{courseCompletionData.length} active courses</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold border border-emerald-200">
                      {courseCounts.excellent + courseCounts.good} performing well
                    </div>
                    <div className="text-sm px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold border border-red-200">
                      {courseCounts.poor + courseCounts.critical} need attention
                    </div>
                  </div>
                </div>

                {/* Course List */}
                <div className="space-y-4">
                  {courseCompletionData.map((course, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold text-gray-900">{course.name}</span>
                          <div className="flex items-center gap-1">
                            {course.trend === "increase" ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-sm font-medium">+{course.trendValue}%</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                <TrendingDown className="w-3 h-3" />
                                <span className="text-sm font-medium">-{course.trendValue}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600 font-medium">
                            {course.completed} / {course.totalEnrolled} completed
                          </div>
                          <div
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${
                              course.status === "excellent"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : course.status === "good"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : course.status === "average"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : course.status === "poor"
                                      ? "bg-orange-100 text-orange-700 border-orange-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {course.completionRate}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStatusColor(course.status)} transition-all duration-500 ease-out rounded-full`}
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Critical Alert */}
                {priorityCourse.status === "critical" && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-600 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-red-900 mb-2">Action Required</h4>
                        <p className="text-sm text-red-700 mb-4 leading-relaxed">
                          "{priorityCourse.name}" has a critically low completion rate ({priorityCourse.completionRate}
                          %). Consider reviewing course content or sending reminders to enrolled learners.
                        </p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
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
