import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

export const fetchCurrentUser = createAsyncThunk(
    'user/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) return rejectWithValue(sessionError.message);
        if (!sessionData?.session) return null;
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) return rejectWithValue(userError.message);
        let role = 'learner';
        if (userData?.user?.user_metadata?.role) {
            role = userData.user.user_metadata.role;
        } else {
            // Fallback: fetch from user_roles table
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userData.user.id)
                .single();
            if (roleData?.role) role = roleData.role;
        }
        return {
            id: userData.user.id,
            email: userData.user.email,
            name: userData.user.user_metadata?.name || '',
            role,
        };
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null as any,
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
