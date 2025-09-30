import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { 
  Package, 
  BarChart3, 
  AlertTriangle, 
  Plus, 
  Search,
  Scan,
  FileText,
  Check,
  X,
  Edit,
  TrendingDown,
  TrendingUp,
  Calculator,
  LogOut
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  category: 'ingredients' | 'supplies' | 'beverages'
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  supplier: string
  barcode?: string
  location: string
  createdAt: string
  updatedAt: string
}

interface StockIssue {
  id: string
  orderId?: string
  requestedBy: string
  items: {
    inventoryId: string
    name: string
    quantity: number
    unitCost: number
  }[]
  purpose: 'order' | 'waste' | 'transfer' | 'adjustment'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface StockReceipt {
  id: string
  supplierId: string
  supplierName: string
  receiptNumber: string
  items: {
    inventoryId: string
    name: string
    quantity: number
    unitCost: number
    totalCost: number
    expiryDate?: string
  }[]
  totalCost: number
  receivedBy: string
  receivedAt: string
}

export default function StoresDashboard() {
  const { user, profile, logout } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [pendingIssues, setPendingIssues] = useState<StockIssue[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddItem, setShowAddItem] = useState(false)
  const [showReceiveStock, setShowReceiveStock] = useState(false)
  const [showStockCount, setShowStockCount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ingredients' as 'ingredients' | 'supplies' | 'beverages',
    unit: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitCost: 0,
    supplier: '',
    barcode: '',
    location: ''
  })

  // Stock receipt form
  const [stockReceipt, setStockReceipt] = useState({
    supplierName: '',
    receiptNumber: '',
    items: [
      {
        inventoryId: '',
        name: '',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        expiryDate: ''
      }
    ]
  })

  // Stock count data
  const [stockCount, setStockCount] = useState<{
    items: {
      inventoryId: string
      name: string
      expectedQuantity: number
      countedQuantity: number
      variance: number
      unitCost: number
      varianceValue: number
    }[]
  }>({ items: [] })

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    console.log('🚀 Initializing StoresDashboard data...')
    try {
      // Initialize sample data if needed
      await api.request('/init', { method: 'POST' })
      console.log('✅ Sample data initialized')
    } catch (error) {
      console.error('Error initializing data:', error)
    }
    
