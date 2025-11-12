// src/utils/firebase/firestore.tsx

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  limit
} from 'firebase/firestore'
import { db } from './config'

// Define your Firestore collections here
export const collections = {
  // Central inventory (managed by Stores Person)
  centralInventory: collection(db, 'central_inventory'),

  // Shop-specific inventories (managed by supervisors)
  shopInventory: (shopId: string) => collection(db, `shops/${shopId}/inventory`),

  // Stock requests (Kitchen → Supervisor → Admin → Stores Person)
  stockRequests: collection(db, 'stock_requests'),

  // Stock transfers (Central → Shop)
  stockTransfers: collection(db, 'stock_transfers'),

  // User roles and permissions
  userRoles: collection(db, 'user_roles'),
  userPermissions: collection(db, 'user_permissions'),

  // Audit logs and transaction history
  auditTrail: collection(db, 'audit_trail'),
  inventoryTransactions: collection(db, 'inventory_transactions'),

  // Legacy collections (for backward compatibility)
  inventory: collection(db, 'inventory'),
  menu: collection(db, 'menu'),
  users: collection(db, 'users'),
  orders: collection(db, 'orders'),
  recipes: collection(db, 'recipes'),
  inventoryRequests: collection(db, 'inventory_requests'),
  inventoryUsage: collection(db, 'inventory_usage'),
  stockIssues: collection(db, 'inventory_issues'),
  stores: collection(db, 'stores'),
  transactions: collection(db, 'transactions'),
}

