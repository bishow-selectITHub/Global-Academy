import { Link } from "react-router-dom"

export default function LandingFooter() {
    return (
        <footer className="bg-gray-800 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
                {/* Stars */}
                <div className="absolute top-8 left-4 sm:left-16 text-yellow-400 text-xl sm:text-2xl">★</div>
                <div className="absolute top-20 right-8 sm:right-32 text-yellow-300 text-base sm:text-lg">✦</div>
                <div className="absolute bottom-16 left-8 sm:left-1/4 text-blue-300 text-lg sm:text-xl">★</div>
                <div className="absolute top-12 left-8 sm:left-1/3 text-cyan-300 text-sm">✧</div>
                <div className="absolute bottom-24 right-4 sm:right-16 text-yellow-400 text-lg sm:text-xl">★</div>
                <div className="absolute top-32 right-8 sm:right-1/4 text-blue-400 text-base sm:text-lg">✦</div>

                {/* Geometric shapes */}
                <div className="absolute top-16 right-4 sm:right-12 w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-400 rotate-45"></div>
                <div className="absolute bottom-20 left-4 sm:left-8 w-4 h-4 sm:w-6 sm:h-6 bg-cyan-400 rounded-full"></div>
                <div className="absolute top-24 left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 transform rotate-45"></div>
                <div className="absolute bottom-32 right-8 sm:right-1/3 w-8 h-8 sm:w-10 sm:h-10 border-2 border-yellow-300 rounded-full"></div>
                <div className="absolute top-40 left-4 sm:left-20 w-2 h-8 sm:w-3 sm:h-12 bg-blue-300 transform rotate-12"></div>
                <div className="absolute bottom-12 right-4 sm:right-20 w-4 h-4 sm:w-6 sm:h-6 border-2 border-cyan-300 transform rotate-45"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="col-span-1 sm:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">GA</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-white">Global Academy</span>
                        </div>
                        <p className="text-gray-300 max-w-md text-sm sm:text-base">
                            Empowering learners worldwide with comprehensive online courses, live sessions, and interactive learning
                            experiences.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-base sm:text-lg">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/features" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-base sm:text-lg">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/login" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="mailto:support@globalacademy.com"
                                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base"
                                >
                                    Help Center
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
                    <p className="text-gray-400 text-sm sm:text-base">&copy; 2024 Global Academy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
