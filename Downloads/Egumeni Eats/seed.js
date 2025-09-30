const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Inventory = require('./models/Inventory');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data (for fresh start)
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Inventory.deleteMany({});

    // Seed test users with hashed passwords
    const users = [
      {
        email: 'admin@egumeni.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        phone: '+27123456789',
        privilegePin: '1234'
      },
      {
        email: 'cashier@egumeni.com',
        password: 'cash123',
        name: 'Cashier Jane',
        role: 'cashier',
        phone: '+27123456790'
      },
      {
        email: 'customer@egumeni.com',
        password: 'cust123',
        name: 'Customer John',
        role: 'customer',
        phone: '+27123456791'
      },
      {
        email: 'kitchen@egumeni.com',
        password: 'kitchen123',
        name: 'Kitchen Chef',
        role: 'kitchen',
        phone: '+27123456792'
      },
      {
        email: 'delivery@egumeni.com',
        password: 'delivery123',
        name: 'Delivery Driver',
        role: 'delivery',
        phone: '+27123456793'
      },
      {
        email: 'stores@egumeni.com',
        password: 'stores123',
        name: 'Stores Manager',
        role: 'stores',
        phone: '+27123456794'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();

      // Create corresponding profile
      const profile = new Profile({
        userId: user._id,
        role: user.role,
        name: user.name,
        phone: user.phone
      });
      await profile.save();

      console.log(`👤 Created ${user.role} user: ${user.email} (password: ${userData.password})`);
    }

    // Seed sample inventory items
    const inventoryItems = [
      {
        name: 'Classic Burger',
        category: 'main',
        quantity: 50,
        price: 89.99,
        description: 'Beef patty with lettuce, tomato, and cheese',
        lowStockThreshold: 10
      },
      {
        name: 'Caesar Salad',
        category: 'appetizer',
        quantity: 30,
        price: 45.00,
        description: 'Fresh romaine with Caesar dressing',
        lowStockThreshold: 5
      },
      {
        name: 'Coca Cola',
        category: 'drink',
        quantity: 100,
        price: 15.00,
        description: '500ml can',
        lowStockThreshold: 20
      },
      {
        name: 'French Fries',
        category: 'side',
        quantity: 80,
        price: 25.00,
        description: 'Crispy golden fries',
        lowStockThreshold: 15
      },
      {
        name: 'Chocolate Cake',
        category: 'dessert',
        quantity: 20,
        price: 35.00,
        description: 'Rich chocolate slice',
        lowStockThreshold: 5
      }
    ];

    for (const item of inventoryItems) {
      const inventory = new Inventory(item);
      await inventory.save();
      console.log(`📦 Created inventory item: ${item.name} (qty: ${item.quantity})`);
    }

    // Seed sample orders (optional, for testing dashboards)
    const sampleOrder = {
      userId: (await User.findOne({ role: 'customer' }))._id,
      orderNumber: await generateOrderNumber(), // Assume function exists or mock
      customerInfo: { name: 'Sample Customer', tableNumber: 'Table 5' },
      items: [
        {
          name: 'Classic Burger',
          quantity: 2,
          price: 89.99,
          total: 179.98
        },
        {
          name: 'Coca Cola',
          quantity: 2,
          price: 15.00,
          total: 30.00
        }
      ],
      subtotal: 209.98,
      tax: 21.00,
      total: 230.98,
      orderType: 'dine_in',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      status: 'delivered'
    };

    // Note: generateOrderNumber needs implementation; skip for now or add mock

    console.log('🎉 Seeding completed! Use the test credentials to login.');
    console.log('Admin: admin@egumeni.com / admin123');
    console.log('Cashier: cashier@egumeni.com / cash123');
    console.log('Customer: customer@egumeni.com / cust123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

// Mock generateOrderNumber for seed (in real, move to utils)
async function generateOrderNumber() {
  return `20240927-0001`; // Static for seed
}

seed();
