export default function Testimonials() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Marketing Manager",
            company: "TechCorp Inc.",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            content:
                "Global Academy transformed our team's learning experience. The live sessions and interactive courses helped us upskill our entire marketing department efficiently.",
            rating: 5,
        },
        {
            name: "Dr. Michael Chen",
            role: "University Professor",
            company: "State University",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            content:
                "As an educator, I'm impressed by the comprehensive tools available. The quiz builder and analytics features have revolutionized how I assess student progress.",
            rating: 5,
        },
        {
            name: "Emily Rodriguez",
            role: "Learning & Development Lead",
            company: "Global Solutions",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            content:
                "The platform's user management and certificate system made it easy to scale our training programs across multiple departments and locations.",
            rating: 5,
        },
        {
            name: "James Wilson",
            role: "Freelance Designer",
            company: "Independent",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            content:
                "The mobile accessibility and offline content features allow me to learn on the go. I've completed 12 courses in just 6 months!",
            rating: 5,
        },
        {
            name: "Lisa Thompson",
            role: "HR Director",
            company: "Innovation Labs",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
            content:
                "Global Academy's enterprise features, especially the custom integrations and advanced reporting, perfectly fit our organizational needs.",
            rating: 5,
        },
        {
            name: "David Park",
            role: "Software Developer",
            company: "StartupXYZ",
            image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
            content:
                "The technical courses are top-notch, and the live coding sessions with instructors have accelerated my learning significantly.",
            rating: 5,
        },
    ]

    const stats = [
        { number: "50,000+", label: "Active Learners", icon: "👥" },
        { number: "1,200+", label: "Courses Available", icon: "📚" },
        { number: "98%", label: "Satisfaction Rate", icon: "⭐" },
        { number: "500+", label: "Organizations Trust Us", icon: "🏢" },
    ]

    return (
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-slate-50 py-6 sm:py-6 lg:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 sm:mb-20 lg:mb-24">
                    <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm">
                        <span className="text-base sm:text-lg mr-2">💬</span>
                        Trusted Worldwide
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
                        Loved by{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learners</span>
                        <br />
                        Worldwide
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        See what our community of learners, educators, and organizations have to say about their Global Academy
                        experience
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 lg:mb-24">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium text-xs sm:text-sm">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 lg:mb-24">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="group bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Rating */}
                            <div className="flex items-center mb-4 sm:mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg italic">"{testimonial.content}"</p>

                            {/* Author */}
                            <div className="flex items-center">
                                <img
                                    src={testimonial.image || "/placeholder.svg"}
                                    alt={testimonial.name}
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-3 sm:mr-4 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</div>
                                    <div className="text-xs sm:text-sm text-blue-600 font-medium">{testimonial.role}</div>
                                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.company}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">Join Our Success Stories</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                            Start your learning journey today and become part of our growing community of successful learners
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                            <a
                                href="/register"
                                className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
                            >
                                Start Learning Now
                            </a>
                            <a
                                href="/features"
                                className="border-2 border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
                            >
                                Explore Features
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
