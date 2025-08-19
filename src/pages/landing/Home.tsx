import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"

export default function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-24 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left animate-fade-in-up">
                            <div className="inline-flex items-center px-4 py-2 bg-[#2369f4]/10 text-[#2369f4] rounded-full text-sm font-medium mb-8">
                                🎓 Transform Your Learning Journey Today
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
                                Your All-in-One Platform for <span className="text-[#2369f4]">Online Learning</span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                                Global Academy integrates courses, live sessions, and interactive learning into one seamless experience,
                                making education accessible and engaging for everyone. Join our multi-tenant platform designed for
                                learners, educators, and institutions worldwide.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link to="/pricing">
                                    <Button className="bg-[#2369f4] hover:bg-[#1e5bd1] text-white px-8 py-4 rounded-lg font-medium shadow-lg transition-colors">
                                        Get Started Now →
                                    </Button>
                                </Link>
                                <Link to="/features">
                                    <Button className="bg-white border-2 border-[#2369f4] text-[#2369f4] hover:bg-[#2369f4] hover:text-white px-8 py-4 rounded-lg font-medium transition-colors">
                                        Explore Features
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#2369f4]">10K+</span>
                                    <span>Active Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#2369f4]">500+</span>
                                    <span>Expert Instructors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#2369f4]">95%</span>
                                    <span>Success Rate</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-float">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                                alt="Global Academy Platform Dashboard"
                                className="rounded-2xl shadow-2xl w-full"
                            />
                            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                                🔴 Live Session Active
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-[#2369f4] text-white px-4 py-2 rounded-lg shadow-lg">
                                🏆 Certificate Earned!
                            </div>
                            <div className="absolute top-1/2 -left-6 bg-yellow-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm">
                                📊 Quiz in Progress
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-[#2369f4] rounded-full blur-xl"></div>
                    <div className="absolute top-32 right-20 w-16 h-16 bg-indigo-400 rounded-full blur-lg"></div>
                    <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-400 rounded-full blur-xl"></div>
                    <div className="absolute bottom-32 right-10 w-12 h-12 bg-[#2369f4] rounded-full blur-lg"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="academy-info">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                                About Global Academy
                                <div className="w-24 h-1 bg-gradient-to-r from-[#2369f4] to-cyan-500 mt-4 rounded-full"></div>
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Founded with the vision of democratizing quality education, Global Academy has emerged as a leading
                                platform that bridges the gap between traditional learning and modern technology. We believe that
                                knowledge has the power to transform lives and communities.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Our multi-tenant architecture supports educational institutions, corporate training programs, and
                                individual learners, providing a scalable solution that grows with your needs. From interactive live
                                sessions to comprehensive assessments, we've built every feature with learner success in mind.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-[#2369f4] mb-2">2019</div>
                                    <div className="text-gray-600">Founded</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-[#2369f4] mb-2">50+</div>
                                    <div className="text-gray-600">Countries</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-[#2369f4] mb-2">24/7</div>
                                    <div className="text-gray-600">Support</div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-[#2369f4] mb-2">99.9%</div>
                                    <div className="text-gray-600">Uptime</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-[#2369f4] to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-8 w-16 h-0.5 bg-gradient-to-r from-[#2369f4] to-transparent"></div>
                                <blockquote className="text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-blue-200">
                                    "Education is the most powerful weapon which you can use to change the world."
                                </blockquote>
                                <cite className="text-[#2369f4] font-semibold">— Nelson Mandela</cite>
                            </div>

                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-8 w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                <blockquote className="text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-indigo-200">
                                    "The beautiful thing about learning is that no one can take it away from you."
                                </blockquote>
                                <cite className="text-indigo-600 font-semibold">— B.B. King</cite>
                            </div>

                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-[#2369f4] rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">"</span>
                                </div>
                                <div className="absolute top-0 left-8 w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                                <blockquote className="text-lg italic text-gray-700 mb-4 relative z-10 pl-4 border-l-4 border-cyan-200">
                                    "An investment in knowledge pays the best interest."
                                </blockquote>
                                <cite className="text-cyan-600 font-semibold">— Benjamin Franklin</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Everything You Need to <span className="text-[#2369f4]">Excel</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our comprehensive platform combines cutting-edge technology with proven educational methods to deliver an
                            unmatched learning experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-6">
                                <img src="https://cdn-icons-png.flaticon.com/512/3002/3002543.png" alt="Courses" className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Courses</h3>
                            <p className="text-gray-600">
                                Structured learning paths with multimedia content, assignments, and progress tracking.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-6">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                                    alt="Live Sessions"
                                    className="w-8 h-8"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Live Sessions</h3>
                            <p className="text-gray-600">
                                Real-time interactive classes with HD video, screen sharing, and collaborative tools.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-6">
                                <img src="https://cdn-icons-png.flaticon.com/512/3281/3281289.png" alt="Quizzes" className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Assessments</h3>
                            <p className="text-gray-600">
                                Adaptive quizzes and tests that adjust to your learning pace and provide instant feedback.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-[#2369f4]/10 rounded-xl flex items-center justify-center mb-6">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png"
                                    alt="Certificates"
                                    className="w-8 h-8"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Certificates</h3>
                            <p className="text-gray-600">
                                Industry-recognized certificates with blockchain verification and LinkedIn integration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Learners Worldwide</h2>
                        <p className="text-gray-600">Join thousands of successful students and educators</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2369f4] mb-2">10,000+</div>
                            <div className="text-gray-600">Active Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2369f4] mb-2">500+</div>
                            <div className="text-gray-600">Expert Instructors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2369f4] mb-2">1,200+</div>
                            <div className="text-gray-600">Courses Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2369f4] mb-2">95%</div>
                            <div className="text-gray-600">Completion Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#2369f4] to-indigo-600 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Future?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful learners who have advanced their careers with Global Academy. Start your
                        journey today with our free trial.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button className="bg-white text-[#2369f4] hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-medium shadow-lg transition-colors">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link to="/pricing">
                            <Button className="border-2 border-white text-white hover:bg-white hover:text-[#2369f4] px-8 py-4 rounded-lg text-lg font-medium bg-transparent transition-colors">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
