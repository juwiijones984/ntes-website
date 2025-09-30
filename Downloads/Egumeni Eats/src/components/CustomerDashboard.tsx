import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { ImageWithFallback } from './figma/ImageWithFallback'
import PaymentGateway from './PaymentGateway'
import HotelChatbot from './HotelChatbot'
import StatusNotification from './StatusNotification'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  CheckCircle, 
  Truck,
  User,
  LogOut,
  Search,
  Star,
  MapPin,
  Hotel,
  MessageCircle,
  Heart,
  Sparkles,
  Home,
  Package
} from 'lucide-react'
import egumeniLogo from '../assets/egumeni_eats_logo.png'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  ingredients: string[]
  preparationTime: number
  isAvailable: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Order {
  id: string
  items: CartItem[]
  totalAmount: number
  status: string
  estimatedTime: number
  createdAt: string
  specialInstructions: string
  deliveryOption?: string
  roomNumber?: string
}

export default function CustomerDashboard() {
  const { profile, logout } = useAuth()
  const [menu, setMenu] = useState<{ [category: string]: MenuItem[] }>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [error, setError] = useState('')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [cartBounce, setCartBounce] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const loadMenu = async () => {
    try {
      const data = await api.request('/menu')
      setMenu(data.menu || {})
    } catch (error) {
      console.error('Failed to load menu:', error)
      setError('Failed to load menu. Please check your connection and try again.')
      
      toast.error('Unable to load menu. Please try again later.')
    }
  }

  const loadOrders = async () => {
    try {
      const data = await api.request('/orders')
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
      // For better UX, don't show error for orders if menu loads successfully
      // Just log the error and keep empty orders array
      setOrders([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load menu first (more critical)
        await loadMenu()
        // Then load orders (less critical, can fail gracefully)
        await loadOrders()
      } catch (error) {
        console.error('Error loading initial data:', error)
        // Continue even if there are errors - we handle them individually
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Retry loading data when connection is restored
      if (Object.keys(menu).length === 0 || error) {
        loadMenu()
        loadOrders()
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [menu, error])

  const addToCart = (item: MenuItem) => {
    setAddingToCart(item.id)
    
    // Add a small delay for better UX feedback
    setTimeout(() => {
      setCart(prevCart => {
        const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
        if (existingItem) {
          // Item already exists, increment quantity
          toast.success(`Added another ${item.name} to cart`, {
            description: `Quantity: ${existingItem.quantity + 1}`,
            duration: 2000,
          })
          return prevCart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        } else {
          // New item added to cart
          toast.success(`${item.name} added to cart!`, {
            description: `R${item.price.toFixed(2)} • ${item.preparationTime} min prep time`,
            duration: 2000,
          })
          return [...prevCart, { ...item, quantity: 1 }]
        }
      })
      
      // Trigger cart bounce animation
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 600)
      
      setAddingToCart(null)
    }, 300)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handlePaymentSuccess = async () => {
    try {
      toast.success('Payment successful! Order placed!', {
        description: `Total: R${getTotalAmount().toFixed(2)} • Your order is being prepared`,
        duration: 4000,
      })

      setCart([])
      setSpecialInstructions('')
      setShowPayment(false)
      setOrderSuccess(true)
      setTimeout(() => setOrderSuccess(false), 5000)
      await loadOrders()
    } catch (error) {
      console.error('Error after payment success:', error)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    toast.error('Payment failed', {
      description: errorMessage,
      duration: 4000,
    })
  }

  const proceedToPayment = () => {
    if (cart.length === 0) return
    setShowDeliveryDialog(true)
  }

  const handleDeliverySelection = () => {
    if (!deliveryOption) {
      toast.error('Please select a delivery option')
      return
    }
    if (deliveryOption === 'room' && !roomNumber.trim()) {
      toast.error('Please enter your room number')
      return
    }
    setShowDeliveryDialog(false)
    setShowPayment(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-ump-orange/10 text-ump-orange border-ump-orange/20' },
      preparing: { label: 'Preparing', color: 'bg-ump-navy/10 text-ump-navy border-ump-navy/20' },
      ready: { label: 'Ready', color: 'bg-ump-green/10 text-ump-green border-ump-green/20' },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-ump-orange/20 text-ump-orange border-ump-orange/30' },
      delivered: { label: 'Delivered', color: 'bg-ump-gray/10 text-ump-gray border-ump-gray/20' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-ump-orange" />
      case 'preparing':
        return <Clock className="w-4 h-4 text-ump-navy" />
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-ump-green" />
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-ump-orange" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-ump-gray" />
      default:
        return <Clock className="w-4 h-4 text-ump-orange" />
    }
  }

  const filteredMenu = () => {
    let allItems: MenuItem[] = []
    
    Object.entries(menu).forEach(([category, items]) => {
      if (selectedCategory === 'all' || selectedCategory === category) {
        allItems = [...allItems, ...items]
      }
    })

    if (searchTerm) {
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return allItems
  }

  const categories = ['all', ...Object.keys(menu)]

  if (loading && Object.keys(menu).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ump-light-gray">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ump-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-ump-navy mb-2">Loading Menu</h2>
          <p className="text-ump-gray">Preparing fresh options for you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ump-light-gray">
      {/* Header with UMP Branding */}
      <header className="bg-gradient-to-r from-ump-navy to-ump-navy/90 text-white shadow-lg border-b-4 border-ump-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full mr-3 shadow-md">
                <img
                  src={egumeniLogo}
                  alt="Egumeni Eats"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">Egumeni Eats</h1>
                <p className="text-xs text-white/80 hidden sm:block">University of Mpumalanga • Tfokomala Hotel</p>
              </div>
              {/* UMP Brand Accent */}
              <div className="hidden lg:flex space-x-1 ml-4">
                <div className="w-1 h-10 bg-ump-orange rounded-full"></div>
                <div className="w-1 h-10 bg-ump-green rounded-full"></div>
                <div className="w-1 h-10 bg-ump-red rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-white/80">
                <Hotel className="w-4 h-4" />
                <span className="text-sm">Student & Staff Dining</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{profile?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10 border border-white/20">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ump-orange/10 to-ump-green/10 border-b border-ump-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-ump-orange" />
                <span className="font-medium text-ump-navy">Welcome to Tfokomala Hotel</span>
              </div>
              <Badge className="bg-ump-green/10 text-ump-green border-ump-green/20">
                Fresh • Local • Delicious
              </Badge>

            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-ump-gray">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-ump-orange" />
                <span>Kitchen Hours: 6:30 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4 text-ump-green" />
                <span>Need help? Chat with us!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="cart" className={`relative transition-transform ${cartBounce ? 'animate-bounce' : ''}`}>
              Cart ({getCartItemCount()})
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-ump-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {getCartItemCount()}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          {orderSuccess && (
            <Alert className="mt-4 border-ump-green/30 bg-ump-green/10">
              <CheckCircle className="w-4 h-4 text-ump-green" />
              <AlertDescription className="text-ump-green">
                Order placed successfully! You can track it in the Orders tab.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <StatusNotification
              isOnline={isOnline}
              error={error}
              loading={loading}
              onRetry={() => {
                setError('')
                setLoading(true)
                // Reset API fallback mode before retrying
                api.resetFallbackMode()
                const loadData = async () => {
                  try {
                    await loadMenu()
                    await loadOrders()
                  } finally {
                    setLoading(false)
                  }
                }
                loadData()
              }}
              onDismiss={() => setError('')}
            />
          </div>

          <TabsContent value="menu" className="mt-6">
            {/* Menu Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-ump-navy">Our Menu</h2>
                  <p className="text-ump-gray flex items-center">Fresh ingredients, authentic flavors, made with <Heart className="w-4 h-4 inline text-ump-red mx-1" /></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ump-gray">
                    {filteredMenu().length} {filteredMenu().length === 1 ? 'item' : 'items'} available
                  </p>
                  {selectedCategory !== 'all' && (
                    <Badge className="mt-1 capitalize bg-ump-orange/10 text-ump-orange border-ump-orange/20">
                      {selectedCategory}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ump-gray w-4 h-4" />
                  <Input
                    placeholder="Search delicious dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-ump-navy/20 focus:border-ump-orange focus:ring-ump-orange/20"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`capitalize transition-all ${
                        selectedCategory === category 
                          ? 'bg-ump-navy hover:bg-ump-navy/90 text-white' 
                          : 'border-ump-navy/20 hover:border-ump-orange hover:bg-ump-orange/10 text-ump-navy'
                      }`}
                    >
                      {category === 'all' ? '🍽️ All Items' : `🥘 ${category}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenu().map(item => (
                <Card key={item.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-200 border-ump-navy/10 hover:border-ump-orange/30">
                  <div className="aspect-square bg-gray-100 flex-shrink-0 relative group">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          e.currentTarget.src = `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop`
                        }}
                      />
                    ) : (
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="flex-shrink-0 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg leading-tight line-clamp-2">{item.name}</CardTitle>
                      <Badge 
                        className={`flex-shrink-0 ${
                          item.isAvailable 
                            ? 'bg-ump-green/10 text-ump-green border-ump-green/20' 
                            : 'bg-ump-red/10 text-ump-red border-ump-red/20'
                        }`}
                      >
                        {item.isAvailable ? "✓ Available" : "Sold Out"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between pt-2">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-ump-orange">
                        R{item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center text-sm text-ump-gray bg-ump-light-gray px-2 py-1 rounded-full">
                        <Clock className="w-4 h-4 mr-1 text-ump-orange" />
                        {item.preparationTime} min
                      </div>
                    </div>
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable || addingToCart === item.id}
                      className={`w-full mt-auto transition-all ${
                        item.isAvailable 
                          ? 'bg-ump-navy hover:bg-ump-navy/90 text-white shadow-md hover:shadow-lg' 
                          : 'cursor-not-allowed'
                      }`}
                      size="sm"
                    >
                      {addingToCart === item.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : !item.isAvailable ? (
                        <>
                          <span>Currently Unavailable</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cart" className="mt-6">
            {cart.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-ump-gray mx-auto mb-4" />
                  <p className="text-ump-navy">Your cart is empty</p>
                  <p className="text-sm text-ump-gray">Add items from the menu to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                        <div className="flex items-center space-x-3 flex-1">
                          {item.image && (
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-ump-gray">R{item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity === 1) {
                                toast.success(`${item.name} removed from cart`, {
                                  duration: 2000,
                                })
                              }
                              updateQuantity(item.id, item.quantity - 1)
                            }}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateQuantity(item.id, item.quantity + 1)
                              toast.success(`${item.name} quantity increased`, {
                                description: `Quantity: ${item.quantity + 1}`,
                                duration: 1500,
                              })
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="ml-4 font-medium">
                          R{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Special Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any special requests or dietary requirements..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                  </CardContent>
                </Card>

                {!showPayment ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium">Total:</span>
                        <span className="text-2xl font-bold text-ump-orange">
                          R{getTotalAmount().toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onClick={proceedToPayment}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                      >
                        Proceed to Payment
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowPayment(false)}
                      className="mb-4"
                    >
                      ← Back to Cart
                    </Button>
                    <PaymentGateway
                      totalAmount={getTotalAmount()}
                      items={cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                      }))}
                      specialInstructions={specialInstructions}
                      deliveryOption={deliveryOption}
                      roomNumber={roomNumber}
                      customerInfo={{
                        name: profile?.name || '',
                        phone: profile?.phone || '',
                        email: profile?.email || ''
                      }}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="w-12 h-12 text-ump-gray mx-auto mb-4" />
                  <p className="text-ump-navy">No orders yet</p>
                  <p className="text-sm text-ump-gray">Your order history will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(-8)}
                          </CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString()} at{' '}
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <div className="text-sm text-gray-600 mb-4">
                          <strong>Special instructions:</strong> {order.specialInstructions}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">R{order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.status === 'preparing' && (
                        <div className="mt-4 text-sm text-blue-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Estimated time: {order.estimatedTime} minutes
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delivery Selection Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-md mx-auto border-ump-navy/20">
          <DialogHeader>
            <DialogTitle className="text-ump-navy flex items-center">
              <Truck className="w-5 h-5 mr-2 text-ump-orange" />
              Delivery Options
            </DialogTitle>
            <DialogDescription className="text-ump-gray">
              How would you like to receive your order?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
              <div className="flex items-center space-x-3 p-3 border border-ump-navy/10 rounded-lg hover:bg-ump-orange/5 transition-colors">
                <RadioGroupItem value="delivery" id="delivery" className="border-ump-navy text-ump-navy" />
                <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-ump-orange" />
                    <div>
                      <div className="font-medium text-ump-navy">Delivery to Campus</div>
                      <div className="text-sm text-ump-gray">Free delivery within UMP campus</div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-ump-navy/10 rounded-lg hover:bg-ump-green/5 transition-colors">
                <RadioGroupItem value="room" id="room" className="border-ump-navy text-ump-navy" />
                <Label htmlFor="room" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-2 text-ump-green" />
                    <div>
                      <div className="font-medium text-ump-navy">Room Service</div>
                      <div className="text-sm text-ump-gray">Delivered to your hotel room</div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-ump-navy/10 rounded-lg hover:bg-ump-navy/5 transition-colors">
                <RadioGroupItem value="collect" id="collect" className="border-ump-navy text-ump-navy" />
                <Label htmlFor="collect" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-ump-navy" />
                    <div>
                      <div className="font-medium text-ump-navy">Collect from Restaurant</div>
                      <div className="text-sm text-ump-gray">Pick up from Tfokomala Hotel</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {deliveryOption === 'room' && (
              <div className="mt-4">
                <Label htmlFor="roomNumber" className="text-ump-navy">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="Enter your room number (e.g., 101, 205)"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="mt-1 border-ump-navy/20 focus:border-ump-orange focus:ring-ump-orange/20"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeliveryDialog(false)}
              className="border-ump-navy/20 text-ump-navy hover:bg-ump-navy/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeliverySelection}
              className="bg-ump-navy hover:bg-ump-navy/90 text-white"
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hotel Chatbot */}
      <HotelChatbot />
    </div>
  )
}