import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

interface Quiz {
    id: string;
    title: string;
    description: string;
    course_id: string;
    courseName?: string;
    timeLimit?: number;
    passingScore: number;
    questions: any[];
    isPublished: boolean;
    created_at?: string;
    updated_at?: string;
}

interface QuizState {
    data: Quiz[];
    currentQuiz: Quiz | null;
    loading: boolean;
    error: string | null;
}

export const fetchQuizzes = createAsyncThunk(
    'quizzes/fetchQuizzes',
    async (_, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase.from('quizes').select('*');
        if (error) return rejectWithValue(error.message);
        return data;
    }
);

export const fetchQuizByCourseId = createAsyncThunk(
    'quizzes/fetchQuizByCourseId',
    async (courseId: string, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('quizes')
            .select('*')
            .eq('course_id', courseId)
            .maybeSingle();
        if (error) return rejectWithValue(error.message);
        return data;
    }
);

export const createQuiz = createAsyncThunk(
    'quizzes/createQuiz',
    async (quizData: Partial<Quiz>, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('quizes')
            .insert([quizData])
            .select()
            .single();
        if (error) return rejectWithValue(error.message);
        return data as Quiz;
    }
);

export const updateQuiz = createAsyncThunk(
    'quizzes/updateQuiz',
    async ({ id, quizData }: { id: string; quizData: Partial<Quiz> }, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { data, error } = await supabase
            .from('quizes')
            .update(quizData)
            .eq('id', id)
            .select()
            .single();
        if (error) return rejectWithValue(error.message);
        return data as Quiz;
    }
);

export const deleteQuiz = createAsyncThunk(
    'quizzes/deleteQuiz',
    async (quizId: string, { rejectWithValue }) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return rejectWithValue('You are offline');
        }
        const { error } = await supabase
            .from('quizes')
            .delete()
            .eq('id', quizId);
        if (error) return rejectWithValue(error.message);
        return quizId;
    }
);

const quizzesSlice = createSlice({
    name: 'quizzes',
    initialState: {
        data: [] as Quiz[],
        currentQuiz: null as Quiz | null,
        loading: false,
        error: null as string | null,
    } as QuizState,
    reducers: {
        clearCurrentQuiz: (state) => {
            state.currentQuiz = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch quizzes
            .addCase(fetchQuizzes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchQuizzes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch quiz by course ID
            .addCase(fetchQuizByCourseId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuizByCourseId.fulfilled, (state, action) => {
                state.loading = false;
                state.currentQuiz = action.payload;
            })
            .addCase(fetchQuizByCourseId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create quiz
            .addCase(createQuiz.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createQuiz.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
                state.currentQuiz = action.payload;
            })
            .addCase(createQuiz.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update quiz
            .addCase(updateQuiz.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateQuiz.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(quiz => quiz.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                if (state.currentQuiz?.id === action.payload.id) {
                    state.currentQuiz = action.payload;
                }
            })
            .addCase(updateQuiz.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete quiz
            .addCase(deleteQuiz.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteQuiz.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(quiz => quiz.id !== action.payload);
                if (state.currentQuiz?.id === action.payload) {
                    state.currentQuiz = null;
                }
            })
            .addCase(deleteQuiz.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentQuiz, clearError } = quizzesSlice.actions;
export default quizzesSlice.reducer;
