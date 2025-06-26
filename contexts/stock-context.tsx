"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Stock } from "@/types/stock"

// Types
interface StockState {
  watchlist: string[]
  stocks: Record<string, Stock>
  isLoading: boolean
  error: string | null
}

type StockAction =
  | { type: "ADD_TO_WATCHLIST"; payload: string }
  | { type: "REMOVE_FROM_WATCHLIST"; payload: string }
  | { type: "UPDATE_STOCK"; payload: Stock }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOAD_WATCHLIST"; payload: string[] }
  | { type: "CLEAR_ERROR" }

interface StockContextType extends StockState {
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  updateStock: (stock: Stock) => void
  isInWatchlist: (symbol: string) => boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Initial state
const initialState: StockState = {
  watchlist: [],
  stocks: {},
  isLoading: false,
  error: null,
}

// Reducer
function stockReducer(state: StockState, action: StockAction): StockState {
  switch (action.type) {
    case "ADD_TO_WATCHLIST":
      if (state.watchlist.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      }

    case "REMOVE_FROM_WATCHLIST":
      return {
        ...state,
        watchlist: state.watchlist.filter((symbol) => symbol !== action.payload),
      }

    case "UPDATE_STOCK":
      return {
        ...state,
        stocks: {
          ...state.stocks,
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
const StockContext = createContext<StockContextType | undefined>(undefined)

// Provider component
interface StockProviderProps {
  children: ReactNode
}

export function StockProvider({ children }: StockProviderProps) {
  const [state, dispatch] = useReducer(stockReducer, initialState)

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("stock-watchlist")
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
      localStorage.setItem("stock-watchlist", JSON.stringify(state.watchlist))
    } catch (error) {
      console.error("Failed to save watchlist to localStorage:", error)
    }
  }, [state.watchlist])

  // Action creators
  const addToWatchlist = (symbol: string) => {
    dispatch({ type: "ADD_TO_WATCHLIST", payload: symbol })
  }

  const removeFromWatchlist = (symbol: string) => {
    dispatch({ type: "REMOVE_FROM_WATCHLIST", payload: symbol })
  }

  const updateStock = (stock: Stock) => {
    dispatch({ type: "UPDATE_STOCK", payload: stock })
  }

  const isInWatchlist = (symbol: string) => {
    return state.watchlist.includes(symbol)
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

  const contextValue: StockContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    updateStock,
    isInWatchlist,
    setLoading,
    setError,
    clearError,
  }

  return <StockContext.Provider value={contextValue}>{children}</StockContext.Provider>
}

// Custom hook
export function useStock() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider")
  }
  return context
}
