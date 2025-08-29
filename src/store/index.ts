// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./userSlice"
import coursesReducer from "./coursesSlice"
import enrollmentsReducer from "./enrollmentsSlice"
import usersReducer from "./usersSlice"
import quizzesReducer from "./quizzesSlice"
import notesReducer from "./notesSlice"
import liveSessionsReducer from "./liveSessionsSlice"

const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action)

    // Save courses and enrollments to localStorage when they're updated
    if (action.type?.startsWith("courses/") || action.type?.startsWith("enrollments/")) {
        const state = store.getState()
        try {
            localStorage.setItem(
                "cached_courses",
                JSON.stringify({
                    data: state.courses.data,
                    byId: state.courses.byId,
                    lastFetchedAt: state.courses.lastFetchedAt,
                    loaded: state.courses.loaded,
                }),
            )
            localStorage.setItem(
                "cached_enrollments",
                JSON.stringify({
                    data: state.enrollments.data,
                    byCourseId: state.enrollments.byCourseId,
                    lastFetchedAt: state.enrollments.lastFetchedAt,
                    loaded: state.enrollments.loaded,
                    loadedForUserId: state.enrollments.loadedForUserId,
                }),
            )
        } catch (error) {
            console.warn("Failed to save to localStorage:", error)
        }
    }

    // Clear localStorage on logout
    if (action.type === "ROOT_LOGOUT") {
        try {
            localStorage.removeItem("cached_courses")
            localStorage.removeItem("cached_enrollments")
        } catch (error) {
            console.warn("Failed to clear localStorage:", error)
        }
    }

    return result
}

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
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }).concat(localStorageMiddleware),
})

// Root logout action that clears all slices
export const rootLogout = () => {
    return {
        type: "ROOT_LOGOUT",
        payload: undefined,
    }
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
