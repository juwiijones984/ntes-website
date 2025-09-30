import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Utensils, Shield, ChefHat, Truck, CreditCard, Package, Users, Hotel } from 'lucide-react'
import egumeni_eats_logo from '../assets/egumeni_eats_logo.png' // Adjust path if needed

export default function Login() {
  const { login, signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
    const [success, setSuccess] = useState('') // Removed '@<number>.<number>.<number>' occurrences

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer',
    phone: '',
    privilegePin: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(loginData.email, loginData.password)
    
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!signupData.email || !signupData.password || !signupData.name) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    // Validate privilege PIN for admin signup
    if (signupData.role === 'admin') {
      if (!signupData.privilegePin) {
        setError('Admin Privilege PIN is required for admin accounts')
        setIsLoading(false)
        return
      }
      
      if (signupData.privilegePin !== 'EfGoUoMdEsNyIsEtAeTmS') {
        setError('Invalid Privilege PIN. Contact system administrator.')
        setIsLoading(false)
        return
      }
    }

    const result = await signup(
      signupData.email,
      signupData.password,
      signupData.name,
      signupData.role,
      signupData.phone,
      signupData.privilegePin
    )
    
    if (!result.success) {
      setError(result.error || 'Signup failed')
    } else {
      setSuccess('Account created successfully! You are now logged in.')
    }
    
    setIsLoading(false)
  }

  const roleIcons = {
    customer: <Utensils className="w-4 h-4" />,
    admin: <Shield className="w-4 h-4" />,
    supervisor: <Users className="w-4 h-4" />,
    kitchen: <ChefHat className="w-4 h-4" />,
    delivery: <Truck className="w-4 h-4" />,
    cashier: <CreditCard className="w-4 h-4" />,
    stores: <Package className="w-4 h-4" />
  }

  // Available roles for signup - only Customer and Admin can self-register
  const allowedSignupRoles = {
    customer: 'Hotel guests and UMP staff',
    admin: 'System administrators (requires privilege PIN)'
  }

  const roleDescriptions = {
    customer: 'Hotel guests and UMP staff',
    admin: 'System administrators',
    supervisor: 'Management and supervisors',
    kitchen: 'Kitchen staff members',
    delivery: 'Delivery personnel',
    cashier: 'POS cashier staff',
    stores: 'Inventory and stores management'
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative login-background"
    >
      {/* Background overlay with UMP navy */}
      <div className="absolute inset-0 bg-ump-navy/40"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg border-4 border-ump-orange">
              <img
                src={egumeni_eats_logo}
                alt="Egumeni Eats"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold drop-shadow-md mb-2">Egumeni Eats</h1>
          <p className="text-white/90 drop-shadow-md">University of Mpumalanga</p>
          <p className="text-white/80 text-sm drop-shadow-md">Tfokomala Hotel Ordering System</p>
          
          {/* UMP Brand Colors Indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-ump-orange rounded-full shadow-lg"></div>
            <div className="w-3 h-3 bg-ump-green rounded-full shadow-lg"></div>
            <div className="w-3 h-3 bg-ump-red rounded-full shadow-lg"></div>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-ump-navy/20">
          <CardHeader>
            <CardTitle className="text-ump-navy">Welcome</CardTitle>
            <CardDescription className="text-ump-gray">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-ump-red/30 bg-ump-red/10">
                  <AlertDescription className="text-ump-red">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 border-ump-green/30 bg-ump-green/10">
                  <AlertDescription className="text-ump-green">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-ump-navy hover:bg-ump-navy/90 text-white" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-ump-light-gray rounded-lg border border-ump-navy/10">
                  <p className="text-sm text-ump-navy mb-3">
                    <Hotel className="inline w-4 h-4 mr-2" />
                    Egumeni Eats Production System
                  </p>
                  <p className="text-xs text-ump-gray">
                    Please use your assigned credentials to access the system. Contact your administrator for account creation or password reset assistance.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="p-3 bg-ump-light-gray rounded-lg border border-ump-navy/10 mb-4">
                  <p className="text-sm text-ump-navy mb-1">
                    <strong>Registration Policy:</strong>
                  </p>
                  <p className="text-xs text-ump-gray">
                    • <strong>Customers:</strong> Anyone can register as a customer (default)<br/>
                    • <strong>Admins:</strong> Requires privilege PIN from system administrator<br/>
                    • <strong>Staff Roles:</strong> Kitchen, Delivery, Cashier, and Stores staff are created by Admins only
                  </p>
                </div>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select
                      value={signupData.role}
                      onValueChange={(value: string) => setSignupData({ ...signupData, role: value, privilegePin: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(allowedSignupRoles).map(([role, description]) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              {roleIcons[role as keyof typeof roleIcons]}
                              <div>
                                <div className="capitalize">{role}</div>
                                <div className="text-xs text-gray-500">{description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Admin Privilege PIN field - only shown when admin role is selected */}
                  {signupData.role === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-pin">Admin Privilege PIN</Label>
                      <Input
                        id="signup-pin"
                        type="password"
                        placeholder="Enter Admin Privilege PIN"
                        value={signupData.privilegePin}
                        onChange={(e) => setSignupData({ ...signupData, privilegePin: e.target.value })}
                        required
                      />
                      <p className="text-xs text-ump-gray">
                        Contact system administrator for the privilege PIN
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-ump-orange hover:bg-ump-orange/90 text-white" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}