# Backend Setup Guide

This guide will help you set up the TikTok Shop CRM backend with MySQL database.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

## Step-by-Step Setup

### 1. Database Setup

First, create a MySQL database:

```sql
CREATE DATABASE tiktokshopcrm;
CREATE USER 'tiktokshopcrm'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tiktokshopcrm.* TO 'tiktokshopcrm'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DATABASE_URL="mysql://tiktokshopcrm:your_password@localhost:3306/tiktokshopcrm"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

Generate Prisma client and push schema to database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Create Admin User

Create the initial admin user:

```bash
npm run create:admin
```

This will create an admin user with:
- **Email**: admin@tiktokshopcrm.com
- **Password**: Admin123!

⚠️ **Important**: Change the password after first login!

### 6. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

## API Testing

### 1. Login as Admin

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tiktokshopcrm.com",
    "password": "Admin123!"
  }'
```

### 2. Create a New User (Admin Only)

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "USER",
    "status": "ACTIVE"
  }'
```

### 3. Get All Users (Admin Only)

```bash
curl -X GET "http://localhost:3001/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Database Schema

The backend uses the following MySQL schema:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,
  first_name VARCHAR(191) NOT NULL,
  last_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  phone VARCHAR(191),
  password VARCHAR(191) NOT NULL,
  avatar VARCHAR(191),
  bank_account VARCHAR(191),
  about TEXT,
  address TEXT,
  date_of_birth DATETIME(3),
  role ENUM('ADMIN', 'USER') DEFAULT 'USER',
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  is_active BOOLEAN DEFAULT true,
  last_login_at DATETIME(3),
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_by VARCHAR(191),
  updated_by VARCHAR(191)
);
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet.js for additional security
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Prisma Generation Error**
   - Run `npm run db:generate` again
   - Check if schema.prisma is valid

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using the port

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token expiration

### Useful Commands

```bash
# View database with Prisma Studio
npm run db:studio

# Reset database (WARNING: This will delete all data)
npx prisma db push --force-reset

# Check Prisma schema
npx prisma validate

# Generate Prisma client
npm run db:generate
```

## Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Configure production database URL

2. **Database**
   - Use production MySQL instance
   - Set up proper backups
   - Configure connection pooling

3. **Security**
   - Use HTTPS
   - Configure CORS for production domains
   - Set up proper rate limiting
   - Use environment-specific secrets

4. **Monitoring**
   - Set up logging
   - Monitor database performance
   - Track API usage

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation in README.md
3. Check the logs for error details 