import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { toast } from 'sonner'
import { 
  DollarSign, 
  ShoppingCart, 
  Calculator, 
  FileText, 
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Home,
  Plus,
  Minus,
  Trash2,
  LogOut
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  isAvailable: boolean
}

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  total: number
  specialInstructions?: string
}

interface Shift {
  id: string
  date: string
  shiftNumber: number
  openingFloat: number
  expectedCash: number
  actualCash?: number
  cashVariance?: number
  status: 'open' | 'pending_approval' | 'closed'
}

interface Order {
  id: string
  orderNumber: string
  customerInfo: {
    name: string
    phone?: string
    roomNumber?: string
    tableNumber?: string
  }
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  orderType: 'dine_in' | 'takeaway' | 'room_service'
  paymentMethod: 'cash' | 'card' | 'room_charge' | 'mobile'
  status: string
  createdAt: string
}

export default function CashierDashboard() {
  const { user, profile, logout } = useAuth()
  const [menu, setMenu] = useState<{ [category: string]: MenuItem[] }>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'room_service'>('dine_in')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room_charge' | 'mobile'>('cash')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    roomNumber: '',
    tableNumber: ''
  })
  const [isOpeningShift, setIsOpeningShift] = useState(false)
  const [openingFloat, setOpeningFloat] = useState('100')
  const [showCashUp, setShowCashUp] = useState(false)
  const [denominations, setDenominations] = useState({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0,
    '2': 0, '1': 0, '0.50': 0, '0.20': 0, '0.10': 0, '0.05': 0
  })
  const [loading, setLoading] = useState(false)

  // Fetch menu on component mount
  useEffect(() => {
    fetchMenu()
    fetchCurrentShift()
  }, [])

  const fetchMenu = async () => {
    try {
      const data = await api.request('/menu')
      setMenu(data.menu || {})
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    }
  }

  const fetchCurrentShift = async () => {
    try {
      const data = await api.request('/pos/shift/current')
      setCurrentShift(data.shift)
    } catch (error) {
      console.error('Error fetching current shift:', error)
    }
  }

  const openShift = async () => {
    if (!openingFloat || parseFloat(openingFloat) < 0) {
      toast.error('Please enter a valid opening float amount')
      return
    }

    setLoading(true)
    try {
      const data = await api.request('/pos/shift/open', {
        method: 'POST',
        body: JSON.stringify({
          openingFloat: parseFloat(openingFloat)
        })
      })
      
      setCurrentShift(data.shift)
      setIsOpeningShift(false)
      toast.success('Shift opened successfully')
    } catch (error) {
      console.error('Error opening shift:', error)
      toast.error('Failed to open shift')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        total: menuItem.price
      }
      setCart([...cart, cartItem])
    }
  }

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== cartItemId))
    } else {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ))
    }
  }

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.15 // 15% VAT
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart')
      return
    }

    if (!currentShift || currentShift.status !== 'open') {
      toast.error('No active shift. Please open a shift first.')
      return
    }

    if (!customerInfo.name.trim()) {
      toast.error('Please enter customer name')
      return
    }

    setLoading(true)
    try {
      const { subtotal, tax, total } = calculateTotals()
      const token = user?.access_token

      const orderData = {
        customerInfo,
        items: cart.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          specialInstructions: item.specialInstructions,
          status: 'pending'
        })),
        subtotal,
        tax,
        total,
        orderType,
        paymentMethod,
        paymentStatus: 'completed', // Assuming cash/card payments are processed immediately
        status: 'pending'
      }

      const data = await api.request('/pos/order/create', {
        method: 'POST',
        body: JSON.stringify(orderData)
      })

      if (data.success) {
        toast.success(`Order ${data.order.orderNumber} created successfully`)
        
        // Clear cart and form
        setCart([])
        setCustomerInfo({ name: '', phone: '', roomNumber: '', tableNumber: '' })
        
        // Print receipt (in a real POS system, this would trigger actual printing)
        printReceipt(data.order)
      } else {
        toast.error(data.error || 'Failed to create order')
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error: string) => toast.error(error))
        }
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  const printReceipt = (order: Order) => {
    // In a real implementation, this would send to a thermal printer
    console.log('Printing receipt for order:', order.orderNumber)
    toast.success('Receipt printed successfully')
  }

  const performCashUp = async (type: 'mid_shift' | 'end_shift') => {
    if (!currentShift) {
      toast.error('No active shift')
      return
    }

    setLoading(true)
    try {
      const data = await api.request('/pos/shift/cash-up', {
        method: 'POST',
        body: JSON.stringify({
          shiftId: currentShift.id,
          denominations,
          type
        })
      })

      toast.success('Cash up completed successfully')
      setShowCashUp(false)
      fetchCurrentShift() // Refresh shift data
      
      if (type === 'end_shift') {
        setCurrentShift(null) // Clear current shift
      }
    } catch (error) {
      console.error('Error performing cash up:', error)
      toast.error('Failed to perform cash up')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  // Show shift opening dialog if no current shift
  if (!currentShift && !isOpeningShift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Open Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openingFloat">Opening Float (R)</Label>
              <Input
                id="openingFloat"
                type="number"
                step="0.01"
                min="0"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <Button 
              onClick={openShift} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Opening...' : 'Open Shift'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl">Cashier POS</h1>
            <p className="text-gray-600">
              Shift {currentShift?.shiftNumber} • {profile?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Float: R{currentShift?.expectedCash.toFixed(2)}
            </Badge>
            <Dialog open={showCashUp} onOpenChange={setShowCashUp}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  Cash Up
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cash Up</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(denominations).map(([denom, count]) => (
                      <div key={denom} className="flex items-center gap-2">
                        <span className="w-12">R{denom}:</span>
                        <Input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => setDenominations({
                            ...denominations,
                            [denom]: parseInt(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p>
                      Total Counted: R{Object.entries(denominations)
                        .reduce((sum, [denom, count]) => sum + (parseFloat(denom) * count), 0)
                        .toFixed(2)}
                    </p>
                    <p>
                      Expected: R{currentShift?.expectedCash.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => performCashUp('mid_shift')}
                      variant="outline"
                      className="flex-1"
                    >
                      Mid-Shift
                    </Button>
                    <Button 
                      onClick={() => performCashUp('end_shift')}
                      className="flex-1"
                    >
                      End Shift
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(menu)[0]} className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-4">
                  {Object.keys(menu).map(category => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category.replace('_', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(menu).map(([category, items]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map(item => (
                        <Card 
                          key={item.id} 
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            !item.isAvailable ? 'opacity-50' : ''
                          }`}
                          onClick={() => item.isAvailable && addToCart(item)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold">R{item.price.toFixed(2)}</span>
                              {!item.isAvailable && (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Order Section */}
        <div className="space-y-6">
          {/* Order Type and Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Order Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant={orderType === 'dine_in' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderType('dine_in')}
                  >
                    Dine In
                  </Button>
                  <Button
                    variant={orderType === 'takeaway' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderType('takeaway')}
                  >
                    Takeaway
                  </Button>
                  <Button
                    variant={orderType === 'room_service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderType('room_service')}
                  >
                    Room Service
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="Customer phone"
                />
              </div>

              {orderType === 'room_service' && (
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={customerInfo.roomNumber}
                    onChange={(e) => setCustomerInfo({...customerInfo, roomNumber: e.target.value})}
                    placeholder="Room number"
                  />
                </div>
              )}

              {orderType === 'dine_in' && (
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={customerInfo.tableNumber}
                    onChange={(e) => setCustomerInfo({...customerInfo, tableNumber: e.target.value})}
                    placeholder="Table number"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cart ({cart.length} items)
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart([])}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">R{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="w-16 text-right">R{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment and Totals */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === 'room_charge' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('room_charge')}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Room
                    </Button>
                    <Button
                      variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('mobile')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (15%):</span>
                    <span>R{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={processOrder} 
                  className="w-full" 
                  size="lg"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Processing...' : `Process Order - R${total.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}