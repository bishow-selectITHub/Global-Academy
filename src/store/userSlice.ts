import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

export interface UserState {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

interface SliceState {
    data: UserState | null;
    loading: boolean;
    error: string | null;
}

const initialState: SliceState = {
    data: null,
    loading: false,
    error: null,
};

// 🔹 Optional: still keep fetchCurrentUser for fallback/manual calls
export const fetchCurrentUser = createAsyncThunk(
    'user/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                return rejectWithValue('You are offline');
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) return rejectWithValue(sessionError.message);
            if (!session?.user) return null;

            const user = session.user;
            let role = 'learner';

            if (user.user_metadata?.role) {
                role = user.user_metadata.role;
            } else {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();
                if (roleData?.role) role = roleData.role;
            }

            return {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || '',
                role,
                avatar: user.user_metadata?.avatar || '',
            } as UserState;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Error fetching current user');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) return rejectWithValue(error.message);
            return true;
        } catch {
            return rejectWithValue('Logout failed');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 🔹 Let UserContext push user updates into Redux
        setUserInStore: (state, action: PayloadAction<UserState | null>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
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

export const { setUserInStore, clearUser } = userSlice.actions;
export default userSlice.reducer;
