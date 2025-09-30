import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import CustomerDashboard from './components/CustomerDashboard'
import AdminDashboard from './components/AdminDashboard'
import KitchenDashboard from './components/KitchenDashboard'
import DeliveryDashboard from './components/DeliveryDashboard'
import CashierDashboard from './components/CashierDashboard'
import StoresDashboard from './components/StoresDashboard'
import { Toaster } from './components/ui/sonner'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ump-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-ump-navy mb-2">Egumeni Eats</h2>
          <p className="text-ump-gray">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Login />
  }

  console.log('🔍 Current user profile:', profile)
  console.log('🎭 Routing to dashboard for role:', profile.role)

  // Route to appropriate dashboard based on user role
  switch (profile.role) {
    case 'supervisor':
    case 'admin':
      return <AdminDashboard />
    case 'kitchen':
      return <KitchenDashboard />
    case 'delivery':
      return <DeliveryDashboard />
    case 'cashier':
      return <CashierDashboard />
    case 'stores':
      return <StoresDashboard />
    default:
      return <CustomerDashboard />
  }
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  )
}