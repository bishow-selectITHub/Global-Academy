import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  Clock, 
  Calendar,
  Download,
  Filter,
  Layers,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Eye,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Search
} from 'lucide-react';

// Types for analytics data
interface AnalyticsMetric {
  title: string;
  value: string | number;
  change: number;
  icon: JSX.Element;
}

interface CourseCompletionData {
  id: string;
  courseName: string;
  enrollments: number;
  completions: number;
  completion_rate: number;
  previousRate?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface UserActivityData {
  day: string;
  active_users: number;
  course_views: number;
  lesson_completions: number;
}

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest' | 'alphabetical'>('highest');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  
  // Mock data for key metrics
  const metrics: AnalyticsMetric[] = [
    {
      title: 'Total Learners',
      value: '582',
      change: 12,
      icon: <Users className="text-blue-500 dark:text-blue-400\" size={24} />
    },
    {
      title: 'Course Completions',
      value: '243',
      change: 8,
      icon: <CheckCircle className="text-green-500 dark:text-green-400\" size={24} />
    },
    {
      title: 'Avg. Completion Rate',
      value: '76%',
      change: 5,
      icon: <BarChart3 className="text-amber-500 dark:text-amber-400\" size={24} />
    },
    {
      title: 'Learning Hours',
      value: '1,284',
      change: 15,
      icon: <Clock className="text-purple-500 dark:text-purple-400\" size={24} />
    }
  ];

  // Mock data for course completion rates with additional info
  const courseCompletionData: CourseCompletionData[] = [
    { 
      id: 'c1',
      courseName: 'Onboarding Essentials', 
      enrollments: 210, 
      completions: 195, 
      completion_rate: 93,
      previousRate: 90,
      trend: 'up'
    },
    { 
      id: 'c2',
      courseName: 'Data Security Fundamentals', 
      enrollments: 175, 
      completions: 128, 
      completion_rate: 73,
      previousRate: 68,
      trend: 'up'
    },
    { 
      id: 'c3',
      courseName: 'Leadership Skills', 
      enrollments: 120, 
      completions: 85, 
      completion_rate: 71,
      previousRate: 75,
      trend: 'down'
    },
    { 
      id: 'c4',
      courseName: 'Client Communication', 
      enrollments: 150, 
      completions: 102, 
      completion_rate: 68,
      previousRate: 65,
      trend: 'up'
    },
    { 
      id: 'c5',
      courseName: 'Advanced Excel', 
      enrollments: 95, 
      completions: 62, 
      completion_rate: 65,
      previousRate: 65,
      trend: 'stable'
    },
    { 
      id: 'c6',
      courseName: 'Project Management', 
      enrollments: 130, 
      completions: 115, 
      completion_rate: 88,
      previousRate: 82,
      trend: 'up'
    },
    { 
      id: 'c7',
      courseName: 'Customer Service Essentials', 
      enrollments: 85, 
      completions: 40, 
      completion_rate: 47,
      previousRate: 52,
      trend: 'down'
    }
  ];
  
  // Mock data for user activity over time
  const userActivityData: UserActivityData[] = [
    { day: 'Mon', active_users: 245, course_views: 320, lesson_completions: 180 },
    { day: 'Tue', active_users: 285, course_views: 380, lesson_completions: 210 },
    { day: 'Wed', active_users: 310, course_views: 425, lesson_completions: 250 },
    { day: 'Thu', active_users: 290, course_views: 390, lesson_completions: 220 },
    { day: 'Fri', active_users: 270, course_views: 340, lesson_completions: 200 },
    { day: 'Sat', active_users: 180, course_views: 210, lesson_completions: 120 },
    { day: 'Sun', active_users: 220, course_views: 260, lesson_completions: 150 }
  ];
  
  // Mock data for enrollment trends
  const departmentDistribution = [
    { department: 'Marketing', count: 135, percentage: 23 },
    { department: 'Sales', count: 120, percentage: 21 },
    { department: 'IT', count: 105, percentage: 18 },
    { department: 'Operations', count: 90, percentage: 15 },
    { department: 'HR', count: 75, percentage: 13 },
    { department: 'Finance', count: 57, percentage: 10 }
  ];

