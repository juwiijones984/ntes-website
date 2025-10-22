// Decrement inventory stock
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
      updatedAt: Timestamp.now()
    })

    return newStock
  },

  // Add new inventory item
  addInventoryItem: async (itemData: any) => {
    const docRef = doc(collections.inventory)
    await setDoc(docRef, {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return docRef.id
  },

  // Update inventory item
  updateInventoryItem: async (itemId: string, updates: any) => {
    const itemRef = doc(collections.inventory, itemId)
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
  },

  // Delete inventory item
  deleteInventoryItem: async (itemId: string) => {
    const itemRef = doc(collections.inventory, itemId)
    await deleteDoc(itemRef)
  },

  // Get inventory item by ID
  getInventoryItem: async (itemId: string) => {
    const itemRef = doc(collections.inventory, itemId)
    const itemSnap = await getDoc(itemRef)
    return itemSnap.exists() ? { id: itemSnap.id, ...itemSnap.data() } : null
  }
