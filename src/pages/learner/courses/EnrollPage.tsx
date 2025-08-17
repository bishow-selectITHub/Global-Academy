import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toaster';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { useUser } from '../../../contexts/UserContext';
import { supabase } from '../../../lib/supabase';
import { fetchEnrollments, invalidateEnrollmentsForUser } from '../../../store/enrollmentsSlice';

// Removed unused local interfaces

const EnrollPage = () => {
  const { user } = useUser();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Defensive check for courses slice
  const courseSlice = useSelector((state: RootState) => state.courses || { data: [] });
  const course = courseSlice.data.find((c: any) => c.id === courseId);

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
        <p className="text-slate-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses">
          <Button>Back to Course Catalog</Button>
        </Link>
      </div>
    );
  }

  const [billingName, setBillingName] = React.useState(user?.name || '');
  const [country, setCountry] = React.useState('');

  const handleStartFreeTrial = async () => {
    console.log('handleStartFreeTrial called');
    console.log('User:', user);
    console.log('Course:', course);
    console.log('Billing name:', billingName);
    console.log('Country:', country);

    if (!user) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Please log in to enroll.',
        duration: 3000,
      });
      return;
    }

    if (!course) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Course details not loaded.',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Checking for existing enrollment...');
      // Check if user is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single();

      console.log('Existing enrollment check result:', { existingEnrollment, checkError });

      if (existingEnrollment) {
        addToast({
          type: 'info',
          title: 'Already enrolled',
          message: 'You are already enrolled in this course.',
          duration: 3000,
        });
        // Invalidate and refetch enrollments, then redirect
        dispatch(invalidateEnrollmentsForUser(user.id));
        await dispatch(fetchEnrollments(user.id));
        navigate(`/courses/${course.id}`);
        return;
      }

      console.log('Creating new enrollment...');
      // Create enrollment with empty lessons array (will be populated later)
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,

          lessons: [],

        })
        .select();

      console.log('Enrollment result:', { data, error });

      if (error) throw error;

      if (data) {
        addToast({
          type: 'success',
          title: 'Enrollment successful!',
          message: 'You have been enrolled in the course.',
          duration: 3000,
        });
        // Invalidate and refetch enrollments, then redirect
        dispatch(invalidateEnrollmentsForUser(user.id));
        await dispatch(fetchEnrollments(user.id));
        navigate(`/courses/${course.id}`);
        return;
      }

      addToast({
        type: 'success',
        title: 'Enrollment successful!',
        message: 'You have started your free trial.',
        duration: 5000,
      });

      // Navigate to the course view
      navigate(`/courses/${course.id}`);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      addToast({
        type: 'error',
        title: 'Enrollment failed',
        message: error.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 rounded-lg"></div>
            <div className="h-64 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
        <p className="text-slate-600 mb-6">The course you're trying to enroll in does not exist.</p>
        <Button onClick={() => navigate('/courses')}>Back to Course Catalog</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">All fields are required</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          Course available!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Billing Information */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Billing information</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              <Input
                id="name"
                label="NAME"
                placeholder="Enter your full name"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                fullWidth
                disabled={isLoading}
              />
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  COUNTRY
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 p-2"
                  disabled={isLoading}
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {/* Credit Card / Payment details would go here in a real implementation */}
              <div className="mt-2 flex justify-between items-center">
                <Button
                  onClick={handleStartFreeTrial}
                  isLoading={isLoading}
                  disabled={false}
                  className="px-8 py-3 text-lg"
                >
                  Start Free Trial
                </Button>
                <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">You won't be charged today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <Card className="p-6 sticky top-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-700 flex items-center justify-center rounded-md mr-3">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{course.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Course</p>
                <button className="text-blue-600 hover:underline text-sm mt-1">Remove from cart</button>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700 dark:text-slate-300">No commitment. Cancel anytime.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Monthly subscription</span>
                <span className="font-bold text-green-600">7-Day Free Trial</span>
              </div>
              <p className="text-right text-sm text-slate-500 dark:text-slate-400">then $49 USD/mo</p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Today's Total:</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">$0 USD</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              Your subscription begins today with a 7-day free trial. If you
              decide to stop during the trial period, visit My Purchases to
              cancel before June 19, 2025 and your card won't be
              charged. We can't issue refunds once your card is charged.
            </p>

            {/* Testimonial */}
            <Card className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Leah B."
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-2">
                    "I attribute a lot to Global Select Academy - it's given
                    me not only career skills, but passion
                    and meaning in my life."
                  </p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">— Leah B.</p>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="flex justify-around items-center mt-6 text-center">
              <div>
                <span className="block text-xl font-bold text-slate-900 dark:text-slate-100">140 Million+</span>
                <span className="block text-sm text-slate-600 dark:text-slate-400">Learners</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-slate-900 dark:text-slate-100">10,000+</span>
                <span className="block text-sm text-slate-600 dark:text-slate-400">Courses</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnrollPage;