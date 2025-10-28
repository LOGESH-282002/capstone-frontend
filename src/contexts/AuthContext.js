'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import apiClient from '@/lib/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: null,
  loading: true,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      dispatch({ type: 'SET_LOADING', payload: true })
      return
    }

    if (session?.user) {
      // User is signed in with NextAuth (Google)
      // Fetch JWT token for API calls
      fetchSessionToken()
    } else {
      // Check for stored JWT token (only on client side)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        if (token && user) {
          dispatch({ type: 'SET_TOKEN', payload: token })
          dispatch({ type: 'SET_USER', payload: JSON.parse(user) })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [session, status])

  const fetchSessionToken = async () => {
    try {
      // For NextAuth users, get JWT token from Express backend
      if (session?.user) {
        const oauthData = await apiClient.oauthLogin({
          name: session.user.name,
          email: session.user.email
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', oauthData.token)
          localStorage.setItem('user', JSON.stringify(oauthData.user))
        }

        dispatch({ type: 'SET_TOKEN', payload: oauthData.token })
        dispatch({ type: 'SET_USER', payload: oauthData.user })
      }
    } catch (error) {
      console.error('Error fetching OAuth token:', error)
      // Fallback: create user object without token
      if (session?.user) {
        const tempUser = {
          id: session.user.email,
          name: session.user.name,
          email: session.user.email
        }
        dispatch({ type: 'SET_USER', payload: tempUser })
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const data = await apiClient.login({ email, password })

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      dispatch({ type: 'SET_TOKEN', payload: data.token })
      dispatch({ type: 'SET_USER', payload: data.user })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const data = await apiClient.register({ name, email, password })

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      dispatch({ type: 'SET_TOKEN', payload: data.token })
      dispatch({ type: 'SET_USER', payload: data.user })
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    if (session) {
      // Sign out from NextAuth
      await signOut({ redirect: false })
    }
    
    // Clear JWT token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const value = {
    ...state,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}