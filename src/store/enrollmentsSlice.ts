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
}

export const fetchEnrollments = createAsyncThunk<
    Enrollment[],
    string,
    { state: RootState; rejectValue: string }
>(
    'enrollments/fetchEnrollments',
    async (userId: string, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
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
            const { loaded, loadedForUserId, loading } = state.enrollments as EnrollmentsState;
            if (loading) return false;
            // Skip if we already loaded for this user
            if (loaded && loadedForUserId === userId) return false;
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
            });
    },
});

export const { invalidateEnrollmentsForUser, clearEnrollments } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
