import { useState, useEffect, useRef } from 'react';
import { Search, File, BookOpen, User, Award, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'document' | 'user' | 'certificate';
  description?: string;
  url: string;
  icon: JSX.Element;
}

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock data for search results
  const mockSearch = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    
    const allResults: SearchResult[] = [
      {
        id: 'course-1',
        title: 'Onboarding Essentials',
        type: 'course',
        description: 'Introduction to company policies and procedures',
        url: '/courses/1',
        icon: <BookOpen size={18} className="text-blue-600" />
      },
      {
        id: 'course-2',
        title: 'Data Security Fundamentals',
        type: 'course',
        description: 'Learn the basics of data security',
        url: '/courses/2',
        icon: <BookOpen size={18} className="text-blue-600" />
      },
      {
        id: 'lesson-1',
        title: 'Password Management',
        type: 'lesson',
        description: 'Best practices for secure passwords',
        url: '/courses/2/lessons/3',
        icon: <File size={18} className="text-green-600" />
      },
      {
        id: 'user-1',
        title: 'Alex Johnson',
        type: 'user',
        description: 'Marketing Department',
        url: '/admin/users',
        icon: <User size={18} className="text-purple-600" />
      },
      {
        id: 'certificate-1',
        title: 'Data Security Certificate',
        type: 'certificate',
        description: 'Awarded upon completion of Data Security course',
        url: '/certificates',
        icon: <Award size={18} className="text-amber-600" />
      },
      {
        id: 'document-1',
        title: 'Employee Handbook',
        type: 'document',
        description: 'Company policies and procedures document',
        url: '/documents',
        icon: <File size={18} className="text-red-600" />
      }
    ];
    
    // Filter results based on query
    return allResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (result.description && result.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  useEffect(() => {
    const handleSearch = () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setResults(mockSearch(query));
        setIsLoading(false);
        setSelectedIndex(0);
      }, 300);
    };

    const debounceTimeout = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setIsOpen(true);
        }
      } else {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault();
          navigate(results[selectedIndex].url);
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50">
      {/* Trigger button */}
      <button
        className="flex items-center text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm"
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} className="mr-2" />
        <span className="mr-2">Quick search</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-slate-50 px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50">
          <div className="container mx-auto p-4 h-full flex items-start pt-[20vh]">
            <div 
              ref={searchRef}
              className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full mx-auto"
            >
              {/* Search header */}
              <div className="flex items-center border-b border-slate-200 px-4 py-3">
                <Search size={20} className="text-slate-400 mr-2" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for courses, lessons, documents..."
                  className="flex-1 border-0 focus:ring-0 focus:outline-none text-slate-900"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-pulse space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-100 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <Link
                        key={result.id}
                        to={result.url}
                        className={`block px-4 py-3 hover:bg-slate-50 ${
                          selectedIndex === index ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            {result.icon}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{result.title}</div>
                            {result.description && (
                              <div className="text-sm text-slate-500">{result.description}</div>
                            )}
                            <div className="text-xs text-slate-400 mt-0.5">
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-slate-500">Start typing to search...</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="p-3 bg-slate-50 rounded-md">
                        <p className="font-medium text-slate-700 mb-1">Try searching for:</p>
                        <ul className="text-slate-500 text-left list-disc pl-5">
                          <li>Courses</li>
                          <li>Lessons</li>
                          <li>Documents</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-md">
                        <p className="font-medium text-slate-700 mb-1">Keyboard shortcuts:</p>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Navigate</span>
                          <kbd className="px-2 py-0.5 bg-white border rounded text-xs">↑↓</kbd>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Select</span>
                          <kbd className="px-2 py-0.5 bg-white border rounded text-xs">Enter</kbd>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Close</span>
                          <kbd className="px-2 py-0.5 bg-white border rounded text-xs">Esc</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;