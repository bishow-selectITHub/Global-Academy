"use client"

import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import {
  BookOpen,
  Award,
  FileText,
  Package,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  Moon,
  Sun,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useUser } from "../contexts/UserContext"
import GlobalSearch from "../components/global/GlobalSearch"
import { useTheme } from "../contexts/ThemeContext"

const LearnerLayout = () => {
  const { user, logout } = useUser()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, color: "bg-blue-500" },
    { path: "/courses", label: "My Courses", icon: <BookOpen size={20} />, color: "bg-emerald-500" },
    { path: "/certificates", label: "Certificates", icon: <Award size={20} />, color: "bg-amber-500" },
    { path: "/documents", label: "Documents", icon: <FileText size={20} />, color: "bg-purple-500" },
    { path: "/assets", label: "My Assets", icon: <Package size={20} />, color: "bg-indigo-500" },
    { path: "/profile", label: "Profile", icon: <User size={20} />, color: "bg-rose-500" },
    { path: "/learning-insights", label: "Learning Insights", icon: <PieChart size={20} />, color: "bg-teal-500" },
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
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 fixed w-full z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center group">
                <div className="h-10 w-10 mr-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-lg">GS</span>
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent hidden sm:block">
                  GlobalSelect Academy
                </h1>
              </Link>
            </div>

            {/* Desktop Search and User Section */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <GlobalSearch />
              </div>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <div className="relative ml-3">
                <div className="flex items-center bg-white/50 dark:bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-slate-700/50">
                  <img
                    src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                    alt={user?.name}
                    className="h-8 w-8 rounded-lg mr-3 ring-2 ring-white shadow-sm"
                  />
                  <div className="mr-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isLoggingOut ? "Logging out..." : "Logout"}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 mr-2 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md dark:bg-slate-800/95 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="px-4 pt-4 pb-3">
            <GlobalSearch />
          </div>
          <div className="px-2 pt-2 pb-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive(item.path)
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={`p-2 ${item.color} rounded-lg mr-4 shadow-sm`}>
                  <div className="text-white">{item.icon}</div>
                </div>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <div className="p-2 bg-red-500 rounded-lg mr-4 shadow-sm">
                <LogOut size={20} className="text-white" />
              </div>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full mt-16">
        {/* Left Sidebar - Desktop Only */}
        <aside
          className={`hidden h-screen fixed md:flex md:flex-col border-r border-slate-200/50 dark:border-slate-700/50 bg-white/80 backdrop-blur-md dark:bg-slate-800/80 transition-all duration-300 shadow-lg ${sidebarCollapsed ? "md:w-20" : "md:w-72"
            }`}
        >
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Navigation
                </h2>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200 ${sidebarCollapsed ? "mx-auto" : ""}`}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <div className="flex-1 py-4 flex flex-col justify-between">
            <nav className="space-y-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:shadow-sm"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <div
                    className={`p-2 ${item.color} rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200 ${sidebarCollapsed ? "" : "mr-3"}`}
                  >
                    <div className="text-white">{item.icon}</div>
                  </div>
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>

            <div className="px-4 pt-4">
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <img
                      src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                      alt={user?.name}
                      className="h-10 w-10 rounded-xl ring-2 ring-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    title={isLoggingOut ? "Logging out..." : "Logout"}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      <img
                        src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=DI"}
                        alt={user?.name}
                        className="h-12 w-12 rounded-xl mr-3 border-2 border-slate-200 dark:border-slate-600"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"
            } overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100 relative z-0`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LearnerLayout
