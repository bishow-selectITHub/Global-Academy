import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"

export default function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-6 sm:py-6 lg:py-6 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="text-center lg:text-left animate-fade-in-up">
                            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#2369f4]/10 text-[#2369f4] rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                                🎓 Transform Your Learning Journey Today
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-gray-900" style={{fontFamily: 'Poppins, sans-serif'}}>
                                Your All-in-One Platform for <span className="text-[#2369f4]">Online Learning</span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                                Global Academy integrates courses, live sessions, and interactive learning into one seamless experience,
                                making education accessible and engaging for everyone. Join our multi-tenant platform designed for
                                learners, educators, and institutions worldwide.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                                <Link to="/pricing">
                                    <Button className="bg-[#2369f4] hover:bg-[#1e5bd1] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium shadow-lg transition-colors w-full sm:w-auto">
                                        Get Started Now →
                                    </Button>
                                </Link>
                                <Link to="/features">
                                    <Button className="border-2 border-[#2369f4] text-[#2369f4] hover:bg-[#2369f4] hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors w-full sm:w-auto">
                                        Explore Features
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 justify-center lg:justify-start">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-[#2369f4]">10K+</span>
                                    <span>Active Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-[#2369f4]">500+</span>
                                    <span>Expert Instructors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-[#2369f4]">95%</span>
                                    <span>Success Rate</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-float order-first lg:order-last">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                                alt="Global Academy Platform Dashboard"
                                className="rounded-2xl shadow-2xl w-full"
                            />
                            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-green-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg animate-pulse text-xs sm:text-sm">
                                🔴 Live Session Active
                            </div>
                            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-[#2369f4] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
                                🏆 Certificate Earned!
                            </div>
                            <div className="absolute top-1/2 -left-3 sm:-left-6 bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow-lg text-xs">
                                📊 Quiz in Progress
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-[#2369f4] rounded-full blur-xl"></div>
                    <div className="absolute top-32 right-20 w-16 h-16 bg-indigo-400 rounded-full blur-lg"></div>
                    <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-400 rounded-full blur-xl"></div>
                    <div className="absolute bottom-32 right-10 w-12 h-12 bg-[#2369f4] rounded-full blur-lg"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        <div className="academy-info order-2 lg:order-1">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 text-center lg:text-left" style={{fontFamily: 'Poppins, sans-serif'}}>
                                About Global Academy
                                <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#2369f4] to-cyan-500 mt-4 rounded-full mx-auto lg:mx-0"></div>
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed text-center lg:text-left">
                                Founded with the vision of democratizing quality education, Global Academy has emerged as a leading
                                platform that bridges the gap between traditional learning and modern technology. We believe that
                                knowledge has the power to transform lives and communities.
                            </p>
                            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
                                Our multi-tenant architecture supports educational institutions, corporate training programs, and
                                individual learners, providing a scalable solution that grows with your needs. From interactive live
                                sessions to comprehensive assessments, we've built every feature with learner success in mind.
                            </p>

                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#2369f4] mb-2">2019</div>
                                    <div className="text-gray-600 text-sm sm:text-base">Founded</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#2369f4] mb-2">50+</div>
                                    <div className="text-gray-600 text-sm sm:text-base">Countries</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#2369f4] mb-2">24/7</div>
                                    <div className="text-gray-600 text-sm sm:text-base">Support</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#2369f4] mb-2">99.9%</div>
                                    <div className="text-gray-600 text-sm sm:text-base">Uptime</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#2369f4] to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm sm:text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-6 sm:left-8 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-[#2369f4] to-transparent"></div>
                                <blockquote className="text-base sm:text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-blue-200">
                                    "Education is the most powerful weapon which you can use to change the world."
                                </blockquote>
                                <cite className="text-[#2369f4] font-semibold text-sm sm:text-base">— Nelson Mandela</cite>
                            </div>

                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm sm:text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-6 sm:left-8 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                <blockquote className="text-base sm:text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-indigo-200">
                                    "The beautiful thing about learning is that no one can take it away from you."
                                </blockquote>
                                <cite className="text-indigo-600 font-semibold text-sm sm:text-base">— B.B. King</cite>
                            </div>

                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-[#2369f4] rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm sm:text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-6 sm:left-8 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                                <blockquote className="text-base sm:text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-cyan-200">
                                    "An investment in knowledge pays the best interest."
                                </blockquote>
                                <cite className="text-cyan-600 font-semibold text-sm sm:text-base">— Benjamin Franklin</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
                            Everything You Need to <span className="text-[#2369f4]">Excel</span>
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                            Our comprehensive platform combines cutting-edge technology with proven educational methods to deliver an
                            unmatched learning experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <img src="https://cdn-icons-png.flaticon.com/512/3002/3002543.png" alt="Courses" className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>Interactive Courses</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                                Structured learning paths with multimedia content, assignments, and progress tracking.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                                    alt="Live Sessions"
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>Live Sessions</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                                Real-time interactive classes with HD video, screen sharing, and collaborative tools.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <img src="https://cdn-icons-png.flaticon.com/512/3281/3281289.png" alt="Quizzes" className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>Smart Assessments</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                                Adaptive quizzes and tests that adjust to your learning pace and provide instant feedback.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png"
                                    alt="Certificates"
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>Verified Certificates</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                                Industry-recognized certificates with blockchain verification and LinkedIn integration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-16 lg:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>Trusted by Learners Worldwide</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Join thousands of successful students and educators</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2369f4] mb-2">10,000+</div>
                            <div className="text-gray-600 text-sm sm:text-base">Active Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2369f4] mb-2">500+</div>
                            <div className="text-gray-600 text-sm sm:text-base">Expert Instructors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2369f4] mb-2">1,200+</div>
                            <div className="text-gray-600 text-sm sm:text-base">Courses Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2369f4] mb-2">95%</div>
                            <div className="text-gray-600 text-sm sm:text-base">Completion Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#2369f4] to-indigo-600 py-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>Ready to Transform Your Future?</h2>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                        Join thousands of successful learners who have advanced their careers with Global Academy. Start your
                        journey today with our free trial.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link to="/register">
                            <Button className=" hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium shadow-lg transition-colors w-full sm:w-auto">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link to="/pricing">
                            <Button className="border-2 border-white text-white hover:bg-white hover:text-[#2369f4] px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium bg-transparent transition-colors w-full sm:w-auto">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
