// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import coursesReducer from './coursesSlice';
import enrollmentsReducer from './enrollmentsSlice';
import usersReducer from './usersSlice';
import quizzesReducer from './quizzesSlice';
// import other slices as needed

export const store = configureStore({
    reducer: {
        user: userReducer,
        courses: coursesReducer,
        enrollments: enrollmentsReducer,
        users: usersReducer,
        quizzes: quizzesReducer,
        // ...other slices
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;