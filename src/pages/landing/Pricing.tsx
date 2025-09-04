import Button from "../../components/ui/Button"
import { Link } from "react-router-dom"

export default function Pricing() {
    const plans = [
        {
            name: "Starter",
            price: "Free",
            period: "Forever",
            description: "Perfect for individual learners getting started",
            features: [
                "Access to 5 courses",
                "Basic progress tracking",
                "Community support",
                "Mobile app access",
                "Basic certificates",
                "1 live session per month",
            ],
            cta: "Start Free Trial",
            popular: false,
            ctaLink: "/register",
        },
        {
            name: "Professional",
            price: "$29",
            period: "per month",
            description: "Ideal for serious learners and small teams",
            features: [
                "Unlimited course access",
                "Unlimited live sessions",
                "Advanced analytics",
                "Priority support",
                "Custom certificates",
                "Offline content access",
                "1-on-1 mentoring sessions",
                "Quiz creation tools",
                "Progress reports",
            ],
            cta: "Start Free Trial",
            popular: true,
            ctaLink: "/register",
        },
        {
            name: "Enterprise",
            price: "$99",
            period: "per month",
            description: "Complete solution for organizations and institutions",
            features: [
                "Everything in Professional",
                "Multi-tenant architecture",
                "Custom course creation",
                "White-label solution",
                "Advanced user management",
                "API access",
                "Dedicated account manager",
                "Custom integrations",
                "Advanced reporting",
                "SSO integration",
                "Blockchain certificates",
            ],
            cta: "Start Free Trial",
            popular: false,
            ctaLink: "/register",
        },
    ]

    const faqs = [
        {
            question: "Can I change plans anytime?",
            answer:
                "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.",
        },
        {
            question: "Is there a free trial?",
            answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start your trial.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept all major credit cards, PayPal, and bank transfers for enterprise plans. All payments are processed securely.",
        },
        {
            question: "Do you offer refunds?",
            answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.",
        },
        {
            question: "How does multi-tenant work?",
            answer:
                "Enterprise plans include multi-tenant architecture allowing you to manage multiple organizations with isolated data and custom branding.",
        },
        {
            question: "What's included in support?",
            answer:
                "Starter gets community support, Professional gets priority email support, and Enterprise gets dedicated account management with phone support.",
        },
    ]

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-6 sm:py-6 lg:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                    <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                        💎 Transparent Pricing
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Simple, <span style={{ color: "#2369f4" }}>Fair Pricing</span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                        Choose the perfect plan for your learning journey. All plans include our core features with no hidden fees.
                        Start free and scale as you grow.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16 lg:mb-20">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-3xl border-2 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 shadow-lg ${plan.popular
                                ? "border-blue-500 shadow-2xl scale-105 bg-gradient-to-b from-white to-blue-50"
                                : "border-gray-200 hover:border-blue-300 hover:shadow-xl"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                                    <span
                                        style={{ backgroundColor: "#2369f4" }}
                                        className="text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg"
                                    >
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6 sm:mb-8">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>{plan.name}</h3>
                                <div className="mb-3 sm:mb-4">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">{plan.price}</span>
                                    {plan.period !== "Forever" && (
                                        <span className="text-gray-600 ml-2 text-sm sm:text-base">/{plan.period.split(" ")[1]}</span>
                                    )}
                                </div>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>{plan.description}</p>
                            </div>

                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: "#2369f4" }}></div>
                                        </div>
                                        <span className="text-gray-700 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to={plan.ctaLink} className="block">
                                <Button
                                    className={`w-full py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 
                                         "text-white shadow-lg hover:shadow-xl hover:scale-105"
                                       hover:shadow-lg"
                                        `}
                                    style={plan.popular ? { backgroundColor: "#2369f4" } : {}}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 mb-12 sm:mb-16 lg:mb-20 border border-gray-200 shadow-lg">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12" style={{fontFamily: 'Poppins, sans-serif'}}>Why Choose Global Academy?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <img src="https://cdn-icons-png.flaticon.com/512/2092/2092063.png" alt="Security" className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Enterprise Security</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Bank-level encryption and blockchain certificate verification</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3281/3281289.png"
                                    alt="Scalability"
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Infinite Scalability</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Multi-tenant architecture that grows with your organization</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <img src="https://cdn-icons-png.flaticon.com/512/1067/1067566.png" alt="Support" className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>24/7 Support</h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Round-the-clock assistance from our expert team</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>Frequently Asked Questions</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Everything you need to know about our pricing and plans</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base" style={{fontFamily: 'Poppins, sans-serif'}}>{faq.question}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center mt-12 sm:mt-16 lg:mt-20">
                    <div
                        className="rounded-3xl p-8 sm:p-12 shadow-2xl"
                        style={{ background: `linear-gradient(135deg, #2369f4 0%, #1e5ce8 100%)` }}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>Ready to Get Started?</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                            Join thousands of learners and educators who trust Global Academy for their online learning needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <Link to="/register">
                                <Button className="bg-white/0.5 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium shadow-lg hover:scale-105 transition-all w-full sm:w-auto">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium bg-transparent border-2 w-full sm:w-auto"
                                >
                                    Talk to Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