// Main Firestore operations object
export const firestoreService = {
  // ✅ Decrement inventory stock
  decrementStock: async (inventoryId: string, quantity: number) => {
    const inventoryRef = doc(collections.inventory, inventoryId)
    const inventorySnap = await getDoc(inventoryRef)

    if (!inventorySnap.exists()) {
      throw new Error('Inventory item not found')
    }

    const currentStock = inventorySnap.data().currentStock || 0
    const newStock = Math.max(0, currentStock - quantity)

    await updateDoc(inventoryRef, {
      currentStock: newStock,
      updatedAt: Timestamp.now(),
    })

    return newStock
  },

  // ✅ Add new inventory item
  addInventoryItem: async (itemData: any) => {
    const docRef = doc(collections.inventory)
    await setDoc(docRef, {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      storeId: itemData.storeId || null, // null for shared inventory
    })
    return docRef.id
  },

  // ✅ Update inventory item
  updateInventoryItem: async (itemId: string, updates: any) => {
    const itemRef = doc(collections.inventory, itemId)
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // ✅ Delete inventory item
  deleteInventoryItem: async (itemId: string) => {
    const itemRef = doc(collections.inventory, itemId)
    await deleteDoc(itemRef)
  },

  // ✅ Get inventory item by ID
  getInventoryItem: async (itemId: string) => {
    const itemRef = doc(collections.inventory, itemId)
    const itemSnap = await getDoc(itemRef)
    return itemSnap.exists() ? { id: itemSnap.id, ...itemSnap.data() } : null
  },
}

// Inventory Operations
export const inventoryOperations = {
  // Get all inventory items
  getAllInventory: async () => {
    const q = query(collections.inventory, orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get inventory items for a specific store (including shared items)
  getInventoryForStore: async (storeId: string) => {
    // Get store-specific inventory
    const storeQuery = query(collections.inventory, where('storeId', '==', storeId), orderBy('name'))
    const storeSnapshot = await getDocs(storeQuery)
    const storeItems = storeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Get shared inventory (storeId is null)
    const sharedQuery = query(collections.inventory, where('storeId', '==', null), orderBy('name'))
    const sharedSnapshot = await getDocs(sharedQuery)
    const sharedItems = sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Combine and return
    return [...storeItems, ...sharedItems]
  },

  // Get inventory items for a specific store (store-specific only, no shared items)
  getStoreSpecificInventory: async (storeId: string) => {
    const q = query(collections.inventory, where('storeId', '==', storeId), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get central inventory (managed by Stores Person)
  getCentralInventory: async () => {
    const q = query(collections.centralInventory, orderBy('itemName'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get shop-specific inventory
  getShopInventory: async (shopId: string) => {
    const q = query(collections.shopInventory(shopId), orderBy('itemName'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get all stock requests (for Stores Person/Admin)
  getAllStockRequests: async () => {
    const q = query(collections.stockRequests, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get stock requests for a specific shop
  getShopStockRequests: async (shopId: string) => {
    const q = query(collections.stockRequests, where('shopId', '==', shopId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get stock transfers
  getStockTransfers: async (shopId?: string) => {
    let q = query(collections.stockTransfers, orderBy('transferDate', 'desc'))
    if (shopId) {
      q = query(collections.stockTransfers, where('toShopId', '==', shopId), orderBy('transferDate', 'desc'))
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Create stock request (Kitchen → Supervisor)
  createStockRequest: async (requestData: {
    shopId: string
    requestedBy: string
    requestedByName: string
    items: Array<{
      itemId: string
      itemName: string
      quantity: number
      unit: string
      reason: string
    }>
    priority: 'low' | 'medium' | 'high' | 'urgent'
    notes?: string
  }) => {
    const docRef = await addDoc(collections.stockRequests, {
      ...requestData,
      status: 'pending_supervisor',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return docRef.id
  },

  // Approve stock request (Supervisor → Admin)
  approveStockRequest: async (requestId: string, approvedBy: string, approvedByName: string, notes?: string) => {
    await updateDoc(doc(collections.stockRequests, requestId), {
      status: 'pending_admin',
      supervisorApprovedBy: approvedBy,
      supervisorApprovedByName: approvedByName,
      supervisorApprovedAt: Timestamp.now(),
      supervisorNotes: notes,
      updatedAt: Timestamp.now()
    })
  },

  // Final approve stock request (Admin → Stores Person)
  finalApproveStockRequest: async (requestId: string, approvedBy: string, approvedByName: string, notes?: string) => {
    await updateDoc(doc(collections.stockRequests, requestId), {
      status: 'approved',
      adminApprovedBy: approvedBy,
      adminApprovedByName: approvedByName,
      adminApprovedAt: Timestamp.now(),
      adminNotes: notes,
      updatedAt: Timestamp.now()
    })
  },

  // Issue stock from central to shop
  issueStockToShop: async (transferData: {
    requestId: string
    fromCentral: boolean
    toShopId: string
    toShopName: string
    issuedBy: string
    issuedByName: string
    items: Array<{
      itemId: string
      itemName: string
      quantity: number
      unit: string
      unitCost: number
    }>
  }) => {
    const docRef = await addDoc(collections.stockTransfers, {
      ...transferData,
      transferDate: Timestamp.now(),
      status: 'completed'
    })

    // Update central inventory (deduct allocated amounts)
    for (const item of transferData.items) {
      const centralItemRef = doc(collections.centralInventory, item.itemId)
      const centralItemSnap = await getDoc(centralItemRef)

      if (centralItemSnap.exists()) {
        const currentData = centralItemSnap.data()
        const currentAllocated = currentData.allocatedToShops || {}
        const currentShopAllocation = currentAllocated[transferData.toShopId] || 0

        await updateDoc(centralItemRef, {
          [`allocatedToShops.${transferData.toShopId}`]: currentShopAllocation + item.quantity,
          totalStock: currentData.totalStock - item.quantity,
          updatedAt: Timestamp.now()
        })
      }
    }

    return docRef.id
  },

  // Record stock usage in shop
  recordShopStockUsage: async (usageData: {
    shopId: string
    itemId: string
    quantity: number
    unit: string
    usedBy: string
    usedByName: string
    reason: 'sale' | 'waste' | 'spoilage' | 'other'
    orderId?: string
    notes?: string
  }) => {
    // Update shop inventory
    const shopItemRef = doc(collections.shopInventory(usageData.shopId), usageData.itemId)
    const shopItemSnap = await getDoc(shopItemRef)

    if (shopItemSnap.exists()) {
      const currentData = shopItemSnap.data()
      await updateDoc(shopItemRef, {
        remaining: currentData.remaining - usageData.quantity,
        used: (currentData.used || 0) + usageData.quantity,
        lastUpdated: Timestamp.now()
      })
    }

    // Record usage in audit trail
    await addDoc(collections.auditTrail, {
      ...usageData,
      type: 'stock_usage',
      timestamp: Timestamp.now()
    })
  },

  // Transfer inventory between stores
  transferInventory: async (itemId: string, fromStoreId: string | null, toStoreId: string, quantity: number, transferredBy: string, transferredByName: string) => {
    const itemRef = doc(collections.inventory, itemId)
    const itemSnap = await getDoc(itemRef)

    if (!itemSnap.exists()) {
      throw new Error('Inventory item not found')
    }

    const itemData = itemSnap.data()
    const currentStock = itemData.currentStock || 0

    if (currentStock < quantity) {
      throw new Error('Insufficient stock for transfer')
    }

    // Create new inventory entry for destination store
    const newItemData = {
      ...itemData,
      storeId: toStoreId,
      currentStock: quantity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const newItemRef = doc(collections.inventory)
    await setDoc(newItemRef, newItemData)

    // Update source inventory
    await updateDoc(itemRef, {
      currentStock: currentStock - quantity,
      updatedAt: Timestamp.now(),
    })

    // Log audit trail
    await auditTrailOperations.logAuditEvent({
      action: 'transfer',
      itemId,
      itemName: itemData.name,
      fromStoreId,
      toStoreId,
      quantity,
      performedBy: transferredBy,
      performedByName: transferredByName,
      storeId: fromStoreId || 'central',
    })

    return newItemRef.id
  },

  // Get inventory items by store
  getInventoryByStore: async (storeId: string) => {
    const q = query(collections.inventory, where('storeId', '==', storeId), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get shared inventory (storeId is null)
  getSharedInventory: async () => {
    const q = query(collections.inventory, where('storeId', '==', null), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get inventory requests
  getInventoryRequests: async () => {
    const q = query(collections.inventoryRequests, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Create inventory request
  createInventoryRequest: async (requestData: any) => {
    const docRef = await addDoc(collections.inventoryRequests, {
      ...requestData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Approve inventory request
  approveInventoryRequest: async (requestId: string, approvedBy: string, approvedByName: string) => {
    await updateDoc(doc(collections.inventoryRequests, requestId), {
      status: 'approved',
      approvedBy,
      approvedByName,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  // Reject inventory request
  rejectInventoryRequest: async (requestId: string, rejectedBy: string, rejectedByName: string) => {
    await updateDoc(doc(collections.inventoryRequests, requestId), {
      status: 'rejected',
      rejectedBy,
      rejectedByName,
      rejectedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  // Real-time inventory changes
  onInventoryChange: (callback: (items: any[]) => void) => {
    const q = query(collections.inventory, orderBy('name'))
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(items)
    })
  },

  // Decrement stock (alias for firestoreService.decrementStock)
  decrementStock: firestoreService.decrementStock,

  // Inventory Usage Operations
  recordInventoryUsage: async (usageData: any) => {
    try {
      await addDoc(collection(db, "inventoryUsage"), {
        ...usageData,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error recording inventory usage:", error);
      throw error;
    }
  },

  getInventoryUsageHistory: async () => {
    try {
      const usageQuery = query(collection(db, "inventoryUsage"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(usageQuery);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching usage history:", error);
      throw error;
    }
  },

  // Get usage statistics
  getUsageStatistics: async (startDate?: Date, endDate?: Date) => {
    let q = query(collections.inventoryUsage, orderBy('createdAt', 'desc'))

    if (startDate && endDate) {
      q = query(
        collections.inventoryUsage,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    const usageRecords = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        inventoryId: data.inventoryId || '',
        quantity: data.quantity || 0,
        reason: data.reason || '',
        recordedBy: data.recordedBy || '',
        recordedByName: data.recordedByName || '',
        notes: data.notes || '',
        type: data.type || 'manual',
        createdAt: data.createdAt
      }
    })

    // Calculate statistics
    const stats = {
      totalRecords: usageRecords.length,
      totalQuantity: usageRecords.reduce((sum, record) => sum + record.quantity, 0),
      byReason: {} as Record<string, number>,
      byItem: {} as Record<string, number>,
      recentActivity: usageRecords.slice(0, 10)
    }

    usageRecords.forEach(record => {
      // Group by reason
      stats.byReason[record.reason] = (stats.byReason[record.reason] || 0) + record.quantity

      // Group by item
      stats.byItem[record.inventoryId] = (stats.byItem[record.inventoryId] || 0) + record.quantity
    })

    return stats
  },

  // Stock Issues Operations
  reportStockIssue: async (issueData: {
    inventoryId: string
    itemName: string
    issueType: 'low_stock' | 'out_of_stock' | 'damaged' | 'expired' | 'other'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    reportedBy: string
    reportedByName: string
    currentStock?: number
    minimumStock?: number
  }) => {
    const docRef = await addDoc(collections.stockIssues, {
      ...issueData,
      status: 'reported',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  getStockIssues: async (status?: string) => {
    let q = query(collections.stockIssues, orderBy('timestamp', 'desc'))

    if (status) {
      q = query(collections.stockIssues, where('status', '==', status), orderBy('timestamp', 'desc'))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Handle both timestamp formats (serverTimestamp and regular timestamp)
        timestamp: data.timestamp || data.createdAt,
        // Ensure all fields are properly mapped
        itemId: data.itemId || data.inventoryId,
        itemName: data.itemName || 'Unknown Item',
        issueType: data.issueType || 'other',
        description: data.description || '',
        reportedBy: data.reportedBy || '',
        reportedByName: data.reportedByName || 'Unknown',
        kitchenId: data.kitchenId || '',
        status: data.status || 'pending'
      }
    })
  },

  updateStockIssueStatus: async (issueId: string, status: string, updatedBy: string, updatedByName: string, notes?: string) => {
    await updateDoc(doc(collections.stockIssues, issueId), {
      status,
      updatedBy,
      updatedByName,
      updatedAt: Timestamp.now(),
      ...(notes && { resolutionNotes: notes })
    })
  },
}

// Order Operations
export const orderOperations = {
  // Create new order
  createOrder: async (orderData: any) => {
    const docRef = await addDoc(collections.orders, {
      ...orderData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      // Ensure all required fields are present
      customer_id: orderData.customer_id,
      customer_name: orderData.customer_name || 'Customer',
      customer_email: orderData.customer_email || '',
      items: orderData.items || [],
      status: orderData.status || 'pending',
      total_amount: orderData.total_amount || 0,
      payment_status: orderData.payment_status || 'pending',
      order_type: orderData.order_type || 'dine-in',
      estimated_time: orderData.estimated_time || 15,
      storeId: orderData.storeId || null
    })
    return docRef.id
  },

  // Get active orders (pending, preparing, ready)
  getActiveOrders: async () => {
    const q = query(
      collections.orders,
      where('status', 'in', ['pending', 'preparing', 'ready']),
      orderBy('created_at', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get completed orders
  getCompletedOrders: async () => {
    const q = query(
      collections.orders,
      where('status', 'in', ['delivered', 'cancelled']),
      orderBy('created_at', 'desc'),
      limit(50)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get user orders
  getUserOrders: async (customerId: string) => {
    const q = query(
      collections.orders,
      where('customer_id', '==', customerId),
      orderBy('created_at', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        customer_id: data.customer_id || customerId,
        customer_name: data.customer_name || 'Customer',
        customer_email: data.customer_email || '',
        items: Array.isArray(data.items) ? data.items : [],
        status: data.status || 'pending',
        total_amount: typeof data.total_amount === 'number' ? data.total_amount : 0,
        payment_status: data.payment_status || 'pending',
        order_type: data.order_type || 'dine-in',
        table_number: data.table_number,
        delivery_address: data.delivery_address,
        special_instructions: data.special_instructions,
        created_at: data.created_at,
        estimated_time: typeof data.estimated_time === 'number' ? data.estimated_time : 15,
        storeId: data.storeId || null
      }
    })
  },

  // Get orders by store
  getOrdersByStore: async (storeId: string) => {
    const q = query(
      collections.orders,
      where('storeId', '==', storeId),
      orderBy('created_at', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Update order status
  updateOrderStatus: async (orderId: string, newStatus: string, updatedBy?: string, updatedByName?: string) => {
    const updateData: any = {
      status: newStatus,
      updated_at: Timestamp.now(),
    }

    if (updatedBy && updatedByName) {
      updateData.updatedBy = updatedBy
      updateData.updatedByName = updatedByName
    }

    await updateDoc(doc(collections.orders, orderId), updateData)

    // Log audit trail for status changes
    if (updatedBy && updatedByName) {
      await auditTrailOperations.logAuditEvent({
        action: 'order_status_update',
        orderId,
        newStatus,
        performedBy: updatedBy,
        performedByName: updatedByName,
        storeId: 'system', // Will be updated when order data is available
      })
    }
  },
}

// Recipe Operations
export const recipeOperations = {
  // Get recipe by menu item ID
  getRecipe: async (menuItemId: string) => {
    const q = query(collections.recipes, where('menuItemId', '==', menuItemId))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  },
}

// Menu Operations
export const menuOperations = {
  // Get menu items by store
  getMenuByStore: async (storeId: string) => {
    const q = query(collections.menu, where('storeId', '==', storeId), orderBy('category'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get shared menu items (storeId is null)
  getSharedMenu: async () => {
    const q = query(collections.menu, where('storeId', '==', null), orderBy('category'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Create menu item
  createMenuItem: async (menuData: any) => {
    const docRef = await addDoc(collections.menu, {
      ...menuData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      storeId: menuData.storeId || null, // null for shared items
    })
    return docRef.id
  },

  // Update menu item
  updateMenuItem: async (itemId: string, updates: any) => {
    const itemRef = doc(collections.menu, itemId)
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },
}

// Store Operations
export const storeOperations = {
  // Create new store
  createStore: async (storeData: any) => {
    const docRef = await addDoc(collections.stores, {
      ...storeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Get all stores
  getAllStores: async () => {
    const q = query(collections.stores, orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get store by ID
  getStore: async (storeId: string) => {
    const docRef = doc(collections.stores, storeId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },

  // Update store
  updateStore: async (storeId: string, updates: any) => {
    const storeRef = doc(collections.stores, storeId)
    await updateDoc(storeRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete store
  deleteStore: async (storeId: string) => {
    const storeRef = doc(collections.stores, storeId)
    await deleteDoc(storeRef)
  },
}

// Transaction Operations
export const transactionOperations = {
  // Record transaction
  recordTransaction: async (transactionData: any) => {
    const docRef = await addDoc(collections.transactions, {
      ...transactionData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Get transactions by store
  getTransactionsByStore: async (storeId: string, startDate?: Date, endDate?: Date) => {
    let q = query(collections.transactions, where('storeId', '==', storeId), orderBy('createdAt', 'desc'))

    if (startDate && endDate) {
      q = query(
        collections.transactions,
        where('storeId', '==', storeId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get transactions by order
  getTransactionsByOrder: async (orderId: string) => {
    const q = query(collections.transactions, where('orderId', '==', orderId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
}

// Audit Trail Operations
export const auditTrailOperations = {
  // Log audit event
  logAuditEvent: async (auditData: any) => {
    const docRef = await addDoc(collections.auditTrail, {
      ...auditData,
      timestamp: Timestamp.now(),
    })
    return docRef.id
  },

  // Get audit trail for store
  getAuditTrailForStore: async (storeId: string, startDate?: Date, endDate?: Date) => {
    let q = query(collections.auditTrail, where('storeId', '==', storeId), orderBy('timestamp', 'desc'))

    if (startDate && endDate) {
      q = query(
        collections.auditTrail,
        where('storeId', '==', storeId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Get audit trail for item
  getAuditTrailForItem: async (itemId: string, startDate?: Date, endDate?: Date) => {
    let q = query(collections.auditTrail, where('itemId', '==', itemId), orderBy('timestamp', 'desc'))

    if (startDate && endDate) {
      q = query(
        collections.auditTrail,
        where('itemId', '==', itemId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
}
