import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../lib/supabase"
import type { RootState } from "./index"

interface Enrollment {
    id: string
    user_id: string
    course_id: string
    lessons?: any[] // full lesson array (optional)
    completed_lessons?: string[] // ✅ NEW: track completed lesson IDs
    progress?: number
    created_at?: string
    updated_at?: string
    course?: any
}

interface EnrollmentsState {
    data: Enrollment[]
    loading: boolean
    error: string | null
    loaded: boolean
    loadedForUserId: string | null
    lastFetchedAt?: number
    cacheExpiry: number // 3 minutes for enrollments
    byCourseId: Record<string, Enrollment[]> // Indexed by course ID
}

export const fetchEnrollments = createAsyncThunk<
    Enrollment[] | null,
    string,
    { state: RootState; rejectValue: string }
>(
    "enrollments/fetchEnrollments",
    async (userId: string, { rejectWithValue, getState }) => {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
            return rejectWithValue("You are offline")
        }

        const state = getState()
        const { loaded, loadedForUserId, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState

        // Cache check
        if (loaded && loadedForUserId === userId && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null
        }

        const { data, error } = await supabase
            .from("course_enrollments")
            .select("*, course:courses(*)")
            .eq("user_id", userId)

        if (error) return rejectWithValue(error.message)
        return (data || []) as Enrollment[]
    },
    {
        condition: (userId, { getState }) => {
            const state = getState()
            const { loaded, loadedForUserId, loading, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState
            if (loading) return false
            if (loaded && loadedForUserId === userId && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false
            }
            return true
        },
    },
)

// ✅ Update enrollment in Supabase
export const updateEnrollment = createAsyncThunk<
    Enrollment,
    { userId: string; courseId: string; lessons: any[]; progress: number },
    { rejectValue: string }
>("enrollments/updateEnrollment", async ({ userId, courseId, lessons, progress }, { rejectWithValue }) => {
    try {
        // Extract only completed lesson IDs
        const completedLessons = lessons.filter((l) => l.completed === true).map((l) => l.id)

        const { data, error } = await supabase
            .from("course_enrollments")
            .update({
                lessons, // store full lessons array if needed
                completed_lessons: completedLessons, // ✅ NEW: explicit list of completed lessons
                progress,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .select("*, course:courses(*)")
            .single()

        if (error) throw error
        return data as Enrollment
    } catch (err: any) {
        return rejectWithValue(err.message)
    }
})

export const fetchEnrollmentsByCourse = createAsyncThunk<
    { courseId: string; enrollments: Enrollment[] } | null,
    string,
    { state: RootState; rejectValue: string }
>(
    "enrollments/fetchByCourse",
    async (courseId: string, { rejectWithValue, getState }) => {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
            return rejectWithValue("You are offline")
        }

        const state = getState()
        const { byCourseId, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState

        if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null // Cache hit
        }

        const { data, error } = await supabase
            .from("course_enrollments")
            .select("*, user:users(id, name, email, avatar)")
            .eq("course_id", courseId)

        if (error) return rejectWithValue(error.message)
        return { courseId, enrollments: (data || []) as Enrollment[] }
    },
    {
        condition: (courseId, { getState }) => {
            const state = getState()
            const { byCourseId, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState
            if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false
            }
            return true
        },
    },
)

const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState: (() => {
        try {
            const cached = localStorage.getItem("cached_enrollments")
            if (cached) {
                const parsedCache = JSON.parse(cached)
                const now = Date.now()
                const cacheExpiry = 3 * 60 * 1000 // 3 minutes

                // Check if cache is still valid
                if (parsedCache.lastFetchedAt && now - parsedCache.lastFetchedAt < cacheExpiry) {
                    return {
                        data: parsedCache.data || [],
                        loading: false,
                        error: null,
                        loaded: parsedCache.loaded || false,
                        loadedForUserId: parsedCache.loadedForUserId || null,
                        lastFetchedAt: parsedCache.lastFetchedAt,
                        cacheExpiry,
                        byCourseId: parsedCache.byCourseId || {},
                    } as EnrollmentsState
                }
            }
        } catch (error) {
            console.warn("Failed to load enrollments from localStorage:", error)
        }

        // Default state if no valid cache
        return {
            data: [],
            loading: false,
            error: null as string | null,
            loaded: false,
            loadedForUserId: null,
            cacheExpiry: 3 * 60 * 1000,
            byCourseId: {},
        } as EnrollmentsState
    })(),
    reducers: {
        invalidateEnrollmentsForUser: (state, action) => {
            const userId = action.payload as string
            if (state.loadedForUserId === userId) {
                state.loaded = false
            }
        },
        clearEnrollments: (state) => {
            state.data = []
            state.loaded = false
            state.loadedForUserId = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch by user
            .addCase(fetchEnrollments.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload !== null) {
                    state.data = action.payload
                    state.loaded = true
                    state.loadedForUserId = action.meta.arg
                    state.lastFetchedAt = Date.now()
                    // Save to localStorage
                    localStorage.setItem(
                        "cached_enrollments",
                        JSON.stringify({
                            data: state.data,
                            loaded: state.loaded,
                            loadedForUserId: state.loadedForUserId,
                            lastFetchedAt: state.lastFetchedAt,
                            byCourseId: state.byCourseId,
                        }),
                    )
                }
            })
            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Fetch by course
            .addCase(fetchEnrollmentsByCourse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchEnrollmentsByCourse.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload !== null) {
                    const { courseId, enrollments } = action.payload
                    state.byCourseId[courseId] = enrollments
                    state.lastFetchedAt = Date.now()
                    // Save to localStorage
                    localStorage.setItem(
                        "cached_enrollments",
                        JSON.stringify({
                            data: state.data,
                            loaded: state.loaded,
                            loadedForUserId: state.loadedForUserId,
                            lastFetchedAt: state.lastFetchedAt,
                            byCourseId: state.byCourseId,
                        }),
                    )
                }
            })
            .addCase(fetchEnrollmentsByCourse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Update enrollment
            .addCase(updateEnrollment.pending, (state) => {
                state.loading = true
            })
            .addCase(updateEnrollment.fulfilled, (state, action) => {
                state.loading = false
                const updated = action.payload
                const idx = state.data.findIndex((e) => e.user_id === updated.user_id && e.course_id === updated.course_id)
                if (idx >= 0) {
                    state.data[idx] = updated
                } else {
                    state.data.push(updated)
                }
                // Save to localStorage
                localStorage.setItem(
                    "cached_enrollments",
                    JSON.stringify({
                        data: state.data,
                        loaded: state.loaded,
                        loadedForUserId: state.loadedForUserId,
                        lastFetchedAt: state.lastFetchedAt,
                        byCourseId: state.byCourseId,
                    }),
                )
            })
            .addCase(updateEnrollment.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Reset on logout
            .addCase("ROOT_LOGOUT", (state) => {
                state.data = []
                state.loading = false
                state.error = null
                state.loaded = false
                state.loadedForUserId = null
                state.lastFetchedAt = undefined
                state.byCourseId = {}
                // Clear localStorage
                localStorage.removeItem("cached_enrollments")
            })
    },
})

export const { invalidateEnrollmentsForUser, clearEnrollments } = enrollmentsSlice.actions
export default enrollmentsSlice.reducer
