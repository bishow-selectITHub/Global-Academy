import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { RootState } from './index';

interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    lessons?: any[];
    created_at?: string;
    updated_at?: string;
    course?: any;
}

interface EnrollmentsState {
    data: Enrollment[];
    loading: boolean;
    error: string | null;
    loaded: boolean;
    loadedForUserId: string | null;
    lastFetchedAt?: number;
    cacheExpiry: number; // 3 minutes for enrollments
    byCourseId: Record<string, Enrollment[]>; // Indexed by course ID
}

export const fetchEnrollments = createAsyncThunk<
    Enrollment[],
    string,
    { state: RootState; rejectValue: string }
>(
    'enrollments/fetchEnrollments',
    async (userId: string, { rejectWithValue, getState }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const state = getState();
        const { loaded, loadedForUserId, loading, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState;

        // Check if cache is still valid (3 minutes)
        if (loaded && loadedForUserId === userId && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null; // Cache hit
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .select('*, course:courses(*)') // join the courses table
            .eq('user_id', userId);
        if (error) return rejectWithValue(error.message);
        return (data || []) as Enrollment[];
    },
    {
        condition: (userId, { getState }) => {
            const state = getState();
            const { loaded, loadedForUserId, loading, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState;

            if (loading) return false;

            // Skip if cache is still valid
            if (loaded && loadedForUserId === userId && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false;
            }

            return true;
        },
    }
);

// New action for fetching enrollments by course ID (for course dashboards)
export const fetchEnrollmentsByCourse = createAsyncThunk<
    { courseId: string; enrollments: Enrollment[] },
    string,
    { state: RootState; rejectValue: string }
>(
    'enrollments/fetchByCourse',
    async (courseId: string, { rejectWithValue, getState }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const state = getState();
        const { byCourseId, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState;

        // Check if cache is still valid
        if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null; // Cache hit
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .select('*, user:users(id, name, email, avatar)')
            .eq('course_id', courseId);
        if (error) return rejectWithValue(error.message);
        return { courseId, enrollments: (data || []) as Enrollment[] };
    },
    {
        condition: (courseId, { getState }) => {
            const state = getState();
            const { byCourseId, lastFetchedAt, cacheExpiry } = state.enrollments as EnrollmentsState;

            // Skip if cache is still valid
            if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false;
            }

            return true;
        },
    }
);

const enrollmentsSlice = createSlice({
    name: 'enrollments',
    initialState: {
        data: [],
        loading: false,
        error: null as string | null,
        loaded: false,
        loadedForUserId: null,
        cacheExpiry: 3 * 60 * 1000, // 3 minutes in milliseconds
        byCourseId: {},
    } as EnrollmentsState,
    reducers: {
        invalidateEnrollmentsForUser: (state, action) => {
            const userId = action.payload as string;
            if (state.loadedForUserId === userId) {
                state.loaded = false;
            }
        },
        clearEnrollments: (state) => {
            state.data = [];
            state.loaded = false;
            state.loadedForUserId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.loaded = true;
                state.loadedForUserId = action.meta.arg;
                state.lastFetchedAt = Date.now();
            })
            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch enrollments by course
            .addCase(fetchEnrollmentsByCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnrollmentsByCourse.fulfilled, (state, action) => {
                state.loading = false;

                // If action.payload is null, it's a cache hit
                if (action.payload === null) {
                    return;
                }

                const { courseId, enrollments } = action.payload;
                state.byCourseId[courseId] = enrollments;
                state.lastFetchedAt = Date.now();
            })
            .addCase(fetchEnrollmentsByCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase('ROOT_LOGOUT', (state) => {
                state.data = [];
                state.loading = false;
                state.error = null;
                state.loaded = false;
                state.loadedForUserId = null;
                state.lastFetchedAt = undefined;
                state.byCourseId = {};
            });
    },
});

export const {
    invalidateEnrollmentsForUser,
    clearEnrollments
} = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
