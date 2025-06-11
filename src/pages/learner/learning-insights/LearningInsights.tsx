import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Clock, 
  Award, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Download,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for charts
const weeklyProgressData = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 30 },
  { day: 'Wed', minutes: 60 },
  { day: 'Thu', minutes: 15 },
  { day: 'Fri', minutes: 75 },
  { day: 'Sat', minutes: 120 },
  { day: 'Sun', minutes: 45 },
];

const subjectDistributionData = [
  { subject: 'Security', percentage: 35 },
  { subject: 'Soft Skills', percentage: 25 },
  { subject: 'Technical', percentage: 20 },
  { subject: 'Compliance', percentage: 15 },
  { subject: 'Leadership', percentage: 5 },
];

const skillGapAnalysis = [
  { skill: 'Data Security', proficiency: 85, target: 90 },
  { skill: 'Communication', proficiency: 75, target: 85 },
  { skill: 'Project Management', proficiency: 65, target: 80 },
  { skill: 'Leadership', proficiency: 50, target: 70 },
  { skill: 'Technical Writing', proficiency: 40, target: 60 },
];

const learningGoals = [
  { 
    id: 'goal-1', 
    title: 'Complete Security Certification', 
    target: 'May 30, 2025', 
    progress: 65,
    courses: 2,
    remaining: '3 modules'
  },
  { 
    id: 'goal-2', 
    title: 'Improve Presentation Skills', 
    target: 'July 15, 2025', 
    progress: 30,
    courses: 1,
    remaining: '4 lessons'
  },
  { 
    id: 'goal-3', 
    title: 'Master Excel Advanced Features', 
    target: 'August 10, 2025', 
    progress: 15,
    courses: 1,
    remaining: '6 modules'
  }
];

const recentActivities = [
  {
    id: 'act-1',
    type: 'course-progress',
    title: 'Completed module in Data Security',
    timestamp: 'Today at 10:30 AM',
    icon: <Award className="text-green-500" size={18} />
  },
  {
    id: 'act-2',
    type: 'quiz',
    title: 'Scored 90% on Communication Skills quiz',
    timestamp: 'Yesterday at 2:15 PM',
    icon: <Award className="text-blue-500\" size={18} />
  },
  {
    id: 'act-3',
    type: 'course-started',
    title: 'Started Advanced Excel course',
    timestamp: '3 days ago',
    icon: <BookOpen className="text-purple-500" size={18} />
  }
];

const LearningInsights = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Learning Insights</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your progress, analyze your learning patterns, and identify areas for growth.
        </p>
      </div>

      {/* Time period filter */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={timeframe === 'weekly' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'monthly' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'yearly' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Share2 size={16} />}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Time Spent Learning</p>
                <p className="text-2xl font-semibold dark:text-slate-100">14.5 hours</p>
                <p className="text-xs text-green-600 dark:text-green-400">↑ 12% from last {timeframe.slice(0, -2)}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Clock size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Course Completion Rate</p>
                <p className="text-2xl font-semibold dark:text-slate-100">78%</p>
                <p className="text-xs text-green-600 dark:text-green-400">↑ 5% from last {timeframe.slice(0, -2)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full">
                <BarChart3 size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Certifications Earned</p>
                <p className="text-2xl font-semibold dark:text-slate-100">2</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">On track for next certification</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                <Award size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Learning Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              {/* In a real app, this would be a chart component */}
              <div className="flex items-end justify-between h-64 pt-4">
                {weeklyProgressData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center w-full">
                    <div 
                      className="bg-blue-500 dark:bg-blue-600 rounded-t w-10 transition-all duration-500 ease-in-out"
                      style={{ height: `${(day.minutes / 120) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">{day.day}</div>
                    <div className="mt-1 text-xs font-medium dark:text-slate-300">{day.minutes}m</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              {/* This would be a pie chart in a real implementation */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {subjectDistributionData.reduce((acc, item, index) => {
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
            <div className="grid grid-cols-2 gap-4">
              {subjectDistributionData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 ${
                      ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500'][index % 5]
                    }`} 
                  />
                  <div>
                    <p className="text-sm font-medium dark:text-slate-300">{item.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {skillGapAnalysis.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium dark:text-slate-300">{skill.skill}</span>
                    <span className="text-sm font-medium dark:text-slate-300">{skill.proficiency}% of {skill.target}%</span>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${skill.proficiency >= skill.target ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${(skill.proficiency / skill.target) * 100}%` }}
                    />
                  </div>
                  {skill.proficiency < skill.target && (
                    <div className="mt-1">
                      <Link 
                        to="/courses" 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View recommended courses →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Goals and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningGoals.map(goal => (
                  <div 
                    key={goal.id} 
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => toggleGoalExpansion(goal.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium dark:text-slate-200">{goal.title}</h3>
                        <button className="text-slate-500 dark:text-slate-400">
                          {expandedGoal === goal.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                      
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">
                        <Calendar size={14} className="mr-1" />
                        <span>Target: {goal.target}</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{goal.progress}% complete</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{goal.remaining} remaining</span>
                      </div>
                    </div>
                    
                    {expandedGoal === goal.id && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Related Courses:</span>
                            <span className="text-sm font-medium dark:text-slate-300">{goal.courses}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              leftIcon={<Calendar size={14} />}
                            >
                              Adjust Target Date
                            </Button>
                            <Link to="/courses">
                              <Button 
                                size="sm" 
                                variant="primary" 
                                fullWidth
                              >
                                Continue Learning
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {activity.icon}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-slate-200">{activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Link 
                    to="/dashboard" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all activity
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningInsights;

// Import the necessary icon component 
import { BookOpen } from 'lucide-react';