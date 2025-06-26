"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { SearchResult } from "@/types/stock"

// Types
interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  isOpen: boolean
  error: string | null
}

type SearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_RESULTS"; payload: SearchResult[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SEARCH" }

interface SearchContextType extends SearchState {
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setLoading: (loading: boolean) => void
  setOpen: (open: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void
}

// Initial state
const initialState: SearchState = {
  query: "",
  results: [],
  isLoading: false,
  isOpen: false,
  error: null,
}

// Reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      return {
        ...state,
        query: action.payload,
      }

    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        error: null,
      }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    case "SET_OPEN":
      return {
        ...state,
        isOpen: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case "CLEAR_SEARCH":
      return {
        ...state,
        query: "",
        results: [],
        isOpen: false,
        error: null,
      }

    default:
      return state
  }
}

// Context
const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Provider component
interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  // Action creators
  const setQuery = (query: string) => {
    dispatch({ type: "SET_QUERY", payload: query })
  }

  const setResults = (results: SearchResult[]) => {
    dispatch({ type: "SET_RESULTS", payload: results })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const setOpen = (open: boolean) => {
    dispatch({ type: "SET_OPEN", payload: open })
  }

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const clearSearch = () => {
    dispatch({ type: "CLEAR_SEARCH" })
  }

  const contextValue: SearchContextType = {
    ...state,
    setQuery,
    setResults,
    setLoading,
    setOpen,
    setError,
    clearSearch,
  }

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}

// Custom hook
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
