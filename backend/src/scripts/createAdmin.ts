import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const adminEmail = 'admin@tiktokshopcrm.com'
    const adminPassword = 'Admin123!'
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true,
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 User ID:', admin.id)
    console.log('\n⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 