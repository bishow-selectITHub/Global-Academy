import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { RootState } from './index';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    duration: string;
    level: string;
    is_active: boolean;
    instructor: string;
    teacherEmail?: string;
    instructor_avatar?: string;
    category: string;
    objectives?: string[];
    lessons?: any[];
    created_at?: string;
    updated_at?: string;
    enrollments?: { count: number }[];
}

interface CourseState {
    data: Course[];
    currentCourse: Course | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    lastFetchedAt?: number;
    cacheExpiry: number; // Cache expires after 5 minutes
    byId: Record<string, Course>; // Indexed by ID for faster lookups
}

export const fetchCourses = createAsyncThunk<
    Course[],
    void,
    { state: RootState; rejectValue: string }
>(
    'courses/fetchCourses',
    async (_, { rejectWithValue, getState }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const state = getState();
        const { lastFetchedAt, cacheExpiry } = state.courses;

        // Check if cache is still valid (5 minutes)
        if (lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null; // Return null to indicate cache hit
        }

        const { data, error } = await supabase.from('courses').select('*,enrollments:course_enrollments(count)');
        if (error) return rejectWithValue(error.message);
        return (data || []) as Course[];
    },
    {
        condition: (_, { getState }) => {
            const state = getState();
            const { loaded, loading, lastFetchedAt, cacheExpiry } = state.courses;

            // Skip if currently loading
            if (loading) return false;

            // Skip if cache is still valid
            if (lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false;
            }

            return true;
        },
    }
);

export const fetchCourseById = createAsyncThunk(
    'courses/fetchCourseById',
    async (courseId: string, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('courses')
            .select('*,enrollments:course_enrollments(count)')
            .eq('id', courseId)
            .single();
        if (error) return rejectWithValue(error.message);
        return data;
    }
);

export const createCourse = createAsyncThunk(
    'courses/createCourse',
    async (courseData: Partial<Course>, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single();
        if (error) return rejectWithValue(error.message);
        return data as Course;
    }
);

export const updateCourse = createAsyncThunk(
    'courses/updateCourse',
    async ({ id, courseData }: { id: string; courseData: Partial<Course> }, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('courses')
            .update(courseData)
            .eq('id', id)
            .select()
            .single();
        if (error) return rejectWithValue(error.message);
        return data as Course;
    }
);

export const deleteCourse = createAsyncThunk(
    'courses/deleteCourse',
    async (courseId: string, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (error) return rejectWithValue(error.message);
        return courseId;
    }
);

const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        data: [] as Course[],
        currentCourse: null as Course | null,
        loading: false,
        error: null as string | null,
        loaded: false,
        cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
        byId: {},
    } as CourseState,
    reducers: {
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        invalidateCourses: (state) => {
            state.loaded = false;
            state.lastFetchedAt = undefined;
        },
        getCourseById: (state, action) => {
            const courseId = action.payload;
            state.currentCourse = state.byId[courseId] || null;
        },
        updateCourseOptimistically: (state, action) => {
            const updatedCourse = action.payload;
            const index = state.data.findIndex(course => course.id === updatedCourse.id);
            if (index !== -1) {
                state.data[index] = updatedCourse;
                state.byId[updatedCourse.id] = updatedCourse;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch courses
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false;

                // If action.payload is null, it's a cache hit
                if (action.payload === null) {
                    return; // Keep existing data
                }

                state.data = action.payload;
                state.loaded = true;
                state.lastFetchedAt = Date.now();

                // Build byId index for faster lookups
                state.byId = action.payload.reduce((acc, course) => {
                    acc[course.id] = course;
                    return acc;
                }, {} as Record<string, Course>);
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch course by ID
            .addCase(fetchCourseById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCourse = action.payload;
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create course
            .addCase(createCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update course
            .addCase(updateCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(course => course.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                if (state.currentCourse?.id === action.payload.id) {
                    state.currentCourse = action.payload;
                }
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete course
            .addCase(deleteCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(course => course.id !== action.payload);
                if (state.currentCourse?.id === action.payload) {
                    state.currentCourse = null;
                }
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase('ROOT_LOGOUT', (state) => {
                state.data = [];
                state.currentCourse = null;
                state.loading = false;
                state.error = null;
                state.loaded = false;
                state.lastFetchedAt = undefined;
            });
    },
});

export const {
    clearCurrentCourse,
    clearError,
    invalidateCourses,
    getCourseById,
    updateCourseOptimistically
} = coursesSlice.actions;
export default coursesSlice.reducer;
