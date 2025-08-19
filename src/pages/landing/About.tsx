export default function About() {
    const team = [
        {
            name: "Alex Thompson",
            role: "CEO & Founder",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            bio: "Former education technology executive with 15+ years of experience in online learning platforms.",
        },
        {
            name: "Dr. Maria Garcia",
            role: "Chief Learning Officer",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
            bio: "PhD in Educational Psychology with expertise in curriculum design and learning analytics.",
        },
        {
            name: "Ryan Kim",
            role: "CTO",
            image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
            bio: "Software architect specializing in scalable learning management systems and real-time collaboration tools.",
        },

    ]

    const values = [
        {
            title: "Accessibility",
            description: "Making quality education accessible to learners everywhere, regardless of location or background.",
            icon: "https://cdn-icons-png.flaticon.com/512/3281/3281289.png",
        },
        {
            title: "Innovation",
            description: "Continuously evolving our platform with cutting-edge technology and pedagogical best practices.",
            icon: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
        },
        {
            title: "Community",
            description: "Building a supportive learning community where educators and learners can thrive together.",
            icon: "https://cdn-icons-png.flaticon.com/512/1067/1067566.png",
        },
        {
            title: "Excellence",
            description:
                "Maintaining the highest standards in educational content, platform reliability, and user experience.",
            icon: "https://cdn-icons-png.flaticon.com/512/2092/2092063.png",
        },
    ]

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">About Global Academy</h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                        We're on a mission to democratize education and make high-quality learning experiences accessible to
                        everyone, everywhere.
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-20">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center lg:text-left">Our Story</h2>
                        <div className="space-y-3 sm:space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base text-center lg:text-left">
                            <p>
                                Founded in 2020, Global Academy emerged from a simple yet powerful vision: to create a learning platform
                                that combines the best of traditional education with modern technology.
                            </p>
                            <p>
                                Our founders, experienced educators and technologists, recognized the need for a comprehensive platform
                                that could deliver engaging, interactive learning experiences at scale. They set out to build something
                                that would serve individual learners, educational institutions, and organizations alike.
                            </p>
                            <p>
                                Today, Global Academy serves over 50,000 active learners across 80+ countries, offering everything from
                                individual courses to enterprise-wide training programs. We're proud to be at the forefront of the
                                online learning revolution.
                            </p>
                        </div>
                    </div>
                    <div className="lg:pl-8 order-1 lg:order-2">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                            alt="Global Academy team collaboration"
                            className="rounded-xl shadow-lg w-full"
                        />
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-16 sm:mb-20">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-base sm:text-lg text-gray-600">The principles that guide everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <img src={value.icon || "/placeholder.svg"} alt={value.title} className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-sm sm:text-base">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-16 sm:mb-20">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-base sm:text-lg text-gray-600">The passionate people behind Global Academy</p>
                    </div>

                    <div className="flex ">
                        {team.map((member, index) => (
                            <div key={index} className="text-center ">
                                <img
                                    src={member.image || "/placeholder.svg"}
                                    alt={member.name}
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                                />
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                                <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: "#2369f4" }}>
                                    {member.role}
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-blue-50 rounded-2xl p-8 sm:p-12 text-center border border-blue-100">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Mission</h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                        To empower individuals and organizations worldwide with accessible, engaging, and effective learning
                        experiences that drive personal growth, professional development, and positive change in communities.
                    </p>
                    <div className="mt-6 sm:mt-8">
                        <a
                            href="/contact"
                            className="text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors hover:scale-105 transform duration-200 shadow-lg inline-block"
                            style={{ backgroundColor: "#2369f4" }}
                        >
                            Get in Touch
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
