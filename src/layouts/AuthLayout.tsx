"use client"

import { Outlet, Navigate, useLocation, Link } from "react-router-dom"
import { useUser } from "../contexts/UserContext"

const AuthLayout = () => {
  const { isAuthenticated, user } = useUser()
  const location = useLocation()
  const isAcceptInvite = location.pathname === "/accept-invite"

  // Redirect if already authenticated
  if (isAuthenticated && !isAcceptInvite) {
    // Navigate to appropriate dashboard based on role
    const role = user?.role?.toLowerCase();
    let redirectPath = '/';

    if (role === 'superadmin' || role === 'admin' || role === 'manager') {
      redirectPath = '/admin';
    } else if (role === 'teacher') {
      redirectPath = '/teacher';
    } else if (role === 'learner') {
      redirectPath = '/learner';
    }

    return <Navigate to={redirectPath} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 ">
        {/* Brand section (left on desktop, hidden on mobile) */}
        <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-1/2 h-screen bg-gradient-to-br from-[#2369f4] via-blue-600 to-indigo-700 text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10  ">
            <div
              className="absolute inset-0 "
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          <div className="max-w-md mx-auto relative z-10 lg:pt-16 lg:pb-16 ">
            <div className="flex items-center mb-8 group pt-20 ">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-3 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">GA</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Global Academy
                </h1>
                <p className="text-blue-100 text-sm font-medium">Learning Excellence</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4 leading-tight">Transform Your Learning Journey</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Join thousands of learners advancing their careers through our comprehensive courses, interactive
                  sessions, and industry-recognized certifications.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group">
                  <div className="text-3xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="text-blue-100 text-sm font-medium">Expert Courses</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group">
                  <div className="text-3xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    15k+
                  </div>
                  <div className="text-blue-100 text-sm font-medium">Active Learners</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group">
                  <div className="text-3xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    98%
                  </div>
                  <div className="text-blue-100 text-sm font-medium">Success Rate</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group">
                  <div className="text-3xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    24/7
                  </div>
                  <div className="text-blue-100 text-sm font-medium">Support</div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl">
                <p className="text-blue-100 italic text-sm leading-relaxed">
                  "Global Academy transformed my career. The interactive courses and expert guidance helped me gain the
                  skills I needed to advance professionally."
                </p>
                <div className="mt-3 flex items-center">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">SJ</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-white text-sm font-medium">Sarah Johnson</p>
                    <p className="text-blue-200 text-xs">Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth form section */}
        <div className="w-full lg:ml-[50%] lg:w-1/2 flex justify-center items-start p-8 lg:p-12 min-h-screen">
          <div className="w-full max-w-lg">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm border border-white border-opacity-50 rounded-2xl shadow-2xl p-8 lg:p-10">
              {/* Back Home button */}
              <div className="mb-6">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Link>
              </div>

              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
