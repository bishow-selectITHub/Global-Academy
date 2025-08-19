import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { RootState } from './index';

export interface NoteItem {
    id: string;
    course_id: string;
    name: string;
    file_url: string;
    created_at?: string;
}

interface NotesBucketState {
    data: NoteItem[];
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

export interface NotesState {
    byCourseId: Record<string, NotesBucketState>;
}

const initialBucket: NotesBucketState = {
    data: [],
    loading: false,
    loaded: false,
    error: null,
};

const getBucket = (state: NotesState, courseId: string): NotesBucketState => {
    if (!state.byCourseId[courseId]) {
        state.byCourseId[courseId] = { ...initialBucket };
    }
    return state.byCourseId[courseId];
};

export const fetchNotesByCourse = createAsyncThunk<
    { courseId: string; notes: NoteItem[] },
    string,
    { state: RootState; rejectValue: string }
>(
    'notes/fetchByCourse',
    async (courseId, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('notes')
            .select('id, course_id, name, file_url, created_at')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });
        if (error) return rejectWithValue(error.message);
        return { courseId, notes: (data || []) as NoteItem[] };
    },
    {
        condition: (courseId, { getState }) => {
            const state = getState() as RootState;
            const bucket = state.notes?.byCourseId?.[courseId];
            if (!bucket) return true;
            if (bucket.loading) return false;
            if (bucket.loaded) return false;
            return true;
        },
    }
);

const notesSlice = createSlice({
    name: 'notes',
    initialState: { byCourseId: {} } as NotesState,
    reducers: {
        invalidateNotesForCourse: (state, action) => {
            const courseId = action.payload as string;
            const bucket = state.byCourseId[courseId];
            if (bucket) {
                bucket.loaded = false;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotesByCourse.pending, (state, action) => {
                const courseId = action.meta.arg;
                const bucket = getBucket(state, courseId);
                bucket.loading = true;
                bucket.error = null;
            })
            .addCase(fetchNotesByCourse.fulfilled, (state, action) => {
                const { courseId, notes } = action.payload;
                const bucket = getBucket(state, courseId);
                bucket.loading = false;
                bucket.loaded = true;
                bucket.data = notes;
            })
            .addCase(fetchNotesByCourse.rejected, (state, action) => {
                const courseId = action.meta.arg;
                const bucket = getBucket(state, courseId);
                bucket.loading = false;
                bucket.error = (action.payload as string) || 'Failed to load notes';
            })
            .addCase('ROOT_LOGOUT', (state) => {
                state.byCourseId = {};
            });
    },
});

export const { invalidateNotesForCourse } = notesSlice.actions;
export default notesSlice.reducer;


