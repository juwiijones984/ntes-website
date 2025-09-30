import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { api } from '../utils/api'
import { jwtDecode } from 'jwt-decode'

// Auth Context
interface AuthContextType {
  user: any
  profile: any
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, role: string, phone?: string, privilegePin?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext(null) as React.Context<AuthContextType | null>

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string, currentUser?: any, retryCount = 0) => {
    try {
      console.log('📥 Fetching profile for user:', userId)
      const data = await api.request('/auth/profile')
      console.log('✅ Profile fetched successfully:', data.profile)
      setProfile(data.profile)
      return data.profile
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error)
      
      // Don't sign out here to avoid auth loops - just clear the profile
      // The auth state will be handled by the caller
      console.log('🔄 Profile fetch failed, clearing profile state')
      setProfile(null)
      return null
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email)
      const data = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      console.log('✅ Login successful')
      localStorage.setItem('token', data.token)
      setUser(data.user)
      setProfile(data.profile)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      return { success: false, error: error.error || 'Login failed - please try again' }
    }
  }

  const signup = async (email: string, password: string, name: string, role: string, phone?: string, privilegePin?: string) => {
    try {
      const data = await api.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role, phone, privilegePin }),
      })

      // Now sign in the user
      const loginResult = await login(email, password)
      return loginResult
    } catch (error: any) {
      return { success: false, error: error.error || 'Signup failed' }
    }
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    let mounted = true

    // Set a maximum timeout for auth initialization to prevent infinite loading
    const authTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('⏱️ Auth initialization timed out, clearing loading state')
        setLoading(false)
        setUser(null)
        setProfile(null)
      }
    }, 15000) // 15 second timeout

    // Get initial session from localStorage
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...')
        const token = localStorage.getItem('token')

        if (token) {
          try {
            const decoded = jwtDecode(token) as any
            console.log('✅ Found existing token for:', decoded.email)
            setUser(decoded)
            const profile = await fetchProfile(decoded.userId, decoded)
            if (!profile) {
              console.warn('Profile fetch failed during initialization, clearing token')
              localStorage.removeItem('token')
              setUser(null)
              setProfile(null)
            }
          } catch (decodeError) {
            console.warn('⚠️ Invalid token, clearing')
            localStorage.removeItem('token')
            setUser(null)
            setProfile(null)
          }
        } else {
          console.log('ℹ️ No existing token found')
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
        clearTimeout(authTimeout)
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          clearTimeout(authTimeout)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(authTimeout)
    }
  }, [])

  const value = {
    user,
    profile,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
