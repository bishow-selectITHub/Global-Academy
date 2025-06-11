import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, BookOpen, Award, FileText, Package, Calendar, ChevronRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toaster';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) => {
  const changeColor = changeType === 'positive' 
    ? 'text-green-600 dark:text-green-400' 
    : changeType === 'negative' 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-slate-600 dark:text-slate-400';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</h4>
            {change && (
              <p className={`text-xs mt-2 flex items-center ${changeColor}`}>
                {changeType === 'positive' && '↑ '}
                {changeType === 'negative' && '↓ '}
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivityItem = ({ 
  title, 
  time, 
  description, 
  icon 
}: { 
  title: string; 
  time: string; 
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="flex space-x-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full h-fit">
      {icon}
    </div>
    <div>
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-slate-900 dark:text-slate-200">{title}</h5>
        <span className="text-xs text-slate-500 dark:text-slate-400">{time}</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
    </div>
  </div>
);

// Course completion data with additional information for better visualization
const courseCompletionData = [
  {
    name: 'Onboarding Essentials',
    completionRate: 92,
    totalEnrolled: 145,
    completed: 133,
    trend: 'increase',
    trendValue: 4,
    status: 'excellent'
  },
  {
    name: 'Data Security',
    completionRate: 78,
    totalEnrolled: 210,
    completed: 164,
    trend: 'increase',
    trendValue: 6,
    status: 'good'
  },
  {
    name: 'Client Communication',
    completionRate: 65,
    totalEnrolled: 178,
    completed: 116,
    trend: 'decrease',
    trendValue: 3,
    status: 'average'
  },
  {
    name: 'Advanced Excel',
    completionRate: 45,
    totalEnrolled: 92,
    completed: 41,
    trend: 'increase',
    trendValue: 2,
    status: 'poor'
  },
  {
    name: 'Leadership Skills',
    completionRate: 32,
    totalEnrolled: 56,
    completed: 18,
    trend: 'decrease',
    trendValue: 8,
    status: 'critical'
  }
];

const AdminDashboard = () => {
  const { user } = useUser();
  const {addToast} = useToast();
  const [isLoading,setIsLoading] = useState(true);
  const [fetchedCourses,setFetchedCourses] = useState([])
  const [fetchedUsers,setFetchedUsers] = useState([]);
  useEffect(()=>{
    const fetchCourses = async()=>{

      try{
        const {data,error} = await supabase.from("courses").select("*");
        
          if(error) throw error;


        setFetchedCourses(data)

      }catch(error:any){
        addToast({
          title:"Error retrieving courses",
          message:error.message,
          type:'error'
        })
      }
    }
    fetchCourses();
  },[user])


  useEffect(()=>{
    const fetchUsers = async()=>{

      try{
        const {data,error} = await supabase.from("user_roles").select("*").eq("role","learner");
          console.log(data)

          if(error) throw error;


        setFetchedUsers(data)

      }catch(error:any){
        addToast({
          title:"Error retrieving courses",
          message:error.message,
          type:'error'
        })
      }
    }
    fetchUsers();
  },[user])
  // Calculate the average completion rate
  const avgCompletionRate = Math.round(
    courseCompletionData.reduce((sum, course) => sum + course.completionRate, 0) / courseCompletionData.length
  );

  // Count courses by status
  const courseCounts = {
    excellent: courseCompletionData.filter(c => c.status === 'excellent').length,
    good: courseCompletionData.filter(c => c.status === 'good').length,
    average: courseCompletionData.filter(c => c.status === 'average').length,
    poor: courseCompletionData.filter(c => c.status === 'poor').length,
    critical: courseCompletionData.filter(c => c.status === 'critical').length
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500 dark:bg-green-600';
      case 'good': return 'bg-blue-500 dark:bg-blue-600';
      case 'average': return 'bg-amber-500 dark:bg-amber-600';
      case 'poor': return 'bg-orange-500 dark:bg-orange-600';
      case 'critical': return 'bg-red-500 dark:bg-red-600';
      default: return 'bg-slate-500 dark:bg-slate-600';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'average': return 'Average';
      case 'poor': return 'Poor';
      case 'critical': return 'Needs Attention';
      default: return 'Unknown';
    }
  };

  // Get course that needs the most attention
  const priorityCourse = courseCompletionData
    .sort((a, b) => a.completionRate - b.completionRate)[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {user?.name}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening with GlobalSelect Academy today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Date</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Learners" 
          value={fetchedUsers.length}
          icon={<Users size={24} className="text-blue-600 dark:text-blue-400" />} 
          change="12% last month" 
          changeType="positive" 
        />
        <StatCard 
          title="Active Courses" 
          value={fetchedCourses.length}
          icon={<BookOpen size={24} className="text-blue-600 dark:text-blue-400" />} 
          change="3 new this month" 
          changeType="positive" 
        />
        <StatCard 
          title="Certificates Issued" 
          value="327" 
          icon={<Award size={24} className="text-blue-600 dark:text-blue-400" />} 
          change="18 this week" 
          changeType="positive" 
        />
        <StatCard 
          title="Documents Uploaded" 
          value="1,248" 
          icon={<FileText size={24} className="text-blue-600 dark:text-blue-400" />} 
        />
        <StatCard 
          title="Assets Assigned" 
          value="142" 
          icon={<Package size={24} className="text-blue-600 dark:text-blue-400" />} 
          change="5 pending returns" 
          changeType="neutral" 
        />
        <StatCard 
          title="Appointments" 
          value="38" 
          icon={<Calendar size={24} className="text-blue-600 dark:text-blue-400" />} 
          change="6 this week" 
          changeType="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityItem 
              title="New User Registration" 
              time="Just now"
              description="James Wilson completed registration and needs document verification."
              icon={<Users size={18} className="text-blue-600 dark:text-blue-400" />}
            />
            <RecentActivityItem 
              title="Certificate Generated" 
              time="2 hours ago"
              description="15 learners received their 'Advanced Project Management' certificates."
              icon={<Award size={18} className="text-blue-600 dark:text-blue-400" />}
            />
            <RecentActivityItem 
              title="Course Published" 
              time="Yesterday"
              description="'Data Privacy Essentials' course is now live with 8 lessons and 1 quiz."
              icon={<BookOpen size={18} className="text-blue-600 dark:text-blue-400" />}
            />
            <RecentActivityItem 
              title="Asset Assignment" 
              time="2 days ago"
              description="12 new laptops were assigned to the customer service team."
              icon={<Package size={18} className="text-blue-600 dark:text-blue-400" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Course Completion Rates</CardTitle>
            <Link 
              to="/admin/analytics" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              View detailed analytics
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                <div className="text-blue-600 dark:text-blue-400 text-xl font-bold">{avgCompletionRate}%</div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Average Completion Rate</h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                  <span>Across {courseCompletionData.length} active courses</span>
                </div>
              </div>
              <div className="ml-auto flex space-x-2">
                <div className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                  {courseCounts.excellent + courseCounts.good} good
                </div>
                <div className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                  {courseCounts.poor + courseCounts.critical} needs attention
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {courseCompletionData.map((course, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate pr-2">
                          {course.name}
                        </span>
                        {course.trend === 'increase' ? (
                          <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {course.completed} / {course.totalEnrolled}
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full 
                        ${course.status === 'excellent' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                          course.status === 'good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 
                          course.status === 'average' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 
                          course.status === 'poor' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' : 
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}
                      >
                        {course.completionRate}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStatusColor(course.status)} transition-all duration-500 ease-out`} 
                      style={{ width: `${course.completionRate}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {course.trend === 'increase' 
                        ? <span className="text-green-600 dark:text-green-400">↑ {course.trendValue}% from last month</span> 
                        : <span className="text-red-600 dark:text-red-400">↓ {course.trendValue}% from last month</span>}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {getStatusText(course.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {priorityCourse.status === 'critical' && (
              <div className="mt-6 p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-start">
                <div className="mr-3 mt-0.5">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-300">Attention Required</h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    "{priorityCourse.name}" has a critically low completion rate ({priorityCourse.completionRate}%). 
                    Consider reviewing course content or sending reminders to enrolled learners.
                  </p>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="mt-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;