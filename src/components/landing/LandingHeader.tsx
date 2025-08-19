import { Link, useLocation } from "react-router-dom"
import Button from "../ui/Button"

export default function LandingHeader() {
    const location = useLocation()

    const navItems = [
        { name: "Features", path: "/features" },
        { name: "Pricing", path: "/pricing" },
        { name: "Testimonials", path: "/testimonials" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ]

    return (
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-4 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <span className="text-white font-bold text-2xl">GA</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">Global Academy</span>
                            <span className="text-xs text-blue-600 font-medium -mt-1">Learning Platform</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`relative text-sm font-semibold transition-all duration-300 hover:scale-105 ${location.pathname === item.path ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                                    }`}
                            >
                                {item.name}
                                {location.pathname === item.path && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50"
                        >
                            Sign In
                        </Link>
                        <Link to="/register">
                            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
