"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useUser } from "../../contexts/UserContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading: userLoading, user } = useUser()

  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      if (user?.role === "superadmin") {
        navigate("/admin", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [userLoading, isAuthenticated, user, navigate])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await login(email, password)
      // Navigation will happen automatically via AuthLayout
    } catch (error) {
      console.error("Login error:", error)
      setErrors({
        email: "Invalid email or password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-600 text-lg">Sign in to continue your learning journey</p>
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#2369f4] hover:text-blue-700 transition-colors duration-200"
          >
            Create one here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
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
              disabled={isLoading || userLoading}
            />
          </div>

          <div>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              fullWidth
              className="h-12 text-base border-gray-200 focus:border-[#2369f4] focus:ring-[#2369f4] rounded-xl"
              autoComplete="current-password"
              disabled={isLoading || userLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#2369f4] border-gray-300 rounded focus:ring-[#2369f4] focus:ring-2 transition-all duration-200"
              disabled={isLoading || userLoading}
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#2369f4] hover:text-blue-700 transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading || userLoading}
          disabled={userLoading}
          className="h-12 text-base font-semibold bg-[#2369f4] hover:bg-blue-700 focus:ring-[#2369f4] rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          {userLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Try Demo Accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@globalselect.com")
              setPassword("password")
            }}
            className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading || userLoading}
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("learner@globalselect.com")
              setPassword("password")
            }}
            className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading || userLoading}
          >
            Learner Demo
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
