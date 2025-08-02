import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAdminUser() {
  try {
    const adminEmail = 'admin@tiktokshopcrm.com'
    
    console.log('Testing admin user...')
    
    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        password: true,
      }
    })

    if (!admin) {
      console.log('❌ Admin user not found!')
      return
    }

    console.log('✅ Admin user found:')
    console.log('  ID:', admin.id)
    console.log('  Email:', admin.email)
    console.log('  Name:', admin.firstName, admin.lastName)
    console.log('  Role:', admin.role)
    console.log('  Is Active:', admin.isActive)

    // Test password
    const testPassword = 'Admin123!'
    const isValidPassword = await bcrypt.compare(testPassword, admin.password)
    
    console.log('  Password valid:', isValidPassword)

    if (admin.role !== 'ADMIN') {
      console.log('⚠️  Warning: User role is not ADMIN!')
    }

    if (!admin.isActive) {
      console.log('⚠️  Warning: User is not active!')
    }

    if (!isValidPassword) {
      console.log('⚠️  Warning: Password is not valid!')
    }

    if (admin.role === 'ADMIN' && admin.isActive && isValidPassword) {
      console.log('✅ Admin user is properly configured!')
    } else {
      console.log('❌ Admin user has issues!')
    }
    
  } catch (error) {
    console.error('❌ Error testing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUser() 