import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

interface LiveSession {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    room_id?: string;
    instructor_id: string;
    instructor_name?: string;
    enrolled_students_count?: number;
    attendees_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface LiveSessionsState {
    data: LiveSession[];
    currentSession: LiveSession | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    lastFetchedAt?: number;
    cacheExpiry: number;
    byCourseId: Record<string, LiveSession[]>;
    byStatus: Record<string, LiveSession[]>;
}

export const fetchLiveSessions = createAsyncThunk<
    LiveSession[],
    void,
    { rejectValue: string }
>(
    'liveSessions/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const { data, error } = await supabase
            .from('live_sessions')
            .select('*, instructor:users(name)')
            .order('start_time', { ascending: false });

        if (error) return rejectWithValue(error.message);
        return (data || []) as LiveSession[];
    },
    {
        condition: (_, { getState }) => {
            const state = getState() as { liveSessions: LiveSessionsState };
            const { loaded, loading, lastFetchedAt, cacheExpiry } = state.liveSessions;

            if (loading) return false;

            // Skip if cache is still valid (2 minutes for live sessions)
            if (loaded && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false;
            }

            return true;
        },
    }
);

export const fetchLiveSessionsByCourse = createAsyncThunk<
    { courseId: string; sessions: LiveSession[] },
    string,
    { rejectValue: string }
>(
    'liveSessions/fetchByCourse',
    async (courseId: string, { rejectWithValue, getState }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const state = getState() as { liveSessions: LiveSessionsState };
        const { byCourseId, lastFetchedAt, cacheExpiry } = state.liveSessions;

        // Check if cache is still valid
        if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
            return null; // Cache hit
        }

        const { data, error } = await supabase
            .from('live_sessions')
            .select('*, instructor:users(name)')
            .eq('course_id', courseId)
            .order('start_time', { ascending: false });

        if (error) return rejectWithValue(error.message);
        return { courseId, sessions: (data || []) as LiveSession[] };
    },
    {
        condition: (courseId, { getState }) => {
            const state = getState() as { liveSessions: LiveSessionsState };
            const { byCourseId, lastFetchedAt, cacheExpiry } = state.liveSessions;

            // Skip if cache is still valid
            if (byCourseId[courseId] && lastFetchedAt && Date.now() - lastFetchedAt < cacheExpiry) {
                return false;
            }

            return true;
        },
    }
);

export const createLiveSession = createAsyncThunk(
    'liveSessions/create',
    async (sessionData: Partial<LiveSession>, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const { data, error } = await supabase
            .from('live_sessions')
            .insert([sessionData])
            .select()
            .single();

        if (error) return rejectWithValue(error.message);
        return data as LiveSession;
    }
);

export const updateLiveSession = createAsyncThunk(
    'liveSessions/update',
    async ({ id, sessionData }: { id: string; sessionData: Partial<LiveSession> }, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }

        const { data, error } = await supabase
            .from('live_sessions')
            .update(sessionData)
            .eq('id', id)
            .select()
            .single();

        if (error) return rejectWithValue(error.message);
        return data as LiveSession;
    }
);

const liveSessionsSlice = createSlice({
    name: 'liveSessions',
    initialState: {
        data: [],
        currentSession: null,
        loading: false,
        error: null,
        loaded: false,
        cacheExpiry: 2 * 60 * 1000, // 2 minutes for live sessions
        byCourseId: {},
        byStatus: {},
    } as LiveSessionsState,
    reducers: {
        setCurrentSession: (state, action) => {
            state.currentSession = action.payload;
        },
        clearCurrentSession: (state) => {
            state.currentSession = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        invalidateCache: (state) => {
            state.loaded = false;
            state.lastFetchedAt = undefined;
            state.byCourseId = {};
            state.byStatus = {};
        },
        updateSessionOptimistically: (state, action) => {
            const updatedSession = action.payload;
            const index = state.data.findIndex(session => session.id === updatedSession.id);
            if (index !== -1) {
                state.data[index] = updatedSession;
            }

            // Update byCourseId index
            Object.keys(state.byCourseId).forEach(courseId => {
                const courseIndex = state.byCourseId[courseId].findIndex(session => session.id === updatedSession.id);
                if (courseIndex !== -1) {
                    state.byCourseId[courseId][courseIndex] = updatedSession;
                }
            });
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all live sessions
            .addCase(fetchLiveSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLiveSessions.fulfilled, (state, action) => {
                state.loading = false;

                // If action.payload is null, it's a cache hit
                if (action.payload === null) {
                    return;
                }

                state.data = action.payload;
                state.loaded = true;
                state.lastFetchedAt = Date.now();

                // Build byCourseId index
                state.byCourseId = action.payload.reduce((acc, session) => {
                    if (!acc[session.course_id]) {
                        acc[session.course_id] = [];
                    }
                    acc[session.course_id].push(session);
                    return acc;
                }, {} as Record<string, LiveSession[]>);

                // Build byStatus index
                state.byStatus = action.payload.reduce((acc, session) => {
                    if (!acc[session.status]) {
                        acc[session.status] = [];
                    }
                    acc[session.status].push(session);
                    return acc;
                }, {} as Record<string, LiveSession[]>);
            })
            .addCase(fetchLiveSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch by course
            .addCase(fetchLiveSessionsByCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLiveSessionsByCourse.fulfilled, (state, action) => {
                state.loading = false;

                // If action.payload is null, it's a cache hit
                if (action.payload === null) {
                    return;
                }

                const { courseId, sessions } = action.payload;
                state.byCourseId[courseId] = sessions;
                state.lastFetchedAt = Date.now();
            })
            .addCase(fetchLiveSessionsByCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create session
            .addCase(createLiveSession.fulfilled, (state, action) => {
                const newSession = action.payload;
                state.data.unshift(newSession);

                // Update byCourseId index
                if (!state.byCourseId[newSession.course_id]) {
                    state.byCourseId[newSession.course_id] = [];
                }
                state.byCourseId[newSession.course_id].unshift(newSession);

                // Update byStatus index
                if (!state.byStatus[newSession.status]) {
                    state.byStatus[newSession.status] = [];
                }
                state.byStatus[newSession.status].unshift(newSession);
            })
            // Update session
            .addCase(updateLiveSession.fulfilled, (state, action) => {
                const updatedSession = action.payload;
                const index = state.data.findIndex(session => session.id === updatedSession.id);
                if (index !== -1) {
                    state.data[index] = updatedSession;
                }

                // Update byCourseId index
                Object.keys(state.byCourseId).forEach(courseId => {
                    const courseIndex = state.byCourseId[courseId].findIndex(session => session.id === updatedSession.id);
                    if (courseIndex !== -1) {
                        state.byCourseId[courseId][courseIndex] = updatedSession;
                    }
                });

                // Update byStatus index
                Object.keys(state.byStatus).forEach(status => {
                    const statusIndex = state.byStatus[status].findIndex(session => session.id === updatedSession.id);
                    if (statusIndex !== -1) {
                        state.byStatus[status][statusIndex] = updatedSession;
                    }
                });
            })
            .addCase('ROOT_LOGOUT', (state) => {
                state.data = [];
                state.currentSession = null;
                state.loading = false;
                state.error = null;
                state.loaded = false;
                state.lastFetchedAt = undefined;
                state.byCourseId = {};
                state.byStatus = {};
            });
    },
});

export const {
    setCurrentSession,
    clearCurrentSession,
    clearError,
    invalidateCache,
    updateSessionOptimistically
} = liveSessionsSlice.actions;

export default liveSessionsSlice.reducer;
