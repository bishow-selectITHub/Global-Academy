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
  UserPlus,
  GraduationCap,
  RefreshCw,
} from "lucide-react"
import { useUser } from "../../contexts/UserContext"
import { Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { useToast } from "../../components/ui/Toaster"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  const [fetchedCourses, setFetchedCourses] = useState<any[]>([])
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([])
  const [fetchedDocs, setFetchedDocs] = useState<any[]>([])
  const [enrollmentData, setEnrollmentData] = useState<{
    weekly: Array<{ date: string; enrollments: number; dateObj: Date }>;
    monthly: Array<{ date: string; enrollments: number; dateObj: Date }>;
    totalEnrollments: number;
    weeklyChange: number;
    monthlyChange: number;
  }>({
    weekly: [],
    monthly: [],
    totalEnrollments: 0,
    weeklyChange: 0,
    monthlyChange: 0
  })
  const [totalEnrollments, setTotalEnrollments] = useState(0)

  // Fetch real enrollment data from course_enrollments table
  const fetchEnrollmentData = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from("course_enrollments")
        .select("enrolled_at")
        .order("enrolled_at", { ascending: true })

      if (error) throw error

      if (enrollments) {
        const now = new Date()
        const weeklyData = []
        const monthlyData = []
        
        // Generate weekly data (last 7 days)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const startOfDay = new Date(date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(date)
          endOfDay.setHours(23, 59, 59, 999)
          
          const dayEnrollments = enrollments.filter(enrollment => {
            const enrolledDate = new Date(enrollment.enrolled_at)
            return enrolledDate >= startOfDay && enrolledDate <= endOfDay
          }).length
          
          weeklyData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            enrollments: dayEnrollments,
            dateObj: date
          })
        }
        
        // Generate monthly data (last 30 days)
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const startOfDay = new Date(date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(date)
          endOfDay.setHours(23, 59, 59, 999)
          
          const dayEnrollments = enrollments.filter(enrollment => {
            const enrolledDate = new Date(enrollment.enrolled_at)
            return enrolledDate >= startOfDay && enrolledDate <= endOfDay
          }).length
          
          monthlyData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            enrollments: dayEnrollments,
            dateObj: date
          })
        }
        
        const totalWeekly = weeklyData.reduce((sum, day) => sum + day.enrollments, 0)
        const totalMonthly = monthlyData.reduce((sum, day) => sum + day.enrollments, 0)
        
        // Calculate previous period data for comparison
        const previousWeekStart = new Date(now)
        previousWeekStart.setDate(previousWeekStart.getDate() - 13)
        const previousWeekEnd = new Date(now)
        previousWeekEnd.setDate(previousWeekEnd.getDate() - 7)
        
        const previousMonthStart = new Date(now)
        previousMonthStart.setDate(previousMonthStart.getDate() - 60)
        const previousMonthEnd = new Date(now)
        previousMonthEnd.setDate(previousMonthEnd.getDate() - 30)
        
        const previousWeekEnrollments = enrollments.filter(enrollment => {
          const enrolledDate = new Date(enrollment.enrolled_at)
          return enrolledDate >= previousWeekStart && enrolledDate <= previousWeekEnd
        }).length
        
        const previousMonthEnrollments = enrollments.filter(enrollment => {
          const enrolledDate = new Date(enrollment.enrolled_at)
          return enrolledDate >= previousMonthStart && enrolledDate <= previousMonthEnd
        }).length
        
        const weeklyChange = previousWeekEnrollments > 0 
          ? Math.round(((totalWeekly - previousWeekEnrollments) / previousWeekEnrollments) * 100)
          : totalWeekly > 0 ? 100 : 0
          
        const monthlyChange = previousMonthEnrollments > 0 
          ? Math.round(((totalMonthly - previousMonthEnrollments) / previousMonthEnrollments) * 100)
          : totalMonthly > 0 ? 100 : 0
        
        setEnrollmentData({
          weekly: weeklyData,
          monthly: monthlyData,
          totalEnrollments: totalMonthly,
          weeklyChange,
          monthlyChange
        })
        setTotalEnrollments(enrollments.length)
      }
    } catch (error: any) {
      addToast({
        title: "Error retrieving enrollment data",
        message: error.message,
        type: "error",
      })
    }
  }

  useEffect(() => {
    fetchEnrollmentData()
  }, [])

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

  // Course status distribution data for pie chart
  const courseStatusData = Object.entries(courseCounts).map(([status, count]) => ({
    name: getStatusText(status),
    value: count,
    color: getStatusColor(status).replace('bg-', '')
  }))

  const COLORS = ['#10b981', '#3b82f6', '#eab308', '#f97316', '#ef4444']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 ml-10">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchEnrollmentData}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Enrollments"
            value={enrollmentData.weekly.length === 0 ? "..." : totalEnrollments}
            icon={<Users className="w-6 h-6" />}
            change={enrollmentData.weekly.length === 0 ? "Loading..." : "+12% vs last month"}
            changeType={enrollmentData.weekly.length === 0 ? "neutral" : "positive"}
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
            title="New Enrollments"
            value={enrollmentData.weekly.length === 0 ? "..." : enrollmentData.totalEnrollments}
            icon={<UserPlus className="w-6 h-6" />}
            change={enrollmentData.weekly.length === 0 ? "Loading..." : `${enrollmentData.monthlyChange > 0 ? '+' : ''}${enrollmentData.monthlyChange}% vs last month`}
            changeType={enrollmentData.weekly.length === 0 ? "neutral" : enrollmentData.monthlyChange >= 0 ? "positive" : "negative"}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Certificates"
            value="327"
            icon={<Award className="w-6 h-6" />}
            change="+18 this week"
            changeType="positive"
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Weekly Enrollments Chart */}
          <ChartCard title="Weekly Enrollments (Past 7 Days)">
            {enrollmentData.weekly.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading enrollment data...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={enrollmentData.weekly}>
                <defs>
                  <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#weeklyGradient)"
                  fillOpacity={0.6}
                />
                              </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Monthly Enrollments Chart */}
          <ChartCard title="Monthly Enrollments (Past 30 Days)">
            {enrollmentData.monthly.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading enrollment data...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="enrollments" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                              </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
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

          {/* Course Status Distribution */}
          <div className="xl:col-span-1">
            <ChartCard title="Course Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Course Completion Overview */}
          <div className="xl:col-span-1">
            <ChartCard title="Course Completion Overview">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {avgCompletionRate}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Average Completion Rate
                  </div>
                </div>
                
                <div className="space-y-3">
                  {courseCompletionData.slice(0, 4).map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(course.status)}`}></div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {course.name.length > 20 ? course.name.substring(0, 20) + '...' : course.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {course.completionRate}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {course.completed}/{course.totalEnrolled}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Priority Course:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {priorityCourse.name}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Needs attention - {priorityCourse.completionRate}% completion rate
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
