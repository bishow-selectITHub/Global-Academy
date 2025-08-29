"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useUser, type UserRole } from "../../contexts/UserContext"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAdmin, isLoading } = useUser()

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-900/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-blue-900/20 rounded-md mb-2"></div>
          <p className="text-sm text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // 🔹 If no user, kick to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 🔹 If role not allowed, redirect to that role's home
  if (!allowedRoles.includes(user.role)) {
    if (isAdmin) return <Navigate to="/admin" replace />
    if (user.role === "teacher") return <Navigate to="/teacher" replace />
    if (user.role === "learner") return <Navigate to="/dashboard" replace />
  }

  // ✅ Finally, if role is valid, render children
  return <>{children}</>
}

export default RoleGuard
