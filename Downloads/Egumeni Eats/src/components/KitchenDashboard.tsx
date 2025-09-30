import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Timer,
  Play,
  Check,
  History,
  Search,
  Filter,
  TrendingUp,
  Calendar
} from 'lucide-react'
import egumeniLogo from '../assets/egumeni_eats_logo.png'

interface Order {
  id: string
  customerId: string
  customerInfo: any
  items: any[]
  totalAmount: number
  status: string
  estimatedTime: number
  createdAt: string
  kitchenStartedAt: string | null
  specialInstructions: string
}

export default function KitchenDashboard() {
  const { user, profile, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [historyOrders, setHistoryOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      console.log('Loading orders for kitchen dashboard...')
      const data = await api.request('/pos/order/kitchen')
      console.log('Orders loaded successfully:', data.orders?.length || 0)
      setOrders(data.orders || [])
    } catch (error: any) {
      console.error('Failed to load orders:', error)
      setError(`Failed to load orders: ${error?.message || String(error)}`)
    }
  }

  const loadOrderHistory = async () => {
    try {
      setHistoryLoading(true)
      console.log('Loading order history...')
      const data = await api.request('/pos/order/kitchen')
      console.log('Order history loaded successfully:', data.orders?.length || 0)
      // Get completed orders (ready and delivered)
      const completedOrders = data.orders.filter((order: Order) => 
        ['ready', 'delivered', 'completed'].includes(order.status)
      )
      console.log('Completed orders filtered:', completedOrders.length)
      setHistoryOrders(completedOrders)
    } catch (error) {
      console.error('Failed to load order history:', error)
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error)
      setError(`Failed to load order history: ${errorMessage}`)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await loadOrders()
      await loadOrderHistory()
      setLoading(false)
    }
    loadData()
  }, [])

  // Auto-refresh orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders()
      // Refresh history less frequently (every 5th refresh = every 75 seconds)
      if (Math.random() < 0.2) {
        loadOrderHistory()
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.request(`/pos/order/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      
      await loadOrders()
      // If marking as ready, refresh history to show the moved order
      if (newStatus === 'ready') {
        await loadOrderHistory()
      }
      setSuccess(`Order ${newStatus === 'preparing' ? 'started' : 'marked as ready'}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to update order status:', error)
      setError('Failed to update order status')
    }
  }

  const startOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing')
  }

  const markReady = async (orderId: string) => {
    setProcessingOrder(orderId)
    setError('')
    
    try {
      // Update order status first (main functionality)
      await updateOrderStatus(orderId, 'ready')
      
      // Process ingredients in background (don't block the UI)
      processOrderIngredients(orderId).catch(error => {
        console.warn('Background ingredient processing failed:', error.message)
      })
      
    } catch (error) {
      console.error('Failed to mark order ready:', error)
      setError('Failed to mark order ready. Please try again.')
    } finally {
      setProcessingOrder(null)
    }
  }

  const processOrderIngredients = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    console.log(`🔄 Processing ingredients for order ${orderId}...`)

    for (const item of order.items) {
      try {
        // Add timeout for each API call
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout per call
        
        const recipeResponse = await api.request(`/pos/recipe/${item.menuItemId}`)
        clearTimeout(timeoutId)
        
        if (recipeResponse.recipe?.ingredients?.length > 0) {
          // Process ingredients in parallel for this item
          const promises = recipeResponse.recipe.ingredients.map(async (ingredient: {
            inventoryId: string
            name: string
            quantity: number
            unit: string
          }) => {
            const totalQuantityNeeded = ingredient.quantity * (item.quantity || 1)
            
            try {
              await api.request(`/pos/inventory/${ingredient.inventoryId}/decrement`, {
                method: 'POST',
                body: JSON.stringify({ quantity: totalQuantityNeeded })
              })
              console.log(`✅ Deducted ${totalQuantityNeeded} ${ingredient.unit} of ${ingredient.name}`)
              return { success: true, ingredient: ingredient.name }
            } catch (error) {
              const errorMessage =
                typeof error === 'object' && error !== null && 'message' in error
                  ? (error as any).message
                  : String(error)
              console.warn(`❌ Failed to deduct ${ingredient.name}:`, errorMessage)
              return { success: false, ingredient: ingredient.name, error: errorMessage }
            }
          })
          
          // Wait for all ingredients of this item (with timeout)
          await Promise.allSettled(promises)
        }
      } catch (error) {
        console.warn(
          `No recipe or timeout for ${item.name}:`,
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as any).message
            : String(error)
        )
      }
    }
    
    console.log(`✅ Ingredient processing completed for order ${orderId}`)
  }

  const getTimeSinceCreated = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes === 1) return '1 minute ago'
    return `${diffMinutes} minutes ago`
  }

  const getPreparationTime = (kitchenStartedAt: string | null) => {
    if (!kitchenStartedAt) return null
    
    const now = new Date()
    const started = new Date(kitchenStartedAt)
    const diffMinutes = Math.floor((now.getTime() - started.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just started'
    if (diffMinutes === 1) return '1 minute'
    return `${diffMinutes} minutes`
  }

  const getOrderPriority = (order: Order) => {
    const now = new Date()
    const created = new Date(order.createdAt)
    const ageMinutes = (now.getTime() - created.getTime()) / (1000 * 60)
    
    if (ageMinutes > 20) return 'high'
    if (ageMinutes > 10) return 'medium'
    return 'normal'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Priority</Badge>
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = now.toDateString()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()
    
    if (date.toDateString() === today) {
      return `Today, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })}`
    } else if (date.toDateString() === yesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })}`
    } else {
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const preparingOrders = orders.filter(order => order.status === 'preparing')

  // Filter history orders based on search and filters
  const filteredHistoryOrders = historyOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    const matchesDate = (() => {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          return orderDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return orderDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate history statistics
  const todayOrders = historyOrders.filter(order => {
    const orderDate = new Date(order.createdAt)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const avgPreparationTime = todayOrders.length > 0 
    ? Math.round(todayOrders.reduce((sum, order) => sum + (order.estimatedTime || 15), 0) / todayOrders.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading kitchen orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src={egumeniLogo}
                alt="Egumeni Eats"
                className="w-10 h-10 object-contain mr-3"
              />
              <h1 className="text-xl font-bold">Kitchen Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadOrders()
                  loadOrderHistory()
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <span className="text-sm text-gray-600">Chef {profile?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Waiting to start
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Timer className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{preparingOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently cooking
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <ChefHat className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                Orders in kitchen
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Orders */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Pending Orders ({pendingOrders.length})
            </h2>
            
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending orders</p>
                  <p className="text-sm text-gray-400">All caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrders
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map(order => {
                    const priority = getOrderPriority(order)
                    return (
                      <Card key={order.id} className={`border-2 ${getPriorityColor(priority)}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                Order #{order.id.slice(-8)}
                                {getPriorityBadge(priority)}
                              </CardTitle>
                              <CardDescription>
                                {order.customerInfo.name || 'Guest'} | {getTimeSinceCreated(order.createdAt)}
                              </CardDescription>
                            </div>
                            <Button
                              onClick={() => startOrder(order.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Cooking
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-2">Order Items:</h4>
                              <div className="space-y-1">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                    <span className="text-gray-600">{item.preparationTime || 15} min</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {order.specialInstructions && (
                              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                <h5 className="font-medium text-yellow-800 mb-1">Special Instructions:</h5>
                                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-3 border-t">
                              <span className="text-sm text-gray-600">
                                Estimated time: {order.estimatedTime} minutes
                              </span>
                              <span className="font-bold">R{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Preparing Orders */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Timer className="w-5 h-5 mr-2 text-blue-500" />
              In Progress ({preparingOrders.length})
            </h2>
            
            {preparingOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders in progress</p>
                  <p className="text-sm text-gray-400">Start cooking from pending orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {preparingOrders
                  .sort((a, b) => new Date(a.kitchenStartedAt || a.createdAt).getTime() - new Date(b.kitchenStartedAt || b.createdAt).getTime())
                  .map(order => (
                    <Card key={order.id} className="border-2 border-blue-300 bg-blue-50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.id.slice(-8)}
                            </CardTitle>
                            <CardDescription>
                              {order.customerInfo.name || 'Guest'} | 
                              Cooking for {getPreparationTime(order.kitchenStartedAt)}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => markReady(order.id)}
                            disabled={processingOrder === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingOrder === order.id ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Mark Ready
                              </>
                            )}
                          </Button>
                          {processingOrder !== order.id && (
                            <p className="text-xs text-gray-500 mt-1">
                              ✨ Ingredients will be automatically deducted from inventory
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Order Items:</h4>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                  <span className="font-medium">{item.quantity}x {item.name}</span>
                                  <Badge variant="outline" className="text-blue-600">
                                    Cooking
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {order.specialInstructions && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                              <h5 className="font-medium text-yellow-800 mb-1">Special Instructions:</h5>
                              <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-3 border-t">
                            <span className="text-sm text-blue-600 font-medium">
                              <Timer className="w-4 h-4 inline mr-1" />
                              Target: {order.estimatedTime} min
                            </span>
                            <span className="font-bold">R{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>

            {orders.length === 0 && (
              <Card className="mt-8">
                <CardContent className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kitchen is quiet</h3>
                  <p className="text-gray-500">No active orders at the moment. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* History Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <Calendar className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{todayOrders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Completed today
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">R{todayRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {todayOrders.length} orders
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
                  <Timer className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{avgPreparationTime} min</div>
                  <p className="text-xs text-muted-foreground">
                    Average preparation
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders, customers, or items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={loadOrderHistory}
                    disabled={historyLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order History List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <History className="w-5 h-5 mr-2 text-gray-500" />
                  Order History ({filteredHistoryOrders.length})
                </h2>
              </div>

              {historyLoading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading order history...</p>
                  </CardContent>
                </Card>
              ) : filteredHistoryOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredHistoryOrders
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                      <Card key={order.id} className="border-gray-200">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                Order #{order.id.slice(-8)}
                                <Badge 
                                  className={
                                    order.status === 'delivered' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {order.status === 'delivered' ? 'Delivered' : 'Ready'}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {order.customerInfo?.name || 'Guest'} • {formatDate(order.createdAt)}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">R{order.totalAmount.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">{order.estimatedTime} min target</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-2">Items Prepared:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                    <span className="text-gray-600">R{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {order.specialInstructions && (
                              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                <h5 className="font-medium text-yellow-800 mb-1">Special Instructions:</h5>
                                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}