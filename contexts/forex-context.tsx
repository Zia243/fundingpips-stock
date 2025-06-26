"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { ForexPair } from "@/types/forex"

// Types
interface ForexState {
  watchlist: Array<{ from: string; to: string }>
  pairs: Record<string, ForexPair>
  isLoading: boolean
  error: string | null
}

type ForexAction =
  | { type: "ADD_TO_WATCHLIST"; payload: { from: string; to: string } }
  | { type: "REMOVE_FROM_WATCHLIST"; payload: { from: string; to: string } }
  | { type: "UPDATE_PAIR"; payload: ForexPair }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOAD_WATCHLIST"; payload: Array<{ from: string; to: string }> }
  | { type: "CLEAR_ERROR" }

interface ForexContextType extends ForexState {
  addToWatchlist: (from: string, to: string) => void
  removeFromWatchlist: (from: string, to: string) => void
  updatePair: (pair: ForexPair) => void
  isInWatchlist: (from: string, to: string) => boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Initial state
const initialState: ForexState = {
  watchlist: [],
  pairs: {},
  isLoading: false,
  error: null,
}

// Reducer
function forexReducer(state: ForexState, action: ForexAction): ForexState {
  switch (action.type) {
    case "ADD_TO_WATCHLIST":
      if (state.watchlist.some((pair) => pair.from === action.payload.from && pair.to === action.payload.to)) {
        return state
      }
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      }

    case "REMOVE_FROM_WATCHLIST":
      return {
        ...state,
        watchlist: state.watchlist.filter(
          (pair) => !(pair.from === action.payload.from && pair.to === action.payload.to),
        ),
      }

    case "UPDATE_PAIR":
      return {
        ...state,
        pairs: {
          ...state.pairs,
          [action.payload.symbol]: action.payload,
        },
      }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case "LOAD_WATCHLIST":
      return {
        ...state,
        watchlist: action.payload,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// Context
const ForexContext = createContext<ForexContextType | undefined>(undefined)

// Provider component
interface ForexProviderProps {
  children: ReactNode
}

export function ForexProvider({ children }: ForexProviderProps) {
  const [state, dispatch] = useReducer(forexReducer, initialState)

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("forex-watchlist")
      if (savedWatchlist) {
        const watchlist = JSON.parse(savedWatchlist)
        dispatch({ type: "LOAD_WATCHLIST", payload: watchlist })
      }
    } catch (error) {
      console.error("Failed to load watchlist from localStorage:", error)
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("forex-watchlist", JSON.stringify(state.watchlist))
    } catch (error) {
      console.error("Failed to save watchlist to localStorage:", error)
    }
  }, [state.watchlist])

  // Action creators
  const addToWatchlist = (from: string, to: string) => {
    dispatch({ type: "ADD_TO_WATCHLIST", payload: { from, to } })
  }

  const removeFromWatchlist = (from: string, to: string) => {
    dispatch({ type: "REMOVE_FROM_WATCHLIST", payload: { from, to } })
  }

  const updatePair = (pair: ForexPair) => {
    dispatch({ type: "UPDATE_PAIR", payload: pair })
  }

  const isInWatchlist = (from: string, to: string) => {
    return state.watchlist.some((pair) => pair.from === from && pair.to === to)
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const contextValue: ForexContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    updatePair,
    isInWatchlist,
    setLoading,
    setError,
    clearError,
  }

  return <ForexContext.Provider value={contextValue}>{children}</ForexContext.Provider>
}

// Custom hook
export function useForex() {
  const context = useContext(ForexContext)
  if (context === undefined) {
    throw new Error("useForex must be used within a ForexProvider")
  }
  return context
}
