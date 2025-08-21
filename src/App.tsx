"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { UserProvider } from "./contexts/UserContext"
import { ToastProvider } from "./components/ui/Toaster"
import { ThemeProvider } from "./contexts/ThemeContext"
import { useDispatch, useSelector } from "react-redux"
import { fetchCourses } from "./store/coursesSlice"
import { fetchEnrollments } from "./store/enrollmentsSlice"
import type { RootState, AppDispatch } from "./store"
import { useUser } from "./contexts/UserContext"
import AuthGuard from "./components/guards/AuthGuard"
import RoleGuard from "./components/guards/RoleGuard"
import TeacherDashboard from "./pages/teacher/Dashboard"

// Layouts
import AdminLayout from "./layouts/AdminLayout"
import LearnerLayout from "./layouts/LearnerLayout"
import AuthLayout from "./layouts/AuthLayout"
import TeacherLayout from "./layouts/TeacherLayout"
import LandingLayout from "./layouts/LandingLayout"

// Auth Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import AcceptInvitation from "./pages/auth/AcceptInvitation"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import CourseManagement from "./pages/admin/courses/CourseManagement"
import CourseEditor from "./pages/admin/courses/CourseEditor"
import LessonEditor from "./pages/admin/courses/LessonEditor"
import QuizBuilder from "./pages/admin/quizzes/QuizBuilder"
import QuizManagement from "./pages/admin/quizzes/QuizManagement"
import CertificateTemplates from "./pages/admin/certificates/CertificateTemplates"
import UserManagement from "./pages/admin/users/UserManagement"
import AssetManagement from "./pages/admin/assets/AssetManagement"
import AnalyticsDashboard from "./pages/admin/analytics/AnalyticsDashboard"

// Learner Pages
import LearnerDashboard from "./pages/learner/Dashboard"
import CourseCatalog from "./pages/learner/courses/CourseCatalog"
import CourseView from "./pages/learner/courses/CourseView"
import LessonView from "./pages/learner/courses/LessonView"
import QuizAttempt from "./pages/learner/quizzes/QuizAttempt"
import MyCertificates from "./pages/learner/certificates/MyCertificates"
import MyProfile from "./pages/learner/profile/MyProfile"
import MyDocuments from "./pages/learner/documents/MyDocuments"
import MyAssets from "./pages/learner/assets/MyAssets"
import LearningInsights from "./pages/learner/learning-insights/LearningInsights"

// Landing Pages
import Home from "./pages/landing/Home"
import Features from "./pages/landing/Features"
import Pricing from "./pages/landing/Pricing"
import Testimonials from "./pages/landing/Testimonials"
import About from "./pages/landing/About"
import Contact from "./pages/landing/Contact"
import TeacherCourses from "./pages/teacher/courses/TeacherCourses"
import TeacherAttendance from "./pages/teacher/attendance"

function Prefetcher() {
  const dispatch = useDispatch<AppDispatch>()
  const coursesLoaded = useSelector((s: RootState) => s.courses.loaded)
  const coursesLoading = useSelector((s: RootState) => s.courses.loading)
  const { isAuthenticated, user } = useUser()
  useEffect(() => {
    if (isAuthenticated && !coursesLoaded && !coursesLoading) {
      dispatch(fetchCourses())
    }
  }, [dispatch, coursesLoaded, coursesLoading, isAuthenticated])

  const enrollmentsLoadedForUser = useSelector((s: RootState) => s.enrollments.loadedForUserId)
  const enrollmentsLoading = useSelector((s: RootState) => s.enrollments.loading)
  useEffect(() => {
    if (isAuthenticated && user?.id && enrollmentsLoadedForUser !== user.id && !enrollmentsLoading) {
      dispatch(fetchEnrollments(user.id))
    }
  }, [dispatch, isAuthenticated, user?.id, enrollmentsLoadedForUser, enrollmentsLoading])

  useEffect(() => {
    const onOnline = () => {
      if (isAuthenticated && !coursesLoaded && !coursesLoading) {
        dispatch(fetchCourses())
      }
      if (isAuthenticated && user?.id && enrollmentsLoadedForUser !== user.id && !enrollmentsLoading) {
        dispatch(fetchEnrollments(user.id))
      }
    }
    window.addEventListener("online", onOnline)
    return () => window.removeEventListener("online", onOnline)
  }, [dispatch, isAuthenticated, coursesLoaded, coursesLoading, user?.id, enrollmentsLoadedForUser, enrollmentsLoading])
  return null
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <UserProvider>
            <Prefetcher />
            <Routes>
              <Route element={<LandingLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/accept-invite" element={<AcceptInvitation />} />
              </Route>

              {/* Admin Routes */}
              <Route
                element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={["superadmin", "admin", "manager"]}>
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

              {/* Teacher Routes */}
              <Route
                element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={["teacher"]}>
                      <TeacherLayout />
                    </RoleGuard>
                  </AuthGuard>
                }
              >
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/join-meeting" element={<TeacherCourses />} />
                <Route path="/teacher/attendance" element={<TeacherAttendance />} />
              </Route>

              {/* Learner Routes */}
              <Route
                element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={["learner"]}>
                      <LearnerLayout />
                    </RoleGuard>
                  </AuthGuard>
                }
              >
                <Route path="/dashboard" element={<LearnerDashboard />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/courses/:id" element={<CourseView />} />

                <Route path="/enroll/:courseId" element={<CourseView />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                <Route path="/courses/:courseId/quiz" element={<QuizAttempt />} />
                <Route path="/certificates" element={<MyCertificates />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/documents" element={<MyDocuments />} />
                <Route path="/assets" element={<MyAssets />} />
                <Route path="/learning-insights" element={<LearningInsights />} />
              </Route>

              {/* Public Live Join (token protected) */}
            </Routes>
          </UserProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
