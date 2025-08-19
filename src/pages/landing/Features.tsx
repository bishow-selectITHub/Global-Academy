export default function Features() {
    const features = [
        {
            title: "Course Management",
            description:
                "Create, organize, and deliver comprehensive courses with multimedia content, structured lessons, and progress tracking.",
            icon: "https://cdn-icons-png.flaticon.com/512/3002/3002543.png",
            benefits: ["Multimedia lessons", "Progress tracking", "Structured curriculum", "Assessment tools"],
        },
        {
            title: "Live Interactive Sessions",
            description:
                "Host real-time classes with video conferencing, screen sharing, and collaborative tools for engaging learning experiences.",
            icon: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
            benefits: ["HD video conferencing", "Screen sharing", "Interactive whiteboard", "Recording capabilities"],
        },
        {
            title: "Quiz & Assessment System",
            description:
                "Build comprehensive quizzes and assessments with various question types, automatic grading, and detailed feedback.",
            icon: "https://cdn-icons-png.flaticon.com/512/3281/3281289.png",
            benefits: ["Multiple question types", "Auto-grading", "Instant feedback", "Performance analytics"],
        },
        {
            title: "Certificate Management",
            description:
                "Generate and manage digital certificates for course completion with customizable templates and verification.",
            icon: "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
            benefits: ["Custom templates", "Digital verification", "Automated generation", "Professional design"],
        },
        {
            title: "User Role Management",
            description:
                "Comprehensive role-based access control for administrators, teachers, and learners with appropriate permissions.",
            icon: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
            benefits: ["Role-based access", "Permission control", "User profiles", "Activity monitoring"],
        },
        {
            title: "Multi-Tenant Architecture",
            description: "Scalable platform supporting multiple organizations with isolated data and customizable branding.",
            icon: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
            benefits: ["Data isolation", "Custom branding", "Scalable infrastructure", "Organization management"],
        },
    ]

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-semibold mb-8 shadow-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                        Comprehensive Learning Platform
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        Powerful Features for <br />
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Modern Learning
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Everything you need to create, deliver, and manage exceptional online learning experiences. Our platform
                        combines cutting-edge technology with proven educational methods.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-blue-200"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src={feature.icon || "/placeholder.svg"}
                                    alt={feature.title}
                                    className="w-12 h-12 object-contain"
                                />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>

                            <ul className="space-y-3">
                                {feature.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-700">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3"></div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Detailed Feature Sections */}
                <div className="space-y-24">
                    {/* Live Sessions Detail */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-foreground mb-6">
                                Interactive <span className="text-primary">Live Sessions</span>
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Transform traditional learning with real-time interactive sessions that engage students like never
                                before.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">HD Video & Audio</h4>
                                        <p className="text-muted-foreground">Crystal clear communication with adaptive quality</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">Interactive Whiteboard</h4>
                                        <p className="text-muted-foreground">Collaborative drawing and annotation tools</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">Session Recording</h4>
                                        <p className="text-muted-foreground">Automatic recording for later review</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="/online-classroom-video-conference.png"
                                alt="Live Sessions"
                                className="rounded-2xl shadow-2xl"
                            />
                            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg">
                                Live Now: 150 Students
                            </div>
                        </div>
                    </div>

                    {/* Assessment Detail */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="lg:order-2">
                            <h2 className="text-4xl font-bold text-foreground mb-6">
                                Smart <span className="text-accent">Assessments</span>
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Create engaging quizzes and tests that adapt to student performance and provide instant, meaningful
                                feedback.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">15+</div>
                                    <div className="text-muted-foreground">Question Types</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">Auto</div>
                                    <div className="text-muted-foreground">Grading</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                                    <div className="text-muted-foreground">Feedback</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">Advanced</div>
                                    <div className="text-muted-foreground">Analytics</div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:order-1 relative">
                            <img src="/quiz-assessment-interface.png" alt="Smart Assessments" className="rounded-2xl shadow-2xl" />
                            <div className="absolute -bottom-4 -left-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-lg">
                                98% Accuracy Rate
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-32">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 rounded-3xl p-16 text-white shadow-2xl">
                        <h2 className="text-5xl font-bold mb-8">Ready to Transform Learning?</h2>
                        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Join thousands of educators and organizations who trust Global Academy to deliver exceptional learning
                            experiences.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <a
                                href="/pricing"
                                className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Start Free Trial
                            </a>
                            <a
                                href="/contact"
                                className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                            >
                                Schedule Demo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
