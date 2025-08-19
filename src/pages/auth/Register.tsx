"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { UserIcon, Mail, Lock, Building2, Globe, Phone, MapPin, Stamp, FileText, Eye, EyeOff } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useUser } from "../../contexts/UserContext"
import { supabase } from "../../lib/supabase"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registrationNo, setRegistrationNo] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [domain, setDomain] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [companyStampFile, setCompanyStampFile] = useState<File | null>(null)
  const [companyDocumentFile, setCompanyDocumentFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    registrationNo?: string
    companyName?: string
    domain?: string
    phone?: string
    location?: string
    companyStampFile?: string
    companyDocumentFile?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
      registrationNo?: string
      companyName?: string
      domain?: string
      phone?: string
      location?: string
      companyStampFile?: string
      companyDocumentFile?: string
    } = {}

    if (!name) {
      newErrors.name = "Name is required"
    }

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!registrationNo) {
      newErrors.registrationNo = "Registration number is required"
    }

    if (!companyName) {
      newErrors.companyName = "Company name is required"
    }

    if (!domain) {
      newErrors.domain = "Domain is required"
    } else if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(domain)) {
      newErrors.domain = "Enter a valid domain (e.g., example.com)"
    }

    if (!phone) {
      newErrors.phone = "Phone is required"
    }

    if (!location) {
      newErrors.location = "Location is required"
    }

    if (!companyDocumentFile) {
      newErrors.companyDocumentFile = "Company Document is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Upload company stamp if provided
      let companyStampUrl: string | undefined = undefined
      let companyDocumentUrl: string | undefined = undefined
      if (companyStampFile) {
        try {
          const filePath = `stamps/${Date.now()}_${companyStampFile.name}`
          const { error: uploadError } = await supabase.storage
            .from("company")
            .upload(filePath, companyStampFile, { upsert: true, contentType: companyStampFile.type })
          if (uploadError) {
            console.warn("Company stamp upload failed:", uploadError.message)
          } else {
            const { data } = supabase.storage.from("company").getPublicUrl(filePath)
            companyStampUrl = data.publicUrl
          }
        } catch (e) {
          console.warn("Company stamp upload exception:", e)
        }
      }

      if (companyDocumentFile) {
        try {
          const filePath = `docs/${Date.now()}_${companyDocumentFile.name}`
          const { error: uploadError } = await supabase.storage
            .from("company")
            .upload(filePath, companyDocumentFile, { upsert: true, contentType: companyDocumentFile.type })
          if (uploadError) {
            console.warn("Company document upload failed:", uploadError.message)
          } else {
            const { data } = supabase.storage.from("company").getPublicUrl(filePath)
            companyDocumentUrl = data.publicUrl
          }
        } catch (e) {
          console.warn("Company document upload exception:", e)
        }
      }

      await register(name, email, password, {
        registrationNo,
        companyName,
        domain,
        companyStamp: companyStampUrl,
        phone,
        location,
        companyDoc: companyDocumentUrl,
      })
      // Navigation will happen automatically via AuthLayout
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({
        email: "This email may already be in use",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Join Global Academy</h2>
        <p className="text-gray-600 text-lg">Start your learning journey today</p>
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#2369f4] hover:text-blue-700 transition-colors duration-200">
            Sign in here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#2369f4] rounded-xl flex items-center justify-center">
              <UserIcon size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Account Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                id="name"
                type="text"
                label="Full Name"
                leftIcon={<UserIcon size={20} className="text-gray-400" />}
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                fullWidth
                className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
                autoComplete="name"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                id="email"
                type="email"
                label="Email Address"
                leftIcon={<Mail size={20} className="text-gray-400" />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                fullWidth
                className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
                autoComplete="email"
              />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              leftIcon={<Lock size={20} className="text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              placeholder="Create "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText="At least 8 characters"
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="new-password"
            />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              leftIcon={<Lock size={20} className="text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              placeholder="Confirm  "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="registrationNo"
              type="text"
              label="Registration Number"
              placeholder=""
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              error={errors.registrationNo}
              fullWidth
              className="h-12 px-2 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="off"
            />
            <Input
              id="companyName"
              type="text"
              label="Company Name"
              leftIcon={<Building2 size={20} className="text-gray-400" />}
              placeholder="Enter company "
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={errors.companyName}
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="organization"
            />
            <Input
              id="domain"
              type="text"
              label="Company Domain"
              leftIcon={<Globe size={20} className="text-gray-400" />}
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              error={errors.domain}
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="off"
            />
            <Input
              id="phone"
              type="tel"
              label="Phone Number"
              leftIcon={<Phone size={20} className="text-gray-400" />}
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="tel"
            />
            <div className="md:col-span-2">
              <Input
                id="location"
                type="text"
                label="Company Location"
                leftIcon={<MapPin size={20} className="text-gray-400" />}
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
                fullWidth
                className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
                autoComplete="address-level2"
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Company Stamp (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      id="companyStamp"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCompanyStampFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#2369f4] file:text-white hover:file:bg-blue-700 border border-gray-200 rounded-xl p-3 focus:border-[#2369f4] focus:ring-2 focus:ring-[#2369f4] focus:ring-opacity-20 transition-all duration-200"
                    />
                    {errors.companyStampFile && <p className="mt-2 text-sm text-red-600">{errors.companyStampFile}</p>}
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200">
                    <Stamp size={20} className="text-gray-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG or WEBP format</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Document <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      id="companyDocument"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setCompanyDocumentFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 border border-gray-200 rounded-xl p-3 focus:border-[#2369f4] focus:ring-2 focus:ring-[#2369f4] focus:ring-opacity-20 transition-all duration-200"
                    />
                    {errors.companyDocumentFile && (
                      <p className="mt-2 text-sm text-red-600">{errors.companyDocumentFile}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200">
                    <FileText size={20} className="text-gray-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">PDF, PNG, JPG or WEBP format</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="h-12 text-base font-semibold bg-[#2369f4] hover:bg-blue-700 focus:ring-[#2369f4] rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-xs text-center text-gray-500 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="font-medium text-[#2369f4] hover:text-blue-700 transition-colors duration-200">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-[#2369f4] hover:text-blue-700 transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register
