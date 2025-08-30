"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit, Trash2, MoreVertical, User, Mail, Shield, Loader2 } from "lucide-react"
import Button from "../../../components/ui/Button"
import Input from "../../../components/ui/Input"
import { useToast } from "../../../components/ui/Toaster"
import { supabase } from "../../../lib/supabase"
import { useUser } from "../../../contexts/UserContext"

// Types
interface UserData {
  id: string
  name: string
  email: string
  role: string

  joinDate: string
  status: "active" | "inactive" | "pending"
  lastLogin?: string
}

const UserManagement = () => {
  const { addToast } = useToast()
  const { user: currentUser } = useUser()
  const isSuperadmin = currentUser?.role === "superadmin"
  const isAdmin = currentUser?.role === "admin"
  const canDeleteUsers = isSuperadmin
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const existingManagerCount = useMemo(() => users.filter((u) => u.role === "Manager").length, [users])
  const managerSlotAvailable = existingManagerCount === 0
  const canAddManagers = (isSuperadmin || isAdmin) && managerSlotAvailable
  const canAddAdmins = isSuperadmin

  // Dynamic user data

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        // Fetch users from 'users' table
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, created_at")
        if (usersError) throw usersError

        // Fetch roles from 'user_roles' table
        const { data: rolesData, error: rolesError } = await supabase.from("user_roles").select("user_id, role")
        if (rolesError) throw rolesError

        // Optionally, fetch status and lastLogin from another table if available, else default

        // Merge users and roles
        const merged = usersData.map((user: any) => {
          const roleEntry = rolesData.find((r: any) => r.user_id === user.id)
          const r = (roleEntry?.role || "").toLowerCase()
          const prettyRole =
            r === "superadmin"
              ? "Superadmin"
              : r === "admin"
                ? "Admin"
                : r === "manager"
                  ? "Manager"
                  : r === "teacher"
                    ? "Teacher"
                    : "Learner"
          return {
            id: user.id,
            name: user.name,
            email: user.email,

            joinDate: user.created_at ? user.created_at.split("T")[0] : "",
            role: prettyRole,
            status: "active" as const,
            lastLogin: undefined,
          }
        })
        setUsers(merged)
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Error fetching users",
          message: error.message || "Failed to fetch users",
          duration: 4000,
        })
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [addToast])

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  // No department filtering in current schema

  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Admin",
  })

  // State for delete confirmation popup
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "All" || user.role === selectedRole
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesRole && matchesStatus
  })

  // Handler for deleting a user
  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user)
  }

  // Handler for confirming deletion
  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    if (!canDeleteUsers) {
      addToast({
        type: "error",
        title: "Permission denied",
        message: "Only superadmins can delete users.",
      })
      return
    }

    setDeleting(true)

    try {
      // Prevent deleting own account
      if (currentUser?.id && userToDelete.id === currentUser.id) {
        throw new Error("You cannot delete your own account.")
      }

      console.log("🗑️ [DEBUG] Deleting user:", userToDelete.id, userToDelete.email)

      // Get current user's session token
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("No active session")
      }

      // Call the Edge Function to delete user from auth system
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id_to_delete: userToDelete.id,
          current_user_token: session.access_token,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete user")
      }

      // Remove user from state
      setUsers(users.filter((u) => u.id !== userToDelete.id))

      addToast({
        type: "success",
        title: "User deleted",
        message: `User ${userToDelete.name} was deleted successfully from all systems.`,
        duration: 3000,
      })

      console.log("✅ [DEBUG] User deletion completed successfully")
    } catch (error: any) {
      console.error("❌ [DEBUG] User deletion failed:", error)
      addToast({
        type: "error",
        title: "Failed to delete user",
        message: error.message || "Something went wrong.",
        duration: 4000,
      })
    } finally {
      setDeleting(false)
      setUserToDelete(null)
    }
  }

  // Handler for canceling deletion
  const cancelDeleteUser = () => {
    setUserToDelete(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-slate-600 mt-2 text-sm">
                Manage user accounts and permissions across your organization
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-30"></div>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => {
                const defaultRole = isSuperadmin
                  ? "Admin"
                  : isAdmin
                    ? "Manager"
                    : currentUser?.role === "manager"
                      ? "Teacher"
                      : "Learner"
                setNewUser({ name: "", email: "", role: defaultRole as any })
                setShowAddUserModal(true)
              }}
              className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Add New User
            </Button>
          </div>
        </div>

        {/* Enhanced statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {users.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {users.filter((user) => user.status === "active").length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Administrators</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {users.filter((user) => user.role === "Admin").length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {users.filter((user) => user.status === "pending").length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                  <Loader2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced main content card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {loadingUsers && (
              <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="font-medium">Loading users…</span>
                </div>
              </div>
            )}

            {/* Enhanced search and filters */}
            <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="pl-12 pr-4 py-3 border border-slate-300/50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    className="border border-slate-300/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Learner">Learner</option>
                  </select>

                  <select
                    className="border border-slate-300/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200/30">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                        <div className="inline-flex items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="font-medium">Loading users…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${user.role.toLowerCase() === "superadmin"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : user.role.toLowerCase() === "admin"
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                  : user.role.toLowerCase() === "manager"
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                                    : user.role.toLowerCase() === "teacher"
                                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                      : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                              }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${user.status === "active"
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                : user.status === "inactive"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                              }`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                          {user.lastLogin || "Never logged in"}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200">
                              <Edit className="h-4 w-4" />
                            </button>
                            {canDeleteUsers && (
                              <button
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                onClick={() => handleDeleteUser(user)}
                                disabled={deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <User className="h-12 w-12 text-slate-300" />
                          <p className="font-medium">No users found matching your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Add New User
                </h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <Input
                  id="name"
                  label="Full Name"
                  leftIcon={<User size={18} />}
                  placeholder="Enter user's full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  fullWidth
                  className="bg-white/80 backdrop-blur-sm border-slate-300/50 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                />

                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  leftIcon={<Mail size={18} />}
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  fullWidth
                  className="bg-white/80 backdrop-blur-sm border-slate-300/50 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Shield size={18} className="text-slate-400" />
                    </div>
                    <select
                      className="pl-12 block w-full rounded-xl border-slate-300/50 bg-white/80 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 font-medium"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      {canAddAdmins && <option value="Admin">Admin</option>}
                      {(isSuperadmin || isAdmin) && (
                        <option value="Manager" disabled={!managerSlotAvailable}>
                          {managerSlotAvailable ? "Manager" : "Manager (already assigned)"}
                        </option>
                      )}
                      {(isSuperadmin || isAdmin || currentUser?.role === "manager") && (
                        <option value="Teacher">Teacher</option>
                      )}
                      {(isSuperadmin || isAdmin || currentUser?.role === "manager") && (
                        <option value="Learner">Learner</option>
                      )}
                    </select>
                    {(isSuperadmin || isAdmin) && !managerSlotAvailable && (
                      <p className="mt-2 text-xs text-slate-500 bg-amber-50 p-2 rounded-lg">
                        A Manager already exists. Only one Manager is allowed.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30"></div>
                  <Button
                    disabled={sendingInvite}
                    onClick={async () => {
                      try {
                        setSendingInvite(true)
                        if (!newUser.email || !newUser.name) return

                        // Determine role to send
                        // Role assignment rules
                        let sendRole = newUser.role.toLowerCase()
                        if (isAdmin) {
                          // Admin can only add managers, and only if no existing manager
                          if (!managerSlotAvailable) {
                            throw new Error("There can be only one Manager.")
                          }
                          sendRole = "manager"
                        } else if (currentUser?.role === "manager") {
                          // Manager can add teachers and learners only
                          const lower = sendRole
                          if (lower !== "teacher" && lower !== "learner") {
                            throw new Error("Managers can invite only Teachers or Learners.")
                          }
                        }
                        // Superadmin can add all roles; no override needed

                        // build params safely
                        const params = new URLSearchParams({
                          email: newUser.email,
                          name: newUser.name,
                          role: sendRole,
                        }).toString()

                        const redirectTo = `${window.location.origin}/accept-invite?${params}`

                        // Enforce role creation rules on client: only superadmin can add Admin; admin/superadmin can add Manager
                        const desiredRole = sendRole
                        if (desiredRole === "admin" && !canAddAdmins) {
                          throw new Error("Only superadmins can add Admins.")
                        }
                        if (desiredRole === "manager" && !canAddManagers) {
                          throw new Error(
                            managerSlotAvailable
                              ? "You do not have permission to add Managers."
                              : "There can be only one Manager.",
                          )
                        }

                        // send Supabase magic link with redirect
                        const { error } = await supabase.auth.signInWithOtp({
                          email: newUser.email,
                          options: {
                            emailRedirectTo: redirectTo,
                          },
                        })

                        if (error) throw error

                        addToast({
                          type: "success",
                          title: "Invitation sent",
                          message: `Invite sent to ${newUser.email}`,
                        })

                        setShowAddUserModal(false)
                        const defaultRole = isSuperadmin
                          ? "Admin"
                          : isAdmin
                            ? "Manager"
                            : currentUser?.role === "manager"
                              ? "Teacher"
                              : "Learner"
                        setNewUser({ name: "", email: "", role: defaultRole as any })
                      } catch (e: any) {
                        addToast({
                          type: "error",
                          title: "Failed to send invite",
                          message: e?.message || "Try again.",
                        })
                      } finally {
                        setSendingInvite(false)
                      }
                    }}
                    className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Confirm Delete</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to delete user{" "}
                <span className="font-semibold text-slate-900">{userToDelete.name}</span>? This action cannot be undone
                and will remove all associated data.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setUserToDelete(null)}
                  disabled={deleting}
                  className="px-6 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-30"></div>
                  <Button
                    variant="danger"
                    onClick={confirmDeleteUser}
                    isLoading={deleting}
                    disabled={deleting}
                    className="relative bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    {deleting ? "Deleting..." : "Delete User"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
