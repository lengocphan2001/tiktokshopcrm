# TikTok Shop API Integration

This document describes the TikTok Shop API integration that has been added to the TikTok Shop CRM project.

## Features

### Admin-Only Access
- All TikTok Shop features are restricted to admin users only
- Non-admin users will see a 403 Forbidden error when trying to access these features

### Dashboard Overview
- **Shop Statistics**: Total products, orders, revenue, and currency
- **Recent Orders**: Latest 5 orders with status and payment information
- **Top Products**: Best-performing products with stock levels
- **Connection Status**: Real-time API connection monitoring

### Product Management
- **List Products**: View all products with pagination
- **Create Products**: Add new products with images, pricing, and inventory
- **Edit Products**: Update product details, pricing, and stock levels
- **Delete Products**: Remove products from the shop
- **Product Details**: SKU, category, status, and stock management

### Order Management
- **List Orders**: View all orders with customer information
- **Order Details**: Complete order information including items and shipping
- **Status Updates**: Update order status (Pending, Confirmed, Shipped, Delivered, etc.)
- **Customer Information**: Customer details and shipping addresses
- **Payment Status**: Track payment status for each order

## Backend Implementation

### API Routes
All TikTok Shop endpoints are prefixed with `/api/tiktok-shop`:

- `GET /api/tiktok-shop/test-connection` - Test API connection
- `GET /api/tiktok-shop/stats` - Get shop statistics
- `GET /api/tiktok-shop/products` - List products
- `GET /api/tiktok-shop/products/:id` - Get product details
- `POST /api/tiktok-shop/products` - Create product
- `PUT /api/tiktok-shop/products/:id` - Update product
- `DELETE /api/tiktok-shop/products/:id` - Delete product
- `GET /api/tiktok-shop/orders` - List orders
- `GET /api/tiktok-shop/orders/:id` - Get order details
- `PUT /api/tiktok-shop/orders/:id/status` - Update order status

### Authentication
- All endpoints require JWT authentication
- Admin role verification is enforced on all endpoints
- Non-admin users receive 403 Forbidden responses

### Error Handling
- Comprehensive error handling for API failures
- Connection status monitoring
- User-friendly error messages

## Frontend Implementation

### Pages
- `/dashboard/tiktok-shop` - Main dashboard with statistics
- `/dashboard/tiktok-shop/products` - Product management
- `/dashboard/tiktok-shop/orders` - Order management

### Components
- **Dashboard Overview**: Statistics cards and navigation
- **Product Management**: CRUD operations with forms
- **Order Management**: Order listing and status updates
- **Status Indicators**: Color-coded status chips
- **Currency Formatting**: Proper currency display

### Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Automatic data refresh
- **Pagination**: Handle large datasets
- **Search & Filter**: Product and order filtering
- **Status Management**: Visual status indicators

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# TikTok Shop API Configuration
TIKTOK_SHOP_APP_KEY="your-tiktok-shop-app-key"
TIKTOK_SHOP_APP_SECRET="your-tiktok-shop-app-secret"
TIKTOK_SHOP_ACCESS_TOKEN="your-tiktok-shop-access-token"
TIKTOK_SHOP_ID="your-tiktok-shop-id"
TIKTOK_SHOP_BASE_URL="https://open-api.tiktokglobalshop.com"
```

### API Credentials
To get TikTok Shop API credentials:

1. Register as a TikTok Shop developer
2. Create a new application
3. Generate API keys and access tokens
4. Configure your shop ID
5. Set up webhook endpoints (if needed)

## Installation

### Backend Dependencies
The following packages have been added to `backend/package.json`:

```json
{
  "axios": "^1.6.0",
  "crypto": "^1.0.1"
}
```

### Installation Steps
1. Install new dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Update your environment variables with TikTok Shop API credentials

3. Restart the backend server:
   ```bash
   npm run dev
   ```

## Usage

### For Admins
1. Navigate to the TikTok Shop section in the dashboard
2. Check the connection status
3. View shop statistics and recent activity
4. Manage products and orders as needed

### For Non-Admins
- TikTok Shop features are not visible in the navigation
- Any direct access attempts will show access denied messages

## Security Considerations

### API Security
- All API calls are authenticated with JWT tokens
- Admin role verification on all endpoints
- Rate limiting applied to prevent abuse
- Secure signature generation for TikTok Shop API calls

### Data Protection
- Sensitive API credentials stored in environment variables
- No hardcoded credentials in the codebase
- Proper error handling without exposing sensitive information

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check your TikTok Shop API credentials
   - Verify the API base URL is correct
   - Ensure your access token is valid and not expired

2. **403 Forbidden Errors**
   - Verify the user has admin privileges
   - Check JWT token validity
   - Ensure proper authentication headers

3. **Product/Order Not Found**
   - Verify the TikTok Shop ID is correct
   - Check if the item exists in your TikTok Shop
   - Ensure proper API permissions

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## API Documentation

For detailed TikTok Shop API documentation, refer to the official TikTok Shop API documentation at:
https://developers.tiktok.com/doc/tiktok-shop-api

## Support

If you encounter issues with the TikTok Shop integration:

1. Check the browser console for frontend errors
2. Check the backend logs for API errors
3. Verify your TikTok Shop API credentials
4. Test the API connection using the test endpoint
5. Contact the development team with specific error messages
