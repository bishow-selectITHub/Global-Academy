"use client"

import type React from "react"

import { useState } from "react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission here
        console.log("Form submitted:", formData)
        // You would typically send this to your backend
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-6 sm:py-6 lg:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 sm:mb-20 lg:mb-24">
                    <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm">
                        <span className="text-base sm:text-lg mr-2">💬</span>
                        Let's Connect
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Get in{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                        Have questions about Global Academy? We'd love to hear from you. Send us a message and we'll respond as soon
                        as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Contact Form */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-200/50 order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8" style={{fontFamily: 'Poppins, sans-serif'}}>Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                        Full Name *
                                    </label>
                                    <Input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#2369f4] focus:ring-0 transition-colors bg-white text-gray-900 text-sm sm:text-base"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                        Email Address *
                                    </label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#2369f4] focus:ring-0 transition-colors bg-white text-gray-900 text-sm sm:text-base"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                    Company/Organization
                                </label>
                                <Input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#2369f4] focus:ring-0 transition-colors bg-white text-gray-900 text-sm sm:text-base"
                                    placeholder="Your company name"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#2369f4] focus:ring-0 transition-colors bg-white text-gray-900 text-sm sm:text-base"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="sales">Sales & Pricing</option>
                                    <option value="support">Technical Support</option>
                                    <option value="partnership">Partnership Opportunities</option>
                                    <option value="feedback">Feedback & Suggestions</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#2369f4] focus:ring-0 transition-colors resize-none bg-white text-gray-900 text-sm sm:text-base"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{fontFamily: 'Poppins, sans-serif'}}>Contact Information</h2>

                            <div className="space-y-6 sm:space-y-8">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 sm:mr-6 mt-1">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Email</h3>
                                        <p className="text-blue-100 text-sm sm:text-lg" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>support@globalacademy.com</p>
                                        <p className="text-blue-100 text-sm sm:text-lg" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>sales@globalacademy.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 sm:mr-6 mt-1">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Phone</h3>
                                        <p className="text-blue-100 text-sm sm:text-lg" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>+1 (555) 123-4567</p>
                                        <p className="text-blue-100 text-xs sm:text-sm" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Mon-Fri, 9am-6pm EST</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 sm:mr-6 mt-1">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Office</h3>
                                        <p className="text-blue-100 text-sm sm:text-lg" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>123 Learning Street</p>
                                        <p className="text-blue-100 text-sm sm:text-lg" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Education City, EC 12345</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
                                <h3 className="font-bold text-lg sm:text-xl text-white mb-4 sm:mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>Follow Us</h3>
                                <div className="flex space-x-3 sm:space-x-4">
                                    <a
                                        href="#"
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                    >
                                        <span className="sr-only">Twitter</span>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                    >
                                        <span className="sr-only">LinkedIn</span>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl">💬</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base" style={{fontFamily: 'Poppins, sans-serif'}}>Live Chat</h3>
                                <p className="text-gray-600 text-xs sm:text-sm" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Available 24/7</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl">📞</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base" style={{fontFamily: 'Poppins, sans-serif'}}>Schedule Call</h3>
                                <p className="text-gray-600 text-xs sm:text-sm" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>Book a demo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