    // Fetch all data
    console.log('📦 Fetching all data...')
    await Promise.all([
      fetchInventory(),
      fetchPendingIssues(), 
      fetchLowStockItems()
    ])
    console.log('✅ All data fetched')
  }

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, selectedCategory])

  const fetchInventory = async () => {
    try {
      console.log('📦 Fetching inventory from API...')
      setLoading(true)
      const data = await api.request('/pos/inventory')
      console.log('📥 Inventory API response:', data)
      
      if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
        setInventory(data.items)
        console.log('✅ Inventory loaded successfully:', data.items.length, 'items')
        console.log('🔍 Sample item:', data.items[0])
        toast.success(`Loaded ${data.items.length} inventory items`)
      } else {
        console.warn('⚠️ No inventory items found')
        setError('No inventory items found. Please add inventory items first.')
      }
    } catch (error) {
      console.error('❌ Error fetching inventory:', error)
      setError('Failed to load inventory. Please check your connection and try again.')
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingIssues = async () => {
    try {
      const data = await api.request('/pos/inventory/issues/pending')
      setPendingIssues(data.issues || [])
    } catch (error) {
      console.error('Error fetching pending issues:', error)
    }
  }

  const fetchLowStockItems = async () => {
    try {
      const data = await api.request('/pos/inventory/low-stock')
      setLowStockItems(data.items || [])
    } catch (error) {
      console.error('Error fetching low stock items:', error)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.includes(searchTerm)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredInventory(filtered)
  }

  const createInventoryItem = async () => {
    if (!newItem.name || !newItem.unit || newItem.currentStock < 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await api.request('/pos/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem)
      })

      toast.success('Inventory item created successfully')
      setNewItem({
        name: '',
        category: 'ingredients',
        unit: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitCost: 0,
        supplier: '',
        barcode: '',
        location: ''
      })
      setShowAddItem(false)
      fetchInventory()
    } catch (error) {
      console.error('Error creating inventory item:', error)
      toast.error('Failed to create inventory item')
    } finally {
      setLoading(false)
    }
  }

  const receiveStock = async () => {
    if (!stockReceipt.supplierName || !stockReceipt.receiptNumber || stockReceipt.items.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate items
    for (const item of stockReceipt.items) {
      if (!item.inventoryId || item.quantity <= 0 || item.unitCost <= 0) {
        toast.error('Please fill in all item details')
        return
      }
    }

    setLoading(true)
    try {
      await api.request('/pos/inventory/receive', {
        method: 'POST',
        body: JSON.stringify({
          supplierName: stockReceipt.supplierName,
          receiptNumber: stockReceipt.receiptNumber,
          items: stockReceipt.items.map(item => ({
            inventoryId: item.inventoryId,
            name: item.name,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            expiryDate: item.expiryDate || undefined
          })),
          totalCost: stockReceipt.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
        })
      })

      toast.success('Stock received successfully')
      setStockReceipt({
        supplierName: '',
        receiptNumber: '',
        items: [{ inventoryId: '', name: '', quantity: 0, unitCost: 0, totalCost: 0, expiryDate: '' }]
      })
      setShowReceiveStock(false)
      fetchInventory()
      fetchLowStockItems()
    } catch (error) {
      console.error('Error receiving stock:', error)
      toast.error('Failed to receive stock')
    } finally {
      setLoading(false)
    }
  }

  const approveStockIssue = async (issueId: string) => {
    setLoading(true)
    try {
      await api.request(`/pos/inventory/issue/${issueId}/approve`, {
        method: 'POST'
      })

      toast.success('Stock issue approved successfully')
      fetchPendingIssues()
      fetchInventory()
      fetchLowStockItems()
    } catch (error) {
      console.error('Error approving stock issue:', error)
      toast.error('Failed to approve stock issue')
    } finally {
      setLoading(false)
    }
  }

  const performStockCount = async () => {
    if (stockCount.items.length === 0) {
      toast.error('Please add items to count')
      return
    }

    setLoading(true)
    try {
      // Calculate variances
      const itemsWithVariance = stockCount.items.map(item => ({
        ...item,
        variance: item.countedQuantity - item.expectedQuantity,
        varianceValue: (item.countedQuantity - item.expectedQuantity) * item.unitCost
      }))

      const totalVarianceValue = itemsWithVariance.reduce((sum, item) => sum + item.varianceValue, 0)

      await api.request('/pos/inventory/count', {
        method: 'POST',
        body: JSON.stringify({
          items: itemsWithVariance,
          totalVarianceValue,
          status: 'pending'
        })
      })

      toast.success('Stock count completed successfully')
      setStockCount({ items: [] })
      setShowStockCount(false)
      fetchInventory()
    } catch (error) {
      console.error('Error performing stock count:', error)
      toast.error('Failed to complete stock count')
    } finally {
      setLoading(false)
    }
  }

  const addStockReceiptItem = () => {
    setStockReceipt({
      ...stockReceipt,
      items: [...stockReceipt.items, {
        inventoryId: '',
        name: '',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        expiryDate: ''
      }]
    })
  }

  const updateStockReceiptItem = (index: number, field: string, value: any) => {
    console.log(`📝 Updating receipt item ${index}, field: ${field}, value:`, value)
    
    const updatedItems = stockReceipt.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          updatedItem.totalCost = updatedItem.quantity * updatedItem.unitCost
        }
        console.log(`✅ Updated item ${index}:`, updatedItem)
        return updatedItem
      }
      return item
    })
    
    const newStockReceipt = { ...stockReceipt, items: updatedItems }
    console.log('📦 New stock receipt state:', newStockReceipt)
    setStockReceipt(newStockReceipt)
  }

  const generateStockCountItems = () => {
    const items = inventory.map(item => ({
      inventoryId: item.id,
      name: item.name,
      expectedQuantity: item.currentStock,
      countedQuantity: item.currentStock, // Default to current stock
      variance: 0,
      unitCost: item.unitCost,
      varianceValue: 0
    }))
    setStockCount({ items })
  }

  return (
    <div className="min-h-screen bg-ump-light-gray">
      <div className="bg-white shadow-sm border-b border-ump-navy/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-ump-navy p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ump-navy">Stores Management</h1>
              <p className="text-ump-gray">University of Mpumalanga • {profile?.name}</p>
            </div>
            {/* UMP Brand Accent */}
            <div className="hidden md:flex space-x-1">
              <div className="w-2 h-8 bg-ump-orange rounded-full"></div>
              <div className="w-2 h-8 bg-ump-green rounded-full"></div>
              <div className="w-2 h-8 bg-ump-red rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lowStockItems.length > 0 && (
              <Badge className="bg-ump-red/10 text-ump-red border-ump-red/20 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockItems.length} Low Stock
              </Badge>
            )}
            {pendingIssues.length > 0 && (
              <Badge className="bg-ump-orange/10 text-ump-orange border-ump-orange/20 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {pendingIssues.length} Pending Issues
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="text-ump-gray hover:text-ump-navy hover:bg-ump-navy/5">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="inventory" className="w-full" onValueChange={(value) => {
          console.log('Tab changed to:', value, 'Current inventory items:', inventory.length)
          if (value === 'receive') {
            console.log('Receive tab opened, ensuring inventory is loaded...')
            if (inventory.length === 0) {
              console.log('No inventory loaded, fetching...')
              fetchInventory()
            } else {
              console.log('Inventory already loaded with', inventory.length, 'items')
            }
          }
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="receive">Receive Stock</TabsTrigger>
            <TabsTrigger value="issues">Stock Issues</TabsTrigger>
            <TabsTrigger value="count">Stock Count</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ingredients">Ingredients</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    {inventory.length} items loaded
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Manual refresh clicked')
                      fetchInventory()
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                      Create a new inventory item to track stock levels and manage supplies.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="itemName">Name *</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemCategory">Category</Label>
                      <Select 
                        value={newItem.category} 
                        onValueChange={(value: any) => setNewItem({...newItem, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ingredients">Ingredients</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemUnit">Unit *</Label>
                        <Input
                          id="itemUnit"
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                          placeholder="kg, L, pcs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemStock">Current Stock</Label>
                        <Input
                          id="itemStock"
                          type="number"
                          min="0"
                          value={newItem.currentStock}
                          onChange={(e) => setNewItem({...newItem, currentStock: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minStock">Min Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          min="0"
                          value={newItem.minStock}
                          onChange={(e) => setNewItem({...newItem, minStock: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxStock">Max Stock</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          min="0"
                          value={newItem.maxStock}
                          onChange={(e) => setNewItem({...newItem, maxStock: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="unitCost">Unit Cost (R)</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.unitCost}
                        onChange={(e) => setNewItem({...newItem, unitCost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={newItem.supplier}
                        onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                        placeholder="Supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={newItem.barcode}
                        onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                        placeholder="Barcode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                        placeholder="Storage location"
                      />
                    </div>
                    <Button onClick={createInventoryItem} className="w-full" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Item'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.barcode && (
                              <p className="text-sm text-gray-500">{item.barcode}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={item.currentStock <= item.minStock ? 'text-red-600 font-semibold' : ''}>
                            {item.currentStock} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.minStock} / {item.maxStock} {item.unit}
                        </TableCell>
                        <TableCell>R{item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.currentStock <= item.minStock ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : item.currentStock >= item.maxStock ? (
                            <Badge variant="secondary">Overstocked</Badge>
                          ) : (
                            <Badge variant="default">Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receive Stock</CardTitle>
                <div className="text-sm text-gray-600">
                  Debug: {inventory.length} inventory items loaded
                  {stockReceipt.items.length > 0 && (
                    <div className="mt-2">
                      Receipt items: {stockReceipt.items.map((item, idx) => 
                        `${idx}: ${item.inventoryId ? '✓' : '✗'} ${item.name || 'unnamed'}`
                      ).join(', ')}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      value={stockReceipt.supplierName}
                      onChange={(e) => setStockReceipt({...stockReceipt, supplierName: e.target.value})}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiptNumber">Receipt Number *</Label>
                    <Input
                      id="receiptNumber"
                      value={stockReceipt.receiptNumber}
                      onChange={(e) => setStockReceipt({...stockReceipt, receiptNumber: e.target.value})}
                      placeholder="Receipt/Invoice number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Items</h4>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        onClick={() => {
                          console.log('🔄 Refreshing inventory from receive tab')
                          fetchInventory()
                          toast.info('Refreshing inventory items...')
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        Refresh Items
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => {
                          console.log('🧪 Test fill clicked - inventory items:', inventory.length)
                          if (inventory.length > 0 && stockReceipt.items.length > 0) {
                            const firstItem = inventory[0]
                            updateStockReceiptItem(0, 'inventoryId', firstItem.id)
                            updateStockReceiptItem(0, 'name', firstItem.name)
                            updateStockReceiptItem(0, 'quantity', 10)
                            updateStockReceiptItem(0, 'unitCost', firstItem.unitCost)
                            console.log('✅ Test data filled with:', firstItem.name)
                            toast.success(`Test filled with ${firstItem.name}`)
                          } else {
                            console.log('❌ Cannot test fill - inventory:', inventory.length, 'items:', stockReceipt.items.length)
                            toast.error('No inventory items available or no receipt items to fill')
                          }
                        }}
                        variant="outline" 
                        size="sm"
                        disabled={inventory.length === 0}
                      >
                        Test Fill
                      </Button>
                      <Button type="button" onClick={addStockReceiptItem} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>

                  {stockReceipt.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Inventory Item</Label>
                        <Select 
                          key={`inventory-select-${index}-${inventory.length}`}
                          value={item.inventoryId} 
                          onValueChange={(value) => {
                            console.log('🔄 Selected inventory item:', value)
                            const selectedItem = inventory.find(inv => inv.id === value)
                            console.log('🔍 Found item:', selectedItem)
                            
                            if (selectedItem) {
                              updateStockReceiptItem(index, 'inventoryId', value)
                              updateStockReceiptItem(index, 'name', selectedItem.name)
                              // Auto-fill unit cost from inventory
                              updateStockReceiptItem(index, 'unitCost', selectedItem.unitCost)
                              console.log('✅ Updated receipt item:', { inventoryId: value, name: selectedItem.name, unitCost: selectedItem.unitCost })
                            } else {
                              console.error('❌ Item not found in inventory:', value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              inventory.length === 0 
                                ? "No items available - click refresh" 
                                : `Select from ${inventory.length} items`
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.length === 0 ? (
                              <div>
                                <SelectItem value="no-items" disabled>
                                  No inventory items found
                                </SelectItem>
                                <SelectItem value="refresh" disabled>
                                  Try refreshing the page
                                </SelectItem>
                              </div>
                            ) : (
                              inventory.map(invItem => (
                                <SelectItem key={invItem.id} value={invItem.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{invItem.name}</span>
                                    <span className="text-xs text-gray-500">
                                      Stock: {invItem.currentStock} {invItem.unit} • R{invItem.unitCost.toFixed(2)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 mt-1">
                          {inventory.length === 0 ? (
                            <span className="text-red-500">0 items available</span>
                          ) : (
                            <span className="text-green-600">{inventory.length} items available</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateStockReceiptItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Unit Cost (R)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateStockReceiptItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Cost</Label>
                        <Input
                          value={`R${item.totalCost.toFixed(2)}`}
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateStockReceiptItem(index, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-lg font-semibold">
                      Total: R{stockReceipt.items.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                    </div>
                    <Button onClick={receiveStock} disabled={loading}>
                      {loading ? 'Processing...' : 'Receive Stock'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Stock Issues ({pendingIssues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingIssues.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending stock issues</p>
                ) : (
                  <div className="space-y-4">
                    {pendingIssues.map(issue => (
                      <div key={issue.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Issue #{issue.id.slice(-8)}</h4>
                            <p className="text-sm text-gray-600">
                              Requested by: {issue.requestedBy} • {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {issue.purpose.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveStockIssue(issue.id)}
                              disabled={loading}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Items:</h5>
                          {issue.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span>{item.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="count" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Stock Count
                  {stockCount.items.length === 0 && (
                    <Button onClick={generateStockCountItems} variant="outline">
                      <Calculator className="w-4 h-4 mr-2" />
                      Generate Count Sheet
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stockCount.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Click "Generate Count Sheet" to start a stock count
                  </p>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Expected</TableHead>
                          <TableHead>Counted</TableHead>
                          <TableHead>Variance</TableHead>
                          <TableHead>Value Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockCount.items.map((item, index) => {
                          const variance = item.countedQuantity - item.expectedQuantity
                          const varianceValue = variance * item.unitCost
                          
                          return (
                            <TableRow key={item.inventoryId}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.expectedQuantity}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.countedQuantity}
                                  onChange={(e) => {
                                    const newItems = [...stockCount.items]
                                    newItems[index].countedQuantity = parseFloat(e.target.value) || 0
                                    setStockCount({ items: newItems })
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center gap-1 ${variance === 0 ? 'text-gray-500' : variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {variance > 0 ? <TrendingUp className="w-4 h-4" /> : variance < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                                  {variance > 0 ? '+' : ''}{variance}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={varianceValue === 0 ? 'text-gray-500' : varianceValue > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {varianceValue > 0 ? '+' : ''}R{varianceValue.toFixed(2)}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-semibold">
                        Total Variance Value: R{stockCount.items.reduce((sum, item) => 
                          sum + ((item.countedQuantity - item.expectedQuantity) * item.unitCost), 0
                        ).toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setStockCount({ items: [] })}
                        >
                          Clear
                        </Button>
                        <Button onClick={performStockCount} disabled={loading}>
                          {loading ? 'Submitting...' : 'Submit Count'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}