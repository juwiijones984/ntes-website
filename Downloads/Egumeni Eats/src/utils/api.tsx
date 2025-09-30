import { jwtDecode } from 'jwt-decode'; // Add if not installed, but assume for token decode

// Development mode detection
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1'

// Track connection failures to automatically switch to fallback mode
let consecutiveFailures = 0
const MAX_FAILURES_BEFORE_FALLBACK = 3

// Get JWT from localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

// Get user from token (for role checks)
function getUserFromToken(token: string) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

// API utilities
export const api = {
  baseUrl: 'http://localhost:5000/api',
  useFallback: false,
  
  async request(endpoint: string, options: any = {}, retries: number = 2) {
    // Check if we should use fallback mode immediately
    if (this.useFallback || consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK) {
      console.log('🔄 Using fallback mode for API request:', endpoint)
      return this.handleFallbackRequest(endpoint, options)
    }

    const token = getAuthToken();
    const user = token ? getUserFromToken(token) : null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        };

        console.log(`Making API request (attempt ${attempt + 1}) to:`, `${this.baseUrl}${endpoint}`)

        // Add timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          let error
          try {
            error = JSON.parse(errorText)
          } catch {
            error = { error: errorText }
          }
          console.error('API request failed:', response.status, error)
          
          // If it's an auth error (401) or forbidden (403), clear token and fallback
          if (response.status === 401 || response.status === 403) {
            console.log('🔄 Auth error, clearing token and fallback for:', endpoint)
            localStorage.removeItem('token');
            return this.handleFallbackRequest(endpoint, options)
          }
          
          // If it's a network error and we have retries left, try again
          if (attempt < retries && (response.status >= 500 || response.status === 0)) {
            console.log(`Retrying in ${1000 * (attempt + 1)}ms...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          
          consecutiveFailures++
          throw new Error(error.error || `Request failed with status ${response.status}`)
        }
        
        // Reset failure count on successful request
        consecutiveFailures = 0
        return await response.json()
      } catch (error: any) {
        console.error(`Request attempt ${attempt + 1} failed:`, error)
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
          console.log('⏱️ Request timed out')
          if (attempt < retries) {
            console.log(`Retrying after timeout (attempt ${attempt + 1})...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          } else {
            throw new Error('Request timed out. Please try again.')
          }
        }
        
        if (attempt === retries) {
          consecutiveFailures++
          
          // If we've reached max failures or it's a connection error, try fallback
          if (consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK || 
              (error instanceof TypeError && error.message.includes('Failed to fetch'))) {
            console.log('🔄 Connection failed, switching to fallback mode for:', endpoint)
            this.useFallback = true
            return this.handleFallbackRequest(endpoint, options)
          }
          
          // This was the last attempt, throw a more descriptive error
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Connection failed. Please check your internet connection and try again.')
          }
          throw error
        }
        
        console.log(`Request failed (attempt ${attempt + 1}), retrying...`, error)
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  },

  async handleFallbackRequest(endpoint: string, options: any = {}) {
    console.log('⚠️ Network unavailable - unable to process request:', endpoint)
    
    // For critical endpoints, return minimal data to prevent app crashes
    switch (endpoint) {
      case '/auth/profile':
        return { profile: null } // Allow null profile instead of error
      
      case '/orders':
        return { orders: [] }
      
      case '/inventory':
        return { items: [] }
      
      case '/shift/current':
        return { shift: null }
      
      default:
        throw new Error(`Unable to connect to server for ${endpoint}. Please check your internet connection and try again.`)
    }
  },

  // Method to reset fallback mode (for retry buttons)
  resetFallbackMode() {
    console.log('🔄 Resetting fallback mode...')
    this.useFallback = false
    consecutiveFailures = 0
  },

  // Check if currently in fallback mode
  isInFallbackMode() {
    return this.useFallback || consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK
  }
}
