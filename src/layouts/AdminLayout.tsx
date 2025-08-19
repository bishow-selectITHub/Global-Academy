import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
  User,
  Menu,
  X,
  Moon,
  Sun,
  PieChart
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import GlobalSearch from '../components/global/GlobalSearch';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = () => {
  const { user, logout } = useUser();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/courses', label: 'Courses', icon: <BookOpen size={20} /> },
    { path: '/admin/quizzes', label: 'Quizzes', icon: <Clipboard size={20} /> },
    { path: '/admin/certificates', label: 'Certificates', icon: <Award size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/assets', label: 'Assets', icon: <Package size={20} /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <PieChart size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Top Bar - Mobile Only */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="https://placehold.co/40x40/2563eb/ffffff?text=GS"
            alt="GlobalSelect Academy"
            className="h-10 w-10 mr-3"
          />
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Admin Portal</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-800">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Admin Portal</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-6">
                <div className="flex items-center">
                  <img
                    src={user?.avatar || "https://placehold.co/40x40?text=U"}
                    alt={user?.name}
                    className="h-12 w-12 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 mb-4">
                <GlobalSearch />
              </div>
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-4 py-3 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={20} className="mr-3" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar - Desktop Only */}
        <aside
          className={`hidden h-screen sticky top-0 left-0 md:flex md:flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 ${collapsed ? 'md:w-20' : 'md:w-64'
            }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
              <img
                src="https://placehold.co/40x40/2563eb/ffffff?text=GS"
                alt="GlobalSelect Academy"
                className="h-10 w-10"
              />
              {!collapsed && (
                <h1 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-100">GS Academy</h1>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${collapsed ? 'mx-auto' : ''}`}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <div className={`p-2 ${collapsed ? 'px-2' : 'px-3'} border-b border-slate-200 dark:border-slate-700`}>
            {collapsed ? (
              <div className="flex justify-center py-2">
                <button
                  className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  onClick={toggleTheme}
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </div>
            ) : (
              <GlobalSearch />
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-md text-sm font-medium ${isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <span className={collapsed ? '' : 'mr-3'}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {collapsed ? (
              <div className="flex flex-col items-center">
                <img
                  src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                  alt={user?.name}
                  className="h-10 w-10 rounded-full mb-2"
                />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isLoggingOut ? "Logging out..." : "Logout"}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <img
                    src={user?.avatar || "https://placehold.co/40x40/2563eb/ffffff?text=U"}
                    alt={user?.name}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={18} className="mr-2" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;