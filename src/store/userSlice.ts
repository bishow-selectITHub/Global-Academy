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

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) return rejectWithValue(error.message);
            return true;
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null as any,
        loading: false,
        error: null as string | null,
    },
    reducers: {
        clearUser: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
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
            })
            .addCase(logoutUser.pending, (state) => {
                // Don't set loading to true for logout - keep it fast
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.data = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase('ROOT_LOGOUT', (state) => {
                state.data = null;
                state.loading = false;
                state.error = null;
            });
    },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