  // Mock detailed data for course trends
  const monthlyTrendData = {
    'c1': [85, 88, 90, 93, 92, 93],
    'c2': [60, 63, 65, 68, 71, 73],
    'c3': [80, 82, 79, 77, 75, 71],
    'c4': [55, 58, 60, 62, 65, 68],
    'c5': [62, 62, 63, 64, 65, 65],
    'c6': [75, 79, 82, 85, 87, 88],
    'c7': [60, 58, 55, 52, 49, 47],
  };

  // Filter, sort and search courses
  const getFilteredAndSortedCourses = () => {
    let filtered = [...courseCompletionData];
    
    // Apply filter
    if (courseFilter === 'low') {
      filtered = filtered.filter(course => course.completion_rate < 70);
    } else if (courseFilter === 'high') {
      filtered = filtered.filter(course => course.completion_rate >= 80);
    } else if (courseFilter === 'trending_up') {
      filtered = filtered.filter(course => course.trend === 'up');
    } else if (courseFilter === 'trending_down') {
      filtered = filtered.filter(course => course.trend === 'down');
    }
    
    // Apply search
    if (courseSearchQuery) {
      const query = courseSearchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.courseName.toLowerCase().includes(query)
      );
    }
    
    // Apply sort
    if (sortOrder === 'highest') {
      filtered.sort((a, b) => b.completion_rate - a.completion_rate);
    } else if (sortOrder === 'lowest') {
      filtered.sort((a, b) => a.completion_rate - b.completion_rate);
    } else {
      filtered.sort((a, b) => a.courseName.localeCompare(b.courseName));
    }
    
