import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './components/ui/Toaster';
import { ThemeProvider } from './contexts/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from './store/coursesSlice';
import { fetchEnrollments } from './store/enrollmentsSlice';
import type { RootState, AppDispatch } from './store';
import { useUser } from './contexts/UserContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import LearnerLayout from './layouts/LearnerLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CourseManagement from './pages/admin/courses/CourseManagement';
import CourseEditor from './pages/admin/courses/CourseEditor';
import LessonEditor from './pages/admin/courses/LessonEditor';
import QuizBuilder from './pages/admin/quizzes/QuizBuilder';
import QuizManagement from './pages/admin/quizzes/QuizManagement';
import CertificateTemplates from './pages/admin/certificates/CertificateTemplates';
import UserManagement from './pages/admin/users/UserManagement';
import AssetManagement from './pages/admin/assets/AssetManagement';
import AnalyticsDashboard from './pages/admin/analytics/AnalyticsDashboard';
import CourseView from './pages/learner/courses/CourseView';

// Learner Pages
import LearnerDashboard from './pages/learner/Dashboard';
import CourseCatalog from './pages/learner/courses/CourseCatalog';
import LessonView from './pages/learner/courses/LessonView';
import QuizAttempt from './pages/learner/quizzes/QuizAttempt';
import MyCertificates from './pages/learner/certificates/MyCertificates';
import MyProfile from './pages/learner/profile/MyProfile';
import MyDocuments from './pages/learner/documents/MyDocuments';
import MyAssets from './pages/learner/assets/MyAssets';
import LearningInsights from './pages/learner/learning-insights/LearningInsights';
import LiveSessionJoin from './pages/learner/courses/LiveSessionJoin';

// Guards
import AuthGuard from './components/guards/AuthGuard';
import RoleGuard from './components/guards/RoleGuard';
import EnrollPage from './pages/learner/courses/EnrollPage';

function Prefetcher() {
  const dispatch = useDispatch<AppDispatch>();
  const coursesLoaded = useSelector((s: RootState) => s.courses.loaded);
  const coursesLoading = useSelector((s: RootState) => s.courses.loading);
  const { isAuthenticated, user } = useUser();
  useEffect(() => {
    if (isAuthenticated && !coursesLoaded && !coursesLoading) {
      dispatch(fetchCourses());
    }
  }, [dispatch, coursesLoaded, coursesLoading, isAuthenticated]);

  const enrollmentsLoadedForUser = useSelector((s: RootState) => s.enrollments.loadedForUserId);
  const enrollmentsLoading = useSelector((s: RootState) => s.enrollments.loading);
  useEffect(() => {
    if (isAuthenticated && user?.id && enrollmentsLoadedForUser !== user.id && !enrollmentsLoading) {
      dispatch(fetchEnrollments(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id, enrollmentsLoadedForUser, enrollmentsLoading]);

  useEffect(() => {
    const onOnline = () => {
      if (isAuthenticated && !coursesLoaded && !coursesLoading) {
        dispatch(fetchCourses());
      }
      if (isAuthenticated && user?.id && enrollmentsLoadedForUser !== user.id && !enrollmentsLoading) {
        dispatch(fetchEnrollments(user.id));
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [dispatch, isAuthenticated, coursesLoaded, coursesLoading, user?.id, enrollmentsLoadedForUser, enrollmentsLoading]);
  return null;
}

function App() {

  return (
    <ThemeProvider>
      <ToastProvider>

        <Router>
          <UserProvider>
            <Prefetcher />
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Admin Routes */}
              <Route
                element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['superadmin']}>
                      <AdminLayout />
                    </RoleGuard>
                  </AuthGuard>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses" element={<CourseManagement />} />
                <Route path="/admin/courses/new" element={<CourseEditor />} />
                <Route path="/admin/courses/:id" element={<CourseEditor />} />
                <Route path="/admin/courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
                <Route path="/admin/quizzes" element={<QuizManagement />} />
                <Route path="/admin/courses/:courseId/quiz" element={<QuizBuilder />} />
                <Route path="/admin/certificates" element={<CertificateTemplates />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/assets" element={<AssetManagement />} />
                <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              </Route>

              {/* Learner Routes */}
              <Route
                element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['learner']}>
                      <LearnerLayout />
                    </RoleGuard>
                  </AuthGuard>
                }
              >
                <Route path="/dashboard" element={<LearnerDashboard />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/courses/:id" element={<CourseView />} />
                <Route path="/live/join" element={<LiveSessionJoin />} />
                <Route path="/enroll/:courseId" element={<EnrollPage />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                <Route path="/courses/:courseId/quiz" element={<QuizAttempt />} />
                <Route path="/certificates" element={<MyCertificates />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/documents" element={<MyDocuments />} />
                <Route path="/assets" element={<MyAssets />} />
                <Route path="/learning-insights" element={<LearningInsights />} />
                <Route path="/courses/view/:id" element={<CourseView />} />
              </Route>

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>


          </UserProvider>
        </Router>

      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;