"use client"

import { useState, useEffect, createContext, useContext, type ReactNode, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useToast } from "../components/ui/Toaster"
import { useDispatch } from "react-redux"
import { rootLogout } from "../store/index"
import { setUserInStore } from "../store/userSlice"

export type UserRole = "superadmin" | "learner" | "admin" | "manager" | "teacher"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    extras?: {
      registrationNo?: string
      companyName?: string
      domain?: string
      companyStamp?: string
      companyDoc?: string
      phone?: string
      location?: string
    },
  ) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

const CACHE_KEY = "issuelearner_user"
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { user, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return user
  } catch {
    return null
  }
}

const setCachedUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user, timestamp: Date.now() }))
    } else {
      localStorage.removeItem(CACHE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(getCachedUser())
  const [isLoading, setIsLoading] = useState(!getCachedUser()) // Don't show loading if we have cached user
  const navigate = useNavigate()
  const { addToast } = useToast()
  const dispatch = useDispatch()

  const updateUserFromSession = useCallback(
    async (sessionUser: any, skipCache = false) => {
      try {
        console.log("🔄 Updating user from session:", sessionUser.id)

        // Check cache first unless explicitly skipping
        if (!skipCache) {
          const cachedUser = getCachedUser()
          if (cachedUser && cachedUser.id === sessionUser.id) {
            console.log("✅ Using cached user data")
            setUser(cachedUser)
            dispatch(setUserInStore(cachedUser))
            setIsLoading(false)
            return
          }
        }

        let role: UserRole = "learner"

        // Try metadata first (fastest)
        if (sessionUser.user_metadata?.role) {
          role = sessionUser.user_metadata.role as UserRole
          console.log("✅ Role found in metadata:", role)
        } else {
          // Only query database if role not in metadata
          console.log("🔍 Fetching role from database...")
          try {
            const { data: roleData, error } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", sessionUser.id)
              .single()

            if (error) throw error

            if (roleData?.role) {
              role = roleData.role as UserRole
              console.log("✅ Role found in database:", role)
            }
          } catch (error) {
            console.log("⚠️ Error fetching role, using default 'learner':", error)
          }
        }

        const userObj: User = {
          id: sessionUser.id,
          email: sessionUser.email || "",
          role,
          avatar: sessionUser.user_metadata?.avatar || "",
          name: sessionUser.user_metadata?.name || "",
        }

        console.log("✅ Setting user object:", userObj)
        setUser(userObj)
        dispatch(setUserInStore(userObj))
        setCachedUser(userObj) // Cache for next time
        setIsLoading(false)
      } catch (error) {
        console.error("❌ Error in updateUserFromSession:", error)
        setIsLoading(false)
      }
    },
    [dispatch],
  )

  useEffect(() => {
    let mounted = true

    const init = async () => {
      console.log("🚀 Initializing UserContext...")

      const cachedUser = getCachedUser()
      if (cachedUser) {
        console.log("🔑 Found cached user, validating session...")
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()
          if (session?.user && session.user.id === cachedUser.id) {
            console.log("✅ Session valid, using cached user")
            setUser(cachedUser)
            dispatch(setUserInStore(cachedUser))
            setIsLoading(false)
            return
          } else {
            console.log("❌ Session invalid, clearing cache")
            setCachedUser(null)
            setUser(null)
            dispatch(setUserInStore(null))
          }
        } catch (err) {
          console.error("💥 Error validating session:", err)
          setCachedUser(null)
        }
      }

      // Full session check if no valid cache
      setIsLoading(true)
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("❌ Error fetching session:", error)
          if (mounted) setIsLoading(false)
          return
        }

        if (session?.user) {
          console.log("🔑 Found session, updating user...")
          await updateUserFromSession(session.user, true) // Skip cache check since we just validated
        } else {
          console.log("🚫 No session found")
          setUser(null)
          dispatch(setUserInStore(null))
          setCachedUser(null)
          if (mounted) setIsLoading(false)
        }
      } catch (err) {
        console.error("💥 Error getting session:", err)
        if (mounted) setIsLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in")
        await updateUserFromSession(session.user, true)
      } else if (event === "SIGNED_OUT") {
        console.log("🔄 User signed out, clearing context")
        setUser(null)
        dispatch(setUserInStore(null))
        setCachedUser(null)
        if (mounted) setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [dispatch, updateUserFromSession])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("🔐 Attempting login for:", email)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError || !signInData.session) {
          throw signInError || new Error("Login failed")
        }

        console.log("✅ Login successful")

        await updateUserFromSession(signInData.user, true)

        const userRole = signInData.user.user_metadata?.role
        if (userRole === "superadmin" || userRole === "admin" || userRole === "manager") {
          navigate("/admin")
        } else if (userRole === "teacher") {
          navigate("/teacher")
        } else {
          navigate("/dashboard")
        }
      } catch (error) {
        console.error("❌ Login error:", error)
        throw error
      }
    },
    [navigate, updateUserFromSession],
  )

  const logout = useCallback(async () => {
    try {
      setUser(null)
      dispatch(setUserInStore(null))
      dispatch(rootLogout())
      setCachedUser(null)

      navigate("/")

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        addToast({
          title: "Error signing out",
          message: error.message,
          type: "error",
        })
        return
      }

      addToast({
        title: "Signed out successfully",
        message: "You have been logged out",
        type: "success",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      addToast({
        title: "Logout error",
        message: "An error occurred during logout",
        type: "error",
      })
    }
  }, [addToast, navigate, dispatch])

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      extras?: {
        registrationNo?: string
        companyName?: string
        domain?: string
        companyStamp?: string
        companyDoc?: string
        phone?: string
        location?: string
      },
    ) => {
      setIsLoading(true)
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: "superadmin",
              registrationNo: extras?.registrationNo || "",
              companyName: extras?.companyName || "",
              domain: extras?.domain || "",
              companyStamp: extras?.companyStamp || "",
              companyDoc: extras?.companyDoc || "",
              phone: extras?.phone || "",
              location: extras?.location || "",
            },
          },
        })

        if (signUpError || !signUpData.user) {
          throw signUpError || new Error("Registration failed")
        }

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert([{ user_id: signUpData.user.id, role: "superadmin" }])

        if (roleError) {
          throw roleError
        }

        const { error: profileError } = await supabase.from("users").insert({
          id: signUpData.user.id,
          name: name,
          email: email,
          phone: extras?.phone || "",
          location: extras?.location || "",
          registrationNo: extras?.registrationNo || "",
          companyName: extras?.companyName || "",
          domain: extras?.domain || "",
          companyStamp: extras?.companyStamp || "",
          companyDoc: extras?.companyDoc || "",
        })

        if (profileError) {
          throw profileError
        }

        addToast({
          title: "Registration successful",
          message: "Please check your email to confirm your account, then log in.",
          type: "success",
        })

        navigate("/login")
      } catch (error) {
        console.error("Registration error:", error)
        addToast({
          title: "Registration error",
          message: "An error occurred.",
          type: "error",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [addToast, navigate],
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      isAdmin: user?.role === "superadmin" || user?.role === "admin" || user?.role === "manager",
    }),
    [user, isLoading, login, logout, register],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