    return filtered;
  };

  const filteredCourses = getFilteredAndSortedCourses();

  // Toggle course details
  const toggleCourseDetails = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Find low completion courses
  const lowCompletionCourses = courseCompletionData
    .filter(course => course.completion_rate < 70)
    .sort((a, b) => a.completion_rate - b.completion_rate);

  // Calculate average completion rate
  const averageCompletionRate = Math.round(
    courseCompletionData.reduce((sum, course) => sum + course.completion_rate, 0) / courseCompletionData.length
  );

  // Format numbers with comma separators
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Learning Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive insights into learning patterns and performance</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-1.5 text-sm ${dateRange === 'week' 
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => setDateRange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${dateRange === 'month' 
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => setDateRange('month')}
            >
              Month
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${dateRange === 'quarter' 
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => setDateRange('quarter')}
            >
              Quarter
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${dateRange === 'year' 
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => setDateRange('year')}
            >
              Year
            </button>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{metric.title}</p>
                  <p className="text-2xl font-semibold dark:text-slate-100">{metric.value}</p>
                  <p className={`text-xs flex items-center ${
                    metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change > 0 
                      ? <TrendingUp size={14} className="mr-1" /> 
                      : <TrendingDown size={14} className="mr-1" />
                    }
                    {Math.abs(metric.change)}% from last {dateRange}
                  </p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Activity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>User Activity</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Active Users</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Completions</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              {/* In a real app, this would be a chart component */}
              <div className="h-64 flex items-end space-x-6 pt-8">
                {userActivityData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                    <div className="w-full flex justify-center space-x-1">
                      <div 
                        className="w-3 bg-blue-500 dark:bg-blue-600 rounded-t"
                        style={{ height: `${(data.active_users / 400) * 100}%` }}
                      ></div>
                      <div 
                        className="w-3 bg-green-500 dark:bg-green-600 rounded-t"
                        style={{ height: `${(data.lesson_completions / 400) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{data.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment by Department</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              {/* This would be a pie chart in a real implementation */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {departmentDistribution.reduce((acc, item, index) => {
                    const startAngle = acc.offset;
                    const endAngle = startAngle + (item.percentage / 100) * 360;
                    const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                    const colors = [
                      'fill-blue-500 dark:fill-blue-600',
                      'fill-green-500 dark:fill-green-600',
                      'fill-amber-500 dark:fill-amber-600',
                      'fill-purple-500 dark:fill-purple-600',
                      'fill-red-500 dark:fill-red-600',
                      'fill-indigo-500 dark:fill-indigo-600',
                    ];

                    return {
                      paths: [
                        ...acc.paths,
                        <path 
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          className={colors[index % colors.length]}
                        />
                      ],
                      offset: endAngle
                    };
                  }, { paths: [] as JSX.Element[], offset: 0 }).paths}
                  <circle cx="50" cy="50" r="25" className="fill-white dark:fill-slate-900"/>
                </svg>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {departmentDistribution.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500'][index % 6]
                      }`} 
                    />
                    <span className="text-sm dark:text-slate-300">{dept.department}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium dark:text-slate-200 mr-2">{dept.count}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{dept.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Completion Rates - ENHANCED SECTION */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Course Completion Rates</CardTitle>
              <CardDescription>Track completion rates across all courses</CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 h-9 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                />
              </div>
              
              {/* Filter dropdown */}
              <div className="flex items-center">
                <Filter size={16} className="text-slate-500 dark:text-slate-400 mr-2" />
                <select 
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 h-9 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  <option value="low">Low Completion (&lt;70%)</option>
                  <option value="high">High Completion (&gt;80%)</option>
                  <option value="trending_up">Trending Up</option>
                  <option value="trending_down">Trending Down</option>
                </select>
              </div>
              
              {/* Sort dropdown */}
              <div className="flex items-center">
                <select 
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 h-9 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="highest">Highest First</option>
                  <option value="lowest">Lowest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
              
              {/* Refresh button */}
              <Button 
                size="sm" 
                variant="outline"
                title="Refresh data"
                onClick={() => {
                  // This would refresh the data in a real application
                  console.log('Refreshing data...');
                }}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </CardHeader>
          
          {/* Average completion summary */}
          <div className="px-6 pt-2 pb-4 flex items-center border-b border-slate-100 dark:border-slate-800">
            <div className="mr-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Average Completion Rate
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {averageCompletionRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {filteredCourses.length} courses • {formatNumber(filteredCourses.reduce((sum, course) => sum + course.enrollments, 0))} total enrollments
              </div>
            </div>
            <div className="ml-auto">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                Based on {dateRange === 'week' ? 'this week' : dateRange === 'month' ? 'this month' : dateRange === 'quarter' ? 'this quarter' : 'this year'}
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {filteredCourses.length > 0 ? (
              <div className="space-y-6">
                {filteredCourses.map((course, index) => (
                  <div key={index} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                    {/* Course header row */}
                    <div className="p-4" onClick={() => toggleCourseDetails(course.id)} style={{cursor: 'pointer'}}>
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-sm md:text-base font-medium dark:text-slate-200 truncate">{course.courseName}</h4>
                            {course.trend && (
                              <span className={`ml-2 ${
                                course.trend === 'up' ? 'text-green-500 dark:text-green-400' : 
                                course.trend === 'down' ? 'text-red-500 dark:text-red-400' :
                                'text-slate-500 dark:text-slate-400'
                              }`}>
                                {course.trend === 'up' && <ArrowUpRight size={16} />}
                                {course.trend === 'down' && <ArrowDownRight size={16} />}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>
                              {course.completions} / {course.enrollments} learners completed
                            </span>
                            
                            {course.previousRate && (
                              <span className="ml-2 flex items-center">
                                • Previously: {course.previousRate}%
                                {course.trend === 'up' && (
                                  <span className="text-green-500 dark:text-green-400 ml-1">
                                    (+{(course.completion_rate - course.previousRate).toFixed(1)}%)
                                  </span>
                                )}
                                {course.trend === 'down' && (
                                  <span className="text-red-500 dark:text-red-400 ml-1">
                                    (-{(course.previousRate - course.completion_rate).toFixed(1)}%)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.completion_rate >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            course.completion_rate >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {course.completion_rate}%
                          </span>
                          <button className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle details">
                            {expandedCourse === course.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-xs font-semibold inline-block text-slate-600 dark:text-slate-400">
                              {course.completion_rate < 50 ? 'Needs Attention' : 
                               course.completion_rate < 70 ? 'Moderate Engagement' : 
                               course.completion_rate < 90 ? 'Good Performance' : 
                               'Excellent Performance'}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
                          <div 
                            className={`
                              shadow-none flex flex-col justify-center rounded-full transition-all duration-500
                              ${course.completion_rate > 80 ? 'bg-green-500 dark:bg-green-600' :
                                course.completion_rate > 60 ? 'bg-amber-500 dark:bg-amber-600' :
                                'bg-red-500 dark:bg-red-600'}
                            `}
                            style={{ width: `${course.completion_rate}%` }}
                          >
                            {course.completion_rate > 15 && (
                              <div className="px-2 text-white font-semibold text-center text-xs">
                                {course.completion_rate}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedCourse === course.id && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:divide-x divide-slate-200 dark:divide-slate-700">
                          {/* Course trends */}
                          <div className="lg:pr-4 pb-4 lg:pb-0 lg:w-1/2">
                            <h5 className="font-medium text-sm mb-2 dark:text-slate-300">Completion Rate Trend (Last 6 Months)</h5>
                            <div className="h-32 flex items-end">
                              {monthlyTrendData[course.id].map((rate, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                  <div 
                                    className={`w-6 rounded-t transition-all ${
                                      rate >= 80 ? 'bg-green-500 dark:bg-green-600' :
                                      rate >= 60 ? 'bg-amber-500 dark:bg-amber-600' :
                                      'bg-red-500 dark:bg-red-600'
                                    }`}
                                    style={{ height: `${rate}%` }}
                                  ></div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Course insights */}
                          <div className="lg:pl-4 lg:w-1/2">
                            <h5 className="font-medium text-sm mb-2 dark:text-slate-300">Course Insights</h5>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                  <Users size={12} className="text-blue-600 dark:text-blue-400" />
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>{course.enrollments}</strong> total enrollments 
                                  {course.trend === 'up' && <span className="text-green-500 dark:text-green-400"> ↑</span>}
                                  {course.trend === 'down' && <span className="text-red-500 dark:text-red-400"> ↓</span>}
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                  <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>{course.completions}</strong> learners completed
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                  <Clock size={12} className="text-amber-600 dark:text-amber-400" />
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  <strong>{course.enrollments - course.completions}</strong> learners in progress
                                </span>
                              </li>
                            </ul>
                            
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                leftIcon={<Eye size={14} />}
                                as={Link}
                                to={`/admin/courses/${course.id}`}
                              >
                                View Course
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                leftIcon={<Users size={14} />}
                              >
                                View Learners
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No courses match your filters</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCourseFilter('all');
                    setCourseSearchQuery('');
                    setSortOrder('highest');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {filteredCourses.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredCourses.length} of {courseCompletionData.length} courses
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // This would toggle showing all courses in a real app
                    }}
                  >
                    Show All Courses
                  </Button>
                  <div className="text-sm">
                    <a 
                      href="#" 
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        // This would generate a detailed report in a real app
                      }}
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Generate Detailed Report
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Areas for improvement and Scheduled reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {lowCompletionCourses.length > 0 ? (
                <div className="space-y-6">
                  {lowCompletionCourses.map((course, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium dark:text-slate-200">Low completion rate for "{course.courseName}"</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Only {course.completion_rate}% of enrolled learners completed this course.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" leftIcon={<BookOpen size={14} />}>
                            View Course
                          </Button>
                          <Button size="sm" variant="outline" leftIcon={<Users size={14} />}>
                            Contact Learners
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <CheckCircle size={48} className="text-green-500 dark:text-green-400 mb-3" />
                  <h4 className="text-lg font-medium dark:text-slate-200">All courses are performing well</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    No courses currently have completion rates below 70%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400">Weekly Summary</h4>
                    <div className="px-2 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                      Active
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Sent every Monday at 9:00 AM
                  </p>
                  <div className="flex items-center mt-2 text-xs text-blue-700 dark:text-blue-300">
                    <Users size={12} className="mr-1" />
                    <span>Recipients: 3 admins</span>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-green-900 dark:text-green-400">Monthly Detailed Report</h4>
                    <div className="px-2 py-0.5 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                      Active
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Sent on the 1st of each month
                  </p>
                  <div className="flex items-center mt-2 text-xs text-green-700 dark:text-green-300">
                    <Users size={12} className="mr-1" />
                    <span>Recipients: 5 managers</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth 
                  leftIcon={<Calendar size={14} />}
                >
                  Create New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;