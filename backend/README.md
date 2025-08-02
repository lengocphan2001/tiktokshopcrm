# TikTok Shop CRM Backend

Professional backend for user management with admin-only user creation and comprehensive CRUD operations.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 👥 **User Management** - Complete CRUD operations for user management
- 🛡️ **Admin-Only Access** - Only admins can create and manage users
- 📊 **Pagination & Search** - Advanced filtering and pagination for user lists
- ✅ **Input Validation** - Comprehensive validation using Zod
- 🔒 **Security** - Rate limiting, CORS, and security headers
- 🗄️ **MySQL Database** - Professional database schema with Prisma ORM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/tiktokshopcrm"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=3001
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Create initial admin user**
   ```bash
   # You'll need to create an admin user manually in the database
   # or use Prisma Studio to add one
   npm run db:studio
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Documentation

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### User Management (Admin Only)

#### GET /api/users
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and email
- `role` (string): Filter by role (ADMIN/USER)
- `status` (string): Filter by status (ACTIVE/INACTIVE/SUSPENDED)

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### POST /api/users
Create a new user (admin only).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg",
  "bankAccount": "1234567890",
  "about": "About the user",
  "address": "123 Main St, City, Country",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "role": "USER",
  "status": "ACTIVE"
}
```

#### PUT /api/users/:id
Update user information.

#### DELETE /api/users/:id
Delete a user permanently.

#### PATCH /api/users/:id/deactivate
Deactivate a user (soft delete).

#### PATCH /api/users/:id/activate
Activate a previously deactivated user.

## Database Schema

### User Model
```sql
- id (String, Primary Key)
- firstName (String)
- lastName (String)
- email (String, Unique)
- phone (String, Optional)
- password (String, Hashed)
- avatar (String, Optional)
- bankAccount (String, Optional)
- about (Text, Optional)
- address (Text, Optional)
- dateOfBirth (DateTime, Optional)
- role (Enum: ADMIN/USER)
- status (Enum: ACTIVE/INACTIVE/SUSPENDED)
- isActive (Boolean)
- lastLoginAt (DateTime, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
- createdBy (String, Optional)
- updatedBy (String, Optional)
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet.js for additional security
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (admin access required)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Development

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema to database
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open Prisma Studio

### Project Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Authentication and validation middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (auth, validation)
└── index.ts         # Main server file
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

This project is licensed under the ISC License. 