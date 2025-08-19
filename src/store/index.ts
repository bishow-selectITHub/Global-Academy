// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import coursesReducer from './coursesSlice';
import enrollmentsReducer from './enrollmentsSlice';
import usersReducer from './usersSlice';
import quizzesReducer from './quizzesSlice';
import notesReducer from './notesSlice';
import liveSessionsReducer from './liveSessionsSlice';
// import other slices as needed

export const store = configureStore({
    reducer: {
        user: userReducer,
        courses: coursesReducer,
        enrollments: enrollmentsReducer,
        users: usersReducer,
        quizzes: quizzesReducer,
        notes: notesReducer,
        liveSessions: liveSessionsReducer,
        // ...other slices
    },
});

// Root logout action that clears all slices
export const rootLogout = () => {
    return {
        type: 'ROOT_LOGOUT',
        payload: undefined
    };
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;