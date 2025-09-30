import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import ConfirmDialog from './ConfirmDialog'
import { 
  Shield,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Package,
  LogOut,
  RefreshCw,
  Camera,
  Upload,
  X,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  UserPlus,
  UserCheck,
  UserX,
  Key,
  Search,
  Filter,
  Settings,
  Activity,
  Minus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
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
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  customerId: string
  customerInfo: any
  items: any[]
  totalAmount: number
  status: string
  estimatedTime: number
  createdAt: string
  specialInstructions: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  phone: string
  createdAt: string
  isActive: boolean
  createdBy?: string
  createdByName?: string
  updatedAt?: string
  updatedBy?: string
  updatedByName?: string
  passwordResetAt?: string
}

interface Shift {
  id: string
  userId: string
  userName: string
  userRole: string
  shiftType: string
  startTime: string
  expectedEndTime?: string
  endTime?: string
  status: string
  createdAt: string
  createdBy: string
  createdByName: string
}

export default function AdminDashboard() {
  const { profile, logout } = useAuth()
  const [menu, setMenu] = useState<{ [category: string]: MenuItem[] }>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Inventory state for ingredient selection
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<{
    inventoryId: string
    name: string
    quantity: number
    unit: string
  }[]>([])
  
  // Modal states
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    item: MenuItem | null
  }>({ open: false, item: null })
  
  // Form data
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: '',
    preparationTime: '15',
    isAvailable: true
  })
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Analytics state
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'charts' | 'items'>('overview')

  // User Management state
  const [users, setUsers] = useState<User[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showShiftManagement, setShowShiftManagement] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'cashier',
    phone: ''
  })
  
  // Password reset state
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  
  // Shift creation form state
  const [shiftForm, setShiftForm] = useState({
    staffId: '',
    shiftType: ''
  })

  const loadMenu = async () => {
    try {
      const data = await api.request('/menu')
      setMenu(data.menu)
    } catch (error) {
      console.error('Failed to load menu:', error)
      setError('Failed to load menu')
    }
  }

  const loadOrders = async () => {
    try {
      const data = await api.request('/orders')
      setOrders(data.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const loadInventoryItems = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const data = await api.request('/pos/inventory')
      clearTimeout(timeoutId)
      setInventoryItems(data.items || [])
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Inventory service not available:', error.message)
      } else {
        console.warn('Inventory service not available:', error)
      }
      // Set empty array if inventory service is not available
      setInventoryItems([])
    }
  }

  const initializeData = async () => {
    try {
      await api.request('/init', { method: 'POST' })
      setSuccess('Sample data initialized')
      setTimeout(() => setSuccess(''), 3000)
      await loadMenu()
    } catch (error) {
      console.error('Failed to initialize data:', error)
      setError('Failed to initialize sample data')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      // Load core data first
      await Promise.all([loadMenu(), loadOrders(), loadUsers(), loadShifts()])
      setLoading(false)
      
      // Load inventory items separately (non-blocking)
      loadInventoryItems()
    }
    loadData()
  }, [])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      ingredients: '',
      preparationTime: '15',
      isAvailable: true
    })
    setSelectedIngredients([])
    setEditingItem(null)
    setSelectedImage(null)
    setImagePreview('')
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    setItemForm({ ...itemForm, image: '' })
  }

  const addIngredient = (inventoryId: string) => {
    try {
      if (!inventoryId || inventoryId === '') return
      
      const inventoryItem = inventoryItems?.find(item => item?.id === inventoryId)
      if (!inventoryItem) {
        console.warn('Inventory item not found:', inventoryId)
        return
      }

      // Check if ingredient already added
      if (selectedIngredients.find(ing => ing.inventoryId === inventoryId)) {
        setError('Ingredient already added')
        setTimeout(() => setError(''), 3000)
        return
      }

      const newIngredient = {
        inventoryId,
        name: inventoryItem.name || 'Unknown Item',
        quantity: 1,
        unit: inventoryItem.unit || 'unit'
      }
      
      setSelectedIngredients(prev => [...prev, newIngredient])
    } catch (error) {
      console.warn('Error adding ingredient:', error)
    }
  }

  const updateIngredientQuantity = (inventoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeIngredient(inventoryId)
      return
    }
    
    setSelectedIngredients(prev => 
      prev.map(ing => 
        ing.inventoryId === inventoryId 
          ? { ...ing, quantity } 
          : ing
      )
    )
  }

  const removeIngredient = (inventoryId: string) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.inventoryId !== inventoryId))
  }
  
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploadingImage(true)

    try {
      let imageUrl = itemForm.image
      
      // Convert uploaded image to base64 if present
      if (selectedImage) {
        imageUrl = await convertImageToBase64(selectedImage)
      }
      
      const itemData = {
        ...itemForm,
        image: imageUrl,
        price: parseFloat(itemForm.price),
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
      }

      const response = await api.request('/menu', {
        method: 'POST',
        body: JSON.stringify(itemData)
      })

      // Save recipe if ingredients are selected (non-blocking)
      if (selectedIngredients.length > 0) {
        // Save recipe in background, don't wait for it
        api.request('/pos/recipe', {
          method: 'POST',
          body: JSON.stringify({
            menuItemId: response.menuItem.id,
            ingredients: selectedIngredients
          })
        }).catch(recipeError => {
          console.warn('Recipe save failed, but menu item was created successfully:', recipeError.message)
        })
      }

      setSuccess('Menu item added successfully')
      setShowAddItem(false)
      resetForm()
      await loadMenu()
    } catch (error) {
      console.error('Failed to add menu item:', error)
      setError('Failed to add menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setError('')
    setSuccess('')
    setUploadingImage(true)

    try {
      let imageUrl = itemForm.image
      
      // Convert uploaded image to base64 if present
      if (selectedImage) {
        imageUrl = await convertImageToBase64(selectedImage)
      }
      
      const itemData = {
        ...itemForm,
        image: imageUrl,
        price: parseFloat(itemForm.price),
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
      }

      await api.request(`/menu/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData)
      })

      // Update recipe if ingredients are selected (non-blocking)
      if (selectedIngredients.length > 0) {
        // Save recipe in background, don't wait for it
        api.request('/pos/recipe', {
          method: 'POST',
          body: JSON.stringify({
            menuItemId: editingItem.id,
            ingredients: selectedIngredients
          })
        }).catch(recipeError => {
          console.warn('Recipe update failed, but menu item was updated successfully:', recipeError.message)
        })
      }

      setSuccess('Menu item updated successfully')
      setEditingItem(null)
      resetForm()
      await loadMenu()
    } catch (error) {
      console.error('Failed to update menu item:', error)
      setError('Failed to update menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      ingredients: item.ingredients.join(', '),
      preparationTime: item.preparationTime.toString(),
      isAvailable: item.isAvailable
    })
    // Set current image as preview for editing
    if (item.image) {
      setImagePreview(item.image)
    }
    setSelectedImage(null)

    // Load existing recipe asynchronously
    loadRecipeForItem(item.id)
  }

  const loadRecipeForItem = async (itemId: string) => {
    try {
      // Add timeout for recipe loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const recipeData = await api.request(`/pos/recipe/${itemId}`)
      clearTimeout(timeoutId)
      
      if (recipeData.recipe && recipeData.recipe.ingredients) {
        setSelectedIngredients(recipeData.recipe.ingredients)
      } else {
        setSelectedIngredients([])
      }
    } catch (error) {
      console.warn('Failed to load recipe for item:', itemId, (error as any).message)
      setSelectedIngredients([])
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeleteConfirm({ open: false, item: null })
      await api.request(`/menu/${itemId}`, {
        method: 'DELETE'
      })
      
      setSuccess('Menu item deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      await loadMenu()
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      setError('Failed to delete menu item')
    }
  }

  const confirmDelete = (item: MenuItem) => {
    setDeleteConfirm({ open: true, item })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      
      await loadOrders()
      setSuccess(`Order status updated to ${newStatus}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to update order status:', error)
      setError('Failed to update order status')
    }
  }

  // User Management Functions
  const loadUsers = async () => {
    try {
      const data = await api.request('/users')
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to load users:', error)
      setError('Failed to load users')
    }
  }

  const loadShifts = async () => {
    try {
      const data = await api.request('/shifts')
      setShifts(data.shifts)
    } catch (error) {
      console.error('Failed to load shifts:', error)
    }
  }

  const resetUserForm = () => {
    setUserForm({
      email: '',
      password: '',
      name: '',
      role: 'cashier',
      phone: ''
    })
    setEditingUser(null)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await api.request('/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      })

      setSuccess('Staff member added successfully')
      setShowAddUser(false)
      resetUserForm()
      await loadUsers()
    } catch (error) {
      console.error('Failed to add staff member:', error)
      setError('Failed to add staff member')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setError('')
    setSuccess('')

    try {
      await api.request(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(userForm)
      })

      setSuccess('Staff member updated successfully')
      setEditingUser(null)
      resetUserForm()
      await loadUsers()
    } catch (error) {
      console.error('Failed to update staff member:', error)
      setError('Failed to update staff member')
    }
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      password: '', // Don't populate password
      name: user.name,
      role: user.role,
      phone: user.phone
    })
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.request(`/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive })
      })

      setSuccess(`Staff member ${isActive ? 'activated' : 'deactivated'} successfully`)
      setTimeout(() => setSuccess(''), 3000)
      await loadUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
      setError('Failed to update user status')
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordResetUser || !newPassword) return

    setError('')
    setSuccess('')

    try {
      await api.request(`/users/${passwordResetUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      })

      setSuccess('Password reset successfully')
      setPasswordResetUser(null)
      setNewPassword('')
    } catch (error) {
      console.error('Failed to reset password:', error)
      setError('Failed to reset password')
    }
  }

  const createShift = async (userId: string, shiftType: string) => {
    try {
      setError('')
      setSuccess('')
      
      // Calculate expected end time based on shift type
      const startTime = new Date()
      let expectedEndTime = null
      
      if (shiftType === 'morning') {
        expectedEndTime = new Date()
        expectedEndTime.setHours(15, 0, 0, 0) // 3 PM
      } else if (shiftType === 'evening') {
        expectedEndTime = new Date()
        expectedEndTime.setHours(23, 0, 0, 0) // 11 PM
      } else if (shiftType === 'full-day') {
        expectedEndTime = new Date()
        expectedEndTime.setHours(23, 0, 0, 0) // 11 PM
      }

      await api.request('/shifts', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          shiftType,
          startTime: startTime.toISOString(),
          expectedEndTime: expectedEndTime?.toISOString()
        })
      })

      setSuccess('Shift started successfully')
      setTimeout(() => setSuccess(''), 3000)
      setShiftForm({ staffId: '', shiftType: '' }) // Reset form
      await loadShifts()
    } catch (error) {
      console.error('Failed to create shift:', error)
      setError('Failed to create shift')
      setTimeout(() => setError(''), 5000)
    }
  }

  const endShift = async (shiftId: string) => {
    try {
      setError('')
      setSuccess('')
      
      await api.request(`/shifts/${shiftId}/end`, {
        method: 'PUT',
        body: JSON.stringify({ endTime: new Date().toISOString() })
      })

      setSuccess('Shift ended successfully')
      setTimeout(() => setSuccess(''), 3000)
      await loadShifts()
    } catch (error) {
      console.error('Failed to end shift:', error)
      setError('Failed to end shift')
      setTimeout(() => setError(''), 5000)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getUserStats = () => {
    const totalUsers = users.length || 0
    const activeUsers = users.filter(u => u.isActive).length || 0
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const activeShifts = shifts.filter(s => s.status === 'active').length || 0
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleCount,
      activeShifts
    }
  }

  const getOrderStats = () => {
    const today = new Date().toDateString()
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    )
    
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const preparingOrders = orders.filter(order => order.status === 'preparing').length

    return {
      todayOrders: todayOrders.length,
      totalRevenue,
      pendingOrders,
      preparingOrders
    }
  }

  // Enhanced analytics functions for comprehensive revenue tracking
  const getRevenueAnalytics = () => {
    const now = new Date()
    
    // Daily Revenue (Today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dailyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfToday
    )
    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Weekly Revenue (Last 7 days)
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const weeklyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfWeek
    )
    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Monthly Revenue (This month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfMonth
    )
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Yearly Revenue (This year)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfYear
    )
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Previous periods for comparison
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfYesterday && orderDate < endOfYesterday
    })
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    const startOfLastWeek = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
    const endOfLastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const lastWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfLastWeek && orderDate < endOfLastWeek
    })
    const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfLastMonth && orderDate < endOfLastMonth
    })
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate growth percentages
    const dailyGrowth = yesterdayRevenue > 0 ? ((dailyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    const weeklyGrowth = lastWeekRevenue > 0 ? ((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0
    const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return {
      daily: {
        revenue: dailyRevenue,
        orders: dailyOrders.length,
        growth: dailyGrowth,
        comparison: yesterdayRevenue
      },
      weekly: {
        revenue: weeklyRevenue,
        orders: weeklyOrders.length,
        growth: weeklyGrowth,
        comparison: lastWeekRevenue
      },
      monthly: {
        revenue: monthlyRevenue,
        orders: monthlyOrders.length,
        growth: monthlyGrowth,
        comparison: lastMonthRevenue
      },
      yearly: {
        revenue: yearlyRevenue,
        orders: yearlyOrders.length,
        growth: 0, // Can't calculate yearly growth without previous year data
        comparison: 0
      }
    }
  }

  // Chart data for revenue trends
  const getRevenueChartData = () => {
    const last7Days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startOfDay && orderDate < endOfDay
      })
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }
    
    return last7Days
  }

  // Get top performing menu items
  const getTopPerformingItems = () => {
    type ItemSales = {
      [name: string]: {
        name: string
        quantity: number
        revenue: number
      }
    }
    const itemSales: ItemSales = {}
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        itemSales[item.name].quantity += item.quantity
        itemSales[item.name].revenue += item.price * item.quantity
      })
    })
    
    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const getAllMenuItems = () => {
    return Object.values(menu).flat()
  }

  const getMenuStats = () => {
    const allItems = getAllMenuItems()
    return {
      totalItems: allItems.length,
      availableItems: allItems.filter(item => item.isAvailable).length,
      categories: Object.keys(menu).length
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
      ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const stats = getOrderStats()
  const menuStats = getMenuStats()
  const revenueAnalytics = getRevenueAnalytics()
  const chartData = getRevenueChartData()
  const topItems = getTopPerformingItems()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
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
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { loadMenu(); loadOrders(); loadUsers(); loadShifts(); }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <span className="text-sm text-gray-600">Welcome, {profile?.name}</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuStats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {menuStats.availableItems} available
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage customer orders and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                    <Button
                      onClick={initializeData}
                      className="mt-4"
                      variant="outline"
                    >
                      Initialize Sample Data
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                              <CardTitle className="text-lg">
                                Order #{order.id.slice(-8)}
                              </CardTitle>
                              <CardDescription>
                                Customer: {order.customerInfo.name || 'N/A'} | 
                                {new Date(order.createdAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              {getStatusBadge(order.status)}
                              <Select
                                value={order.status}
                                onValueChange={(value: string) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Order Items:</p>
                                <ul className="text-sm mt-1">
                                  {order.items.map((item, index) => (
                                    <li key={index}>
                                      {item.quantity}x {item.name} - R{(item.price * item.quantity).toFixed(2)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Total: <span className="font-bold">R{order.totalAmount.toFixed(2)}</span></p>
                                <p className="text-sm text-gray-600">Est. Time: {order.estimatedTime} min</p>
                                {order.specialInstructions && (
                                  <p className="text-sm text-gray-600">Notes: {order.specialInstructions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>Add, edit, and manage your restaurant menu items</CardDescription>
                  </div>
                  <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setShowAddItem(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Menu Item</DialogTitle>
                        <DialogDescription>
                          Create a new menu item for your restaurant.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={itemForm.description}
                            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (R)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={itemForm.price}
                              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prep-time">Prep Time (min)</Label>
                            <Input
                              id="prep-time"
                              type="number"
                              value={itemForm.preparationTime}
                              onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={itemForm.category}
                            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                            placeholder="e.g., Main Dishes, Desserts"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Recipe Ingredients</Label>
                          <div className="space-y-3">
                            {/* Add Ingredient Selector */}
                            <div className="flex gap-2">
                              <Select onValueChange={addIngredient} disabled={!inventoryItems || inventoryItems.length === 0} aria-label="Select ingredient to add">
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder={
                                    inventoryItems === undefined ? "Loading ingredients..." :
                                    !inventoryItems || inventoryItems.length === 0 ? "No inventory available" :
                                    "Select ingredient from inventory"
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {(inventoryItems || [])
                                    .filter(item => item && item.category === 'ingredients')
                                    .filter(item => !selectedIngredients.find(ing => ing.inventoryId === item.id))
                                    .map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name} ({item.currentStock || 0} {item.unit || 'unit'} available)
                                      </SelectItem>
                                    ))}
                                  {(!inventoryItems || inventoryItems.filter(item => item && item.category === 'ingredients').length === 0) && (
                                    <SelectItem value="" disabled>
                                      No ingredients available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Selected Ingredients List */}
                            {selectedIngredients.length > 0 && (
                              <div className="border rounded-lg p-3 space-y-2">
                                <Label className="text-sm">Selected Ingredients:</Label>
                                {selectedIngredients.map((ingredient) => (
                                  <div key={ingredient.inventoryId} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                    <span className="flex-1 text-sm">{ingredient.name}</span>
                                    <Input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={ingredient.quantity}
                                      onChange={(e) => updateIngredientQuantity(ingredient.inventoryId, parseFloat(e.target.value) || 0)}
                                      placeholder="Qty"
                                      title="Quantity"
                                      className="w-20 h-8"
                                    />
                                    <span className="text-sm text-gray-500 w-12">{ingredient.unit}</span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeIngredient(ingredient.inventoryId)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {inventoryItems === undefined ? (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  Loading ingredients from inventory...
                                </p>
                              </div>
                            ) : (!inventoryItems || inventoryItems.filter(item => item && item.category === 'ingredients').length === 0) ? (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                                  <strong>Note:</strong> No ingredients available in inventory. You can still create the menu item and add ingredients later through the Stores Dashboard.
                                </p>
                              </div>
                            ) : (
                              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                  <CheckCircle className="w-4 h-4 inline mr-1" />
                                  {inventoryItems.filter(item => item && item.category === 'ingredients').length} ingredients available in inventory
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Image Upload Section */}
                        <div className="space-y-2">
                          <Label>Item Image</Label>
                          <div className="space-y-3">
                            {imagePreview ? (
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={removeImage}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="text-center">
                                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">Upload an image of your menu item</p>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                    title="Choose image file"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose Image
                                  </Button>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 5MB)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="available"
                            checked={itemForm.isAvailable}
                            onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                            title="Available"
                            placeholder="Available"
                          />
                          <Label htmlFor="available">Available</Label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            type="submit" 
                            className="flex-1" 
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? 'Adding...' : 'Add Item'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowAddItem(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(menu).length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No menu items found</p>
                    <Button
                      onClick={initializeData}
                      className="mt-4"
                      variant="outline"
                    >
                      Initialize Sample Data
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(menu).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item) => (
                            <Card key={item.id} className="relative">
                              <CardContent className="p-4">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-32 object-cover rounded-md mb-3"
                                  />
                                )}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium">{item.name}</h4>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEdit(item)}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => confirmDelete(item)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">R{item.price.toFixed(2)}</span>
                                    <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                      {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Prep time: {item.preparationTime} min
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab Content */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {/* User Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getUserStats().totalUsers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getUserStats().activeUsers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getUserStats().inactiveUsers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getUserStats().activeShifts}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <CardTitle>Staff Management</CardTitle>
                      <CardDescription>Manage staff accounts, roles, and permissions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setShowAddUser(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Staff Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                              Create a staff account with assigned role and permissions.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="user-name">Full Name</Label>
                              <Input
                                id="user-name"
                                value={userForm.name}
                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="user-email">Email</Label>
                              <Input
                                id="user-email"
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="user-password">Password</Label>
                              <Input
                                id="user-password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                required
                                minLength={6}
                                placeholder="Minimum 6 characters"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="user-role">Role</Label>
                              <Select value={userForm.role} onValueChange={(value: string) => setUserForm({ ...userForm, role: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cashier">Cashier</SelectItem>
                                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                                  <SelectItem value="delivery">Delivery Staff</SelectItem>
                                  <SelectItem value="stores">Stores Manager</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="user-phone">Phone</Label>
                              <Input
                                id="user-phone"
                                type="tel"
                                value={userForm.phone}
                                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button type="submit" className="flex-1">
                                Add Staff Member
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowAddUser(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" onClick={() => setShowShiftManagement(true)}>
                        <Clock className="w-4 h-4 mr-2" />
                        Manage Shifts  
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="stores">Stores</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Staff List */}
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No staff members found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <Card key={user.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-medium">{user.name}</h3>
                                  <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {user.role}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                                {user.phone && (
                                  <p className="text-sm text-gray-600 mb-1">{user.phone}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Created: {new Date(user.createdAt).toLocaleString()}
                                  {user.createdByName && ` by ${user.createdByName}`}
                                </p>
                                {user.updatedAt && user.updatedAt !== user.createdAt && (
                                  <p className="text-xs text-gray-500">
                                    Updated: {new Date(user.updatedAt).toLocaleString()}
                                    {user.updatedByName && ` by ${user.updatedByName}`}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditUser(user)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPasswordResetUser(user)}
                                >
                                  <Key className="w-3 h-3 mr-1" />
                                  Reset Password
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant={user.isActive ? "destructive" : "default"}
                                  onClick={() => toggleUserStatus(user.id, !user.isActive)}
                                >
                                  {user.isActive ? (
                                    <>
                                      <UserX className="w-3 h-3 mr-1" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Revenue insights and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" value={analyticsView} onValueChange={(value: any) => setAnalyticsView(value)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="charts">Charts</TabsTrigger>
                      <TabsTrigger value="items">Top Items</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                              {revenueAnalytics.daily.growth > 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">R{revenueAnalytics.daily.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.daily.growth > 0 ? '+' : ''}{revenueAnalytics.daily.growth.toFixed(1)}% from yesterday
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.daily.orders} orders today
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
                              {revenueAnalytics.weekly.growth > 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">R{revenueAnalytics.weekly.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.weekly.growth > 0 ? '+' : ''}{revenueAnalytics.weekly.growth.toFixed(1)}% from last week
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.weekly.orders} orders this week
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                              {revenueAnalytics.monthly.growth > 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">R{revenueAnalytics.monthly.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.monthly.growth > 0 ? '+' : ''}{revenueAnalytics.monthly.growth.toFixed(1)}% from last month
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.monthly.orders} orders this month
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">R{revenueAnalytics.yearly.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                              Total this year
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {revenueAnalytics.yearly.orders} orders this year
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="charts" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Daily Revenue Trend</CardTitle>
                            <CardDescription>Revenue over the last 7 days</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#f59e0b" 
                                    strokeWidth={2}
                                    name="Revenue (R)"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Daily Orders</CardTitle>
                            <CardDescription>Order count over the last 7 days</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="items" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Performing Menu Items</CardTitle>
                          <CardDescription>Best selling items by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {topItems.length === 0 ? (
                            <div className="text-center py-8">
                              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No sales data available</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {topItems.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{item.name}</h3>
                                      <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold">R{item.revenue.toFixed(2)}</div>
                                    <div className="text-sm text-gray-600">Revenue</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the details of this menu item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (R)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prep-time">Prep Time (min)</Label>
                  <Input
                    id="edit-prep-time"
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ingredients">Ingredients (comma-separated)</Label>
                <Input
                  id="edit-ingredients"
                  value={itemForm.ingredients}
                  onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload a new image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="edit-image-upload"
                          title="Choose image file"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('edit-image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-available"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  title="Available"
                  placeholder="Available"
                />
                <Label htmlFor="edit-available">Available</Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Updating...' : 'Update Item'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member details and role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Full Name</Label>
                <Input
                  id="edit-user-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  disabled
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-role">Role</Label>
                <Select value={userForm.role} onValueChange={(value: string) => setUserForm({ ...userForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                    <SelectItem value="delivery">Delivery Staff</SelectItem>
                    <SelectItem value="stores">Stores Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-phone">Phone</Label>
                <Input
                  id="edit-user-phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1">
                  Update Staff Member
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Password Reset Dialog */}
      {passwordResetUser && (
        <Dialog open={!!passwordResetUser} onOpenChange={() => setPasswordResetUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset password for {passwordResetUser.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1">
                  Reset Password
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setPasswordResetUser(null)
                    setNewPassword('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        onConfirm={() => deleteConfirm.item && handleDeleteItem(deleteConfirm.item.id)}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
      />

      {/* Shift Management Dialog */}
      <Dialog open={showShiftManagement} onOpenChange={setShowShiftManagement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shift Management</DialogTitle>
            <DialogDescription>
              Manage staff shifts, view active shifts, and track work hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Shift Section */}
            <Card>
              <CardHeader>
                <CardTitle>Start New Shift</CardTitle>
                <CardDescription>Create a new shift for a staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (shiftForm.staffId && shiftForm.shiftType) {
                    createShift(shiftForm.staffId, shiftForm.shiftType)
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffId">Staff Member</Label>
                      <Select value={shiftForm.staffId} onValueChange={(value: string) => setShiftForm({ ...shiftForm, staffId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter(user => user.isActive && ['cashier', 'kitchen', 'delivery', 'stores'].includes(user.role)).map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shiftType">Shift Type</Label>
                      <Select value={shiftForm.shiftType} onValueChange={(value: string) => setShiftForm({ ...shiftForm, shiftType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning Shift (7AM - 3PM)</SelectItem>
                          <SelectItem value="evening">Evening Shift (3PM - 11PM)</SelectItem>
                          <SelectItem value="full-day">Full Day (7AM - 11PM)</SelectItem>
                          <SelectItem value="custom">Custom Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={!shiftForm.staffId || !shiftForm.shiftType}>
                    <Clock className="w-4 h-4 mr-2" />
                    Start Shift
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Shifts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Shifts</CardTitle>
                <CardDescription>Currently running shifts</CardDescription>
              </CardHeader>
              <CardContent>
                {shifts.filter(shift => shift.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active shifts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shifts.filter(shift => shift.status === 'active').map(shift => (
                      <Card key={shift.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{shift.userName}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {shift.userRole}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p>Shift Type: <span className="capitalize">{shift.shiftType}</span></p>
                                <p>Started: {new Date(shift.startTime).toLocaleString()}</p>
                                {shift.expectedEndTime && (
                                  <p>Expected End: {new Date(shift.expectedEndTime).toLocaleString()}</p>
                                )}
                                <p>Duration: {Math.round((new Date().getTime() - new Date(shift.startTime).getTime()) / (1000 * 60))} minutes</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => endShift(shift.id)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              End Shift
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Shifts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Shifts</CardTitle>
                <CardDescription>
                  Last 10 completed shifts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shifts.filter(shift => shift.status === 'completed').length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed shifts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shifts
                      .filter(shift => shift.status === 'completed')
                      .slice(0, 10)
                      .map(shift => (
                      <Card key={shift.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{shift.userName}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {shift.userRole}
                                </Badge>
                                <Badge variant="secondary">
                                  Completed
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                <p>Shift Type: <span className="capitalize">{shift.shiftType}</span></p>
                                <p>Started: {new Date(shift.startTime).toLocaleString()}</p>
                                <p>Ended: {shift.endTime ? new Date(shift.endTime).toLocaleString() : 'N/A'}</p>
                                {shift.endTime && (
                                  <p className="sm:col-span-3">
                                    Duration: {Math.round((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60))} minutes
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shift Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Shift Statistics</CardTitle>
                <CardDescription>Today's shift overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {shifts.filter(shift => shift.status === 'active').length}
                    </div>
                    <p className="text-sm text-gray-600">Active Shifts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {shifts.filter(shift => {
                        const today = new Date().toDateString()
                        return new Date(shift.startTime).toDateString() === today
                      }).length}
                    </div>
                    <p className="text-sm text-gray-600">Today's Shifts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {shifts.filter(shift => shift.status === 'completed').length}
                    </div>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(
                        shifts
                          .filter(shift => shift.status === 'completed' && shift.endTime)
                          .reduce((total, shift) => {
                            const duration = (new Date(shift.endTime!).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60)
                            return total + duration
                          }, 0) / 60
                      )}h
                    </div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowShiftManagement(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}