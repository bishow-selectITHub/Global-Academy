"use client"

import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Search, Plus, Filter, MoreVertical, Edit, Trash, Users, Clock, DollarSign, Play } from "lucide-react"
import { useUser } from "../../../contexts/UserContext"
import { useToast } from "../../../components/ui/Toaster"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import { fetchCourses, fetchCourseById } from "../../../store/coursesSlice"
import { supabase } from "../../../lib/supabase"
import HostLiveSession from "../live/HostLiveSession"

const CourseManagement = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { data: courses, loading, error, currentCourse } = useSelector((state: RootState) => state.courses)
  const { user } = useUser()
  const { addToast } = useToast()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const [courseDetails, setCourseDetails] = useState<any | null>(null)
  const [showLiveModal, setShowLiveModal] = useState(false)
  const [selectedCourseForLive, setSelectedCourseForLive] = useState<any | null>(null)
  const [liveForm, setLiveForm] = useState({
    roomName: "",
    startDate: "",
    maxParticipants: "",
    description: "",
  })
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const handleLiveFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLiveForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleScheduleLive = (e: React.FormEvent) => {
    e.preventDefault()
    setShowLiveModal(false)
    setLiveForm({ roomName: "", startDate: "", maxParticipants: "", description: "" })
    setSelectedCourseForLive(null)
    if (typeof addToast === "function") {
      addToast({
        type: "success",
        title: "Live class scheduled",
        message: "Your live class has been scheduled.",
        duration: 5000,
      })
    }
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id))
      setCourseDetails(currentCourse)
    } else {
      dispatch(fetchCourses())
      setCourseDetails(null)
    }
  }, [dispatch, id, currentCourse])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && course.is_active) ||
      (selectedStatus === "Draft" && !course.is_active)
    return matchesSearch && matchesStatus
  })

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }
    setDeletingCourseId(courseId);
    try {
      const { data: course, error: fetchError } = await supabase.from("courses").select("*").eq("id", courseId).single()
      if (fetchError) throw fetchError

      if (!course) {
        if (typeof addToast === "function") {
          addToast({
            type: "error",
            title: "Course not found",
            message: "Could not retrieve course details for deletion.",
            duration: 5000,
          })
        }
        setDeletingCourseId(null);
        return
      }

      const tryDeleteFromFolders = async (folders: string[], filename: string) => {
        for (const folder of folders) {
          try {
            const { error: removeError } = await supabase.storage
              .from("course-assets")
              .remove([`${folder}/${filename}`])
            if (removeError && removeError.message !== "The resource was not found") {
              console.warn(`Warning: Could not delete ${filename} from ${folder}:`, removeError)
            } else if (!removeError) {
              console.log(`Successfully deleted ${filename} from ${folder}`)
            }
          } catch (e) {
            console.warn(`Error trying to delete ${filename} from ${folder}:`, e)
          }
        }
      }

      if (course.thumbnail) {
        const thumbnailFile = course.thumbnail.split("/").pop()
        if (thumbnailFile) {
          await tryDeleteFromFolders(["thumbnails", "thumbnail"], thumbnailFile)
        }
      }
      if (course.instructor_avatar) {
        const avatarFile = course.instructor_avatar.split("/").pop()
        if (avatarFile) {
          await tryDeleteFromFolders(["avatars", "instructor_avatar"], avatarFile)
        }
      }
      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson.type === "video" && lesson.videoUrl) {
            const videoFile = lesson.videoUrl.split("/").pop()
            if (videoFile) {
              await tryDeleteFromFolders(["lessons"], videoFile)
            }
          }
        }
      }

      // Delete all enrollments for this course
      const { error: enrollmentsDeleteError } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("course_id", courseId);
      if (enrollmentsDeleteError) throw enrollmentsDeleteError;

      // Delete the course from the database
      const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId);
      if (deleteError) throw deleteError;

      if (typeof addToast === "function") {
        addToast({
          type: "success",
          title: "Course deleted successfully",
          duration: 5000,
        })
      }

      dispatch(fetchCourses())
    } catch (error: any) {
      console.error("Error deleting course:", error)
      if (typeof addToast === "function") {
        addToast({
          type: "error",
          title: "Error deleting course",
          message: error.message || "Please try again later.",
          duration: 5000,
        })
      }
    } finally {
      setDeletingCourseId(null);
    }
  }

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".card-menu")) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClick)
    }
    return () => document.removeEventListener("mousedown", handleClick)
  }, [openMenuId])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )

  // Single course view (keeping existing logic but with smaller fonts)
  if (id && courseDetails) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <button
          className="mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
          onClick={() => navigate("/admin/courses")}
        >
          ← Back to Courses
        </button>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-shrink-0 w-full md:w-72">
            <img
              src={courseDetails.thumbnail || "/placeholder.svg"}
              alt={courseDetails.title}
              className="rounded w-full h-48 object-cover mb-3"
            />
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-block px-2 py-1 text-xs rounded ${courseDetails.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-800"}`}
              >
                {courseDetails.is_active ? "Active" : "Draft"}
              </span>
              <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                {courseDetails.level?.charAt(0).toUpperCase() + courseDetails.level?.slice(1)}
              </span>
            </div>
            <div className="mb-1 text-sm text-gray-500">{courseDetails.category}</div>
            <div className="mb-1 text-sm text-gray-700">
              <span className="font-medium">Duration:</span> {courseDetails.duration}
            </div>
            <div className="mb-1 text-sm text-gray-700">
              <span className="font-medium">Price:</span> {courseDetails.price ? `$${courseDetails.price}` : "Free"}
            </div>
            <div className="mb-1 text-sm text-gray-700">
              <span className="font-medium">Enrolled:</span> {courseDetails.enrollments?.[0]?.count || 0}
            </div>
            <div className="mb-1 text-sm text-gray-700">
              <span className="font-medium">Created:</span>{" "}
              {courseDetails.created_at ? new Date(courseDetails.created_at).toLocaleDateString() : ""}
            </div>
            <div className="mb-1 text-sm text-gray-700">
              <span className="font-medium">Updated:</span>{" "}
              {courseDetails.updated_at ? new Date(courseDetails.updated_at).toLocaleDateString() : ""}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{courseDetails.title}</h2>
            <p className="mb-4 text-gray-700 text-sm leading-relaxed">{courseDetails.description}</p>
            {courseDetails.instructor && (
              <div className="flex items-center gap-3 mb-4">
                {courseDetails.instructor_avatar && (
                  <img
                    src={courseDetails.instructor_avatar || "/placeholder.svg"}
                    alt="Instructor"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-800 text-sm">{courseDetails.instructor}</div>
                  <div className="text-xs text-gray-500">{courseDetails.instructor_title}</div>
                </div>
              </div>
            )}
            {Array.isArray(courseDetails.objectives) && courseDetails.objectives.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">Objectives</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {courseDetails.objectives.map((obj: string, idx: number) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(courseDetails.lessons) && courseDetails.lessons.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">Lessons</h3>
                <ul className="divide-y divide-gray-200">
                  {courseDetails.lessons.map((lesson: any, idx: number) => (
                    <li key={lesson.id || idx} className="py-2 flex items-center gap-2">
                      <span className="font-medium text-gray-700 text-sm">{lesson.title}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{lesson.type}</span>
                      {lesson.duration && <span className="text-xs text-gray-500 ml-2">{lesson.duration}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (showLiveModal && selectedCourseForLive) {
    return (
      <HostLiveSession
        course={selectedCourseForLive}
        onBack={() => {
          setShowLiveModal(false)
          setSelectedCourseForLive(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and organize your courses</p>
          </div>
          <Link
            to="/admin/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm inline-flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"
              >
                {/* Course Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Play className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-xs">No thumbnail</p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        course.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {course.is_active ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Menu Button */}
                  <div className="absolute top-2 right-2 card-menu">
                    <button
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white focus:outline-none"
                      onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                      aria-label="More options"
                      type="button"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                    {openMenuId === course.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg py-1 z-10 card-menu">
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            handleDeleteCourse(course.id)
                          }}
                          className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          disabled={deletingCourseId === course.id}
                        >
                          {deletingCourseId === course.id ? (
                            <span className="flex items-center gap-1"><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></span> Deleting...</span>
                          ) : (
                            <><Trash className="h-3 w-3 mr-2" /> Delete</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-4">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {course.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">{course.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {course.description || "No description available"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course.enrollments?.[0]?.count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{course.price ? `$${course.price}` : "Free"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/courses/${course.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Link>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      onClick={() => {
                        setSelectedCourseForLive(course)
                        setShowLiveModal(true)
                      }}
                      type="button"
                    >
                      <Play className="w-3 h-3" />
                      Live
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No courses found</h3>
                <p className="text-gray-500 text-xs mb-4">
                  {searchQuery || selectedStatus !== "All"
                    ? "Try adjusting your search or filter."
                    : "Get started by creating your first course."}
                </p>
                {!searchQuery && selectedStatus === "All" && (
                  <Link
                    to="/admin/courses/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm inline-flex items-center gap-2 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Course
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseManagement
