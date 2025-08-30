"use client"

import React from "react"

import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import {
  BookOpen,
  Users,
  Award,
  Clipboard,
  Package,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  PieChart,
  Video,
} from "lucide-react"
import { useUser } from "../contexts/UserContext"
import GlobalSearch from "../components/global/GlobalSearch"
import { useTheme } from "../contexts/ThemeContext"

const AdminLayout = () => {
  const { user, logout } = useUser()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/courses", label: "Courses", icon: <BookOpen size={20} /> },
    { path: "/admin/meetings", label: "Meetings", icon: <Video size={20} /> },
    { path: "/admin/quizzes", label: "Quizzes", icon: <Clipboard size={20} /> },
    { path: "/admin/certificates", label: "Certificates", icon: <Award size={20} /> },
    { path: "/admin/users", label: "Users", icon: <Users size={20} /> },
    { path: "/admin/assets", label: "Assets", icon: <Package size={20} /> },
    { path: "/admin/analytics", label: "Analytics", icon: <PieChart size={20} /> },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Top Bar - Mobile Only */}
      <div className="md:hidden bg-white/80 backdrop-blur-md dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          {/* Enhanced logo with gradient background */}
          <div className="h-10 w-10 mr-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">GS</span>
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Admin Portal
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-md dark:bg-slate-800/95 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-6">
                <div className="flex items-center bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
                  <img
                    src={user?.avatar || "https://placehold.co/40x40?text=U"}
                    alt={user?.name}
                    className="h-12 w-12 rounded-xl mr-3 ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 mb-4">
                <GlobalSearch />
              </div>
              <nav className="space-y-2 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {/* Added color-coded icon backgrounds */}
                    <div className={`p-2 rounded-lg mr-3 shadow-sm ${getIconColor(item.path)}`}>
                      <div className="text-white">{item.icon}</div>
                    </div>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <div className="p-2 bg-red-500 rounded-lg mr-3 shadow-sm">
                    <LogOut size={20} className="text-white" />
                  </div>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar - Desktop Only */}
        <aside
          className={`hidden h-screen sticky top-0 left-0 md:flex md:flex-col border-r border-slate-200/50 dark:border-slate-700/50 bg-white/80 backdrop-blur-md dark:bg-slate-800/80 transition-all duration-300 shadow-lg ${collapsed ? "md:w-20" : "md:w-72"
            }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div className={`flex items-center ${collapsed ? "justify-center w-full" : ""}`}>
                {/* Enhanced logo with gradient */}
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">GS</span>
                </div>
                {!collapsed && (
                  <h1 className="ml-3 text-sm font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    GS Academy
                  </h1>
                )}
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`p-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200 ${collapsed ? "mx-auto" : ""}`}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <div className={`p-2 ${collapsed ? "px-2" : "px-3"} border-b border-slate-200/50 dark:border-slate-700/50`}>
              {collapsed ? (
                <div className="flex justify-center py-1">
                  <button
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all duration-200"
                    onClick={toggleTheme}
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                  >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                </div>
              ) : (
                <GlobalSearch />
              )}
            </div>

            <div className="flex-1 py-2">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:shadow-sm"
                      } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : ""}
                  >
                    {/* Added color-coded icon backgrounds with hover effects */}
                    <div
                      className={`p-1.5 rounded-md shadow-sm group-hover:shadow-md transition-shadow duration-200 ${getIconColor(item.path)} ${collapsed ? "" : "mr-2"}`}
                    >
                      <div className="text-white">{React.cloneElement(item.icon, { size: 14 })}</div>
                    </div>
                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50">
              {collapsed ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <img
                      src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                      alt={user?.name}
                      className="h-8 w-8 rounded-lg ring-2 ring-white shadow-lg"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    title={isLoggingOut ? "Logging out..." : "Logout"}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="relative">
                      <img
                        src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                        alt={user?.name}
                        className="h-9 w-9 rounded-lg mr-2.5 border-2 border-slate-200 dark:border-slate-600"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{user?.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center px-2.5 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-700"
                  >
                    <LogOut size={12} className="mr-1.5" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const getIconColor = (path: string) => {
  const colorMap: { [key: string]: string } = {
    "/admin": "bg-gradient-to-br from-blue-500 to-blue-600",
    "/admin/courses": "bg-gradient-to-br from-emerald-500 to-emerald-600",
    "/admin/meetings": "bg-gradient-to-br from-purple-500 to-purple-600",
    "/admin/quizzes": "bg-gradient-to-br from-amber-500 to-amber-600",
    "/admin/certificates": "bg-gradient-to-br from-orange-500 to-orange-600",
    "/admin/users": "bg-gradient-to-br from-rose-500 to-rose-600",
    "/admin/assets": "bg-gradient-to-br from-indigo-500 to-indigo-600",
    "/admin/analytics": "bg-gradient-to-br from-teal-500 to-teal-600",
  }
  return colorMap[path] || "bg-gradient-to-br from-slate-500 to-slate-600"
}

export default AdminLayout
