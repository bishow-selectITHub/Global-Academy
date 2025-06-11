import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, BarChart, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';
import { supabase } from '../../../lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  displayEnrolled: number;
  enrollments?: {
    count: number;
  }[];
}

// Mock course data
const coursesData = [
  {
    id: '1',
    title: 'Onboarding Essentials',
    description: 'A comprehensive introduction to company policies, procedures, and culture.',
    thumbnail: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Onboarding',
    level: 'Beginner',
    duration: '2 hours',
    enrolled: 342,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Data Security Fundamentals',
    description: 'Learn the essential practices for keeping company and client data secure.',
    thumbnail: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Security',
    level: 'Intermediate',
    duration: '3 hours',
    enrolled: 256,
    rating: 4.7,
  },
  {
    id: '3',
    title: 'Client Communication',
    description: 'Develop effective communication skills for client interactions.',
    thumbnail: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Soft Skills',
    level: 'Intermediate',
    duration: '2.5 hours',
    enrolled: 189,
    rating: 4.6,
  },
  {
    id: '4',
    title: 'Advanced Excel for Business',
    description: 'Master advanced Excel features for data analysis and reporting.',
    thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Technical',
    level: 'Advanced',
    duration: '4.5 hours',
    enrolled: 134,
    rating: 4.9,
  },
  {
    id: '5',
    title: 'Leadership Essentials',
    description: 'Develop leadership skills to effectively manage teams and projects.',
    thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Leadership',
    level: 'Intermediate',
    duration: '3 hours',
    enrolled: 178,
    rating: 4.5,
  },
  {
    id: '6',
    title: 'Project Management Fundamentals',
    description: 'Learn the basics of project management methodologies and best practices.',
    thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Project Management',
    level: 'Beginner',
    duration: '4 hours',
    enrolled: 212,
    rating: 4.7,
  }
];

// Categories for filtering
const categories = [
  'All Categories',
  'Onboarding',
  'Security',
  'Technical',
  'Soft Skills',
  'Leadership',
  'Project Management'
];

// Levels for filtering
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('popular'); // 'popular', 'newest', 'rating'
  const [isLoading,setIsLoading] = useState(true);
  const [enrolledCount,setEnrolledCount] = useState(0)
  const {user} = useUser();
  const [courses,setCourses] = useState<Course[]>([])
  const {addToast} = useToast();
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('course_enrollments')
          .select('courses (*, enrollments:course_enrollments(count))')
          .eq('user_id', user.id);

        if (error) throw error;

        const enrolledCourses = data.map((enrollment: any) => {
          const course = enrollment.courses;
          const displayEnrolled = course.enrollments?.length || 0;
          
          return {
            ...course,
            displayEnrolled,
          } as Course;
        });

        setCourses(enrolledCourses);
      } catch (error: any) {
        addToast({
          title: "Error receiving courses",
          message: error.message,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user, addToast]);

  // Filter courses based on search query, category, and level
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Sort courses based on selected option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortOption === 'popular') {
      return b.displayEnrolled - a.displayEnrolled;
    } else if (sortOption === 'rating') {
      return b.rating - a.rating;
    } else {
      // Assuming newest would be based on ID for demo purposes
      return parseInt(b.id) - parseInt(a.id);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
        <p className="text-slate-600 mt-1">
          Browse our collection of professional development courses.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="secondary" size="sm" className="mr-2">
                  Apply Filters
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedLevel('All Levels');
                }}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {sortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {sortedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="aspect-video relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-slate-800">
                    {course.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{course.description}</p>
                
                <div className="flex flex-wrap items-center text-sm text-slate-500 mb-4 gap-2">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart size={16} className="mr-1" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag size={16} className="mr-1" />
                    <span>{course.displayEnrolled} enrolled</span>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 ml-1">{course.rating?.toFixed(1)}</span>
                </div>
                
                <div className="mt-auto">
                  <Link to={`/courses/${course.id}`}>
                    <Button fullWidth>View Course</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-full mb-4">
            <Search size={24} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No courses found</h3>
          <p className="text-slate-600 mb-4">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All Categories');
            setSelectedLevel('All Levels');
          }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;