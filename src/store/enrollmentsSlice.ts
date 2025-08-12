import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

export const fetchEnrollments = createAsyncThunk(
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
        return data;
    }
);

const enrollmentsSlice = createSlice({
    name: 'enrollments',
    initialState: {
        data: [],
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default enrollmentsSlice.reducer;
