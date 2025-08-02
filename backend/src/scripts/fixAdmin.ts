import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminUser() {
  try {
    const adminEmail = 'admin@tiktokshopcrm.com'
    
    console.log('Fixing admin user...')
    
    // First, let's see what's in the database
    const currentAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        status: true,
      }
    })

    console.log('Current admin state:', currentAdmin)
    
    // Update admin user with correct settings
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        isActive: true,
        status: 'ACTIVE',
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        status: true,
      }
    })

    console.log('✅ Admin user fixed successfully!')
    console.log('Updated admin state:', updatedAdmin)
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminUser() 