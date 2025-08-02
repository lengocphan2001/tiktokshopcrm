import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activateAdminUser() {
  try {
    const adminEmail = 'admin@tiktokshopcrm.com'
    
    console.log('Activating admin user...')
    
    // Find and activate admin user
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        isActive: true,
        status: 'ACTIVE'
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

    console.log('✅ Admin user activated successfully!')
    console.log('  ID:', admin.id)
    console.log('  Email:', admin.email)
    console.log('  Name:', admin.firstName, admin.lastName)
    console.log('  Role:', admin.role)
    console.log('  Is Active:', admin.isActive)
    console.log('  Status:', admin.status)
    
  } catch (error) {
    console.error('❌ Error activating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateAdminUser() 