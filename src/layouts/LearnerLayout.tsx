import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import GlobalSearch from '../components/global/GlobalSearch';
import { useTheme } from '../contexts/ThemeContext';

const LearnerLayout = () => {
  const { user, logout } = useUser();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { path: '/certificates', label: 'Certificates', icon: <Award size={20} /> },
    { path: '/documents', label: 'Documents', icon: <FileText size={20} /> },
    { path: '/assets', label: 'My Assets', icon: <Package size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/learning-insights', label: 'Learning Insights', icon: <PieChart size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img
                  src="https://via.placeholder.com/40x40.png?text=GS"
                  alt="GlobalSelect Academy"
                  className="h-10 w-10 mr-3"
                />
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
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
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button className="flex items-center">
                    <img
                      src={user?.profilePicture || "https://via.placeholder.com/40x40.png?text=U"}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-1">{user?.name}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    title="Logout"
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
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 pt-4 pb-3">
            <GlobalSearch />
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Left Sidebar - Desktop Only */}
        <aside 
          className={`hidden md:flex md:flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 ${
            sidebarCollapsed ? 'md:w-20' : 'md:w-64'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Navigation</h2>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${sidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className={sidebarCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                  {!sidebarCollapsed && item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center">
                <img
                  src={user?.profilePicture || "https://via.placeholder.com/40x40.png?text=U"}
                  alt={user?.name}
                  className="h-10 w-10 rounded-full mb-2"
                />
                <button
                  onClick={logout}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <img
                    src={user?.profilePicture || "https://via.placeholder.com/40x40.png?text=U"}
                    alt={user?.name}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearnerLayout;