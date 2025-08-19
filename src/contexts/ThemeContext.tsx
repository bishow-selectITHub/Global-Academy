"use client"

import { createContext, useContext, type ReactNode } from "react"

interface ThemeContextType {
  theme: "light"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const value: ThemeContextType = {
    theme: "light"
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
