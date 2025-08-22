#!/bin/bash

# Basic TikTok Shop CRM Deployment Script (No Docker)
# Domain: ninetails.site

set -e

echo "🚀 Starting basic TikTok Shop CRM deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 22.x
print_status "Installing Node.js 22.x..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
print_status "Installing MySQL..."
sudo apt install -y mysql-server mysql-client

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Certbot for SSL
print_status "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
APP_DIR="/opt/tiktokshopcrm"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
sudo chmod 755 $APP_DIR

# Copy application files
if [ -d ".git" ]; then
    print_status "Copying application files..."
    sudo rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' . $APP_DIR/
    sudo chown -R $USER:$USER $APP_DIR
else
    print_error "Please run this script from the application root directory"
    exit 1
fi

cd $APP_DIR

# Setup MySQL
print_status "Setting up MySQL..."
sudo mysql -e "CREATE DATABASE tiktokshopcrm;"
sudo mysql -e "CREATE USER 'tiktokshopcrm_user'@'localhost' IDENTIFIED BY 'your_mysql_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON tiktokshopcrm.* TO 'tiktokshopcrm_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
npm install --save-dev @types/bcryptjs @types/node
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
npm install --save-dev @types/node

# Build frontend with increased memory limit
print_status "Building frontend with increased memory limit..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Create environment file for backend
print_status "Creating backend environment file..."
cat > backend/.env << EOF
DATABASE_URL=mysql://tiktokshopcrm_user:your_mysql_password@localhost:3306/tiktokshopcrm
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://ninetails.site
EOF

# Run database migrations
print_status "Running database migrations..."
cd backend
npx prisma migrate deploy
cd ..

# Start backend with PM2
print_status "Starting backend with PM2..."
cd backend
pm2 start npm --name "tiktokshopcrm-backend" -- start
cd ..

# Start frontend with PM2 and increased memory limit
print_status "Starting frontend with PM2..."
pm2 start npm --name "tiktokshopcrm-frontend" -- start -- --max-old-space-size=4096

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/tiktokshopcrm > /dev/null << EOF
server {
    listen 80;
    server_name ninetails.site www.ninetails.site;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    client_max_body_size 10M;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/tiktokshopcrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup SSL certificate
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d ninetails.site -d www.ninetails.site --non-interactive --agree-tos --email your-email@example.com

# Setup automatic SSL renewal
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Create backup script
print_status "Creating backup script..."
sudo tee /opt/backup-tiktokshopcrm.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/tiktokshopcrm"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -h localhost -u tiktokshopcrm_user -p'your_mysql_password' tiktokshopcrm > \$BACKUP_DIR/db_\$DATE.sql

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C $APP_DIR/backend uploads/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /opt/backup-tiktokshopcrm.sh

# Setup daily backups
sudo crontab -l 2>/dev/null | { cat; echo "0 2 * * * /opt/backup-tiktokshopcrm.sh"; } | sudo crontab -

# Create update script
print_status "Creating update script..."
sudo tee /opt/update-tiktokshopcrm.sh > /dev/null << EOF
#!/bin/bash
cd $APP_DIR
git pull origin main

# Update backend
cd backend
npm install
npm install --save-dev @types/bcryptjs @types/node
npx prisma migrate deploy
pm2 restart tiktokshopcrm-backend

# Update frontend
cd ..
npm install
npm install --save-dev @types/node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
pm2 restart tiktokshopcrm-frontend

sudo systemctl restart nginx
EOF

sudo chmod +x /opt/update-tiktokshopcrm.sh

# Final status check
print_status "Performing final status check..."
sleep 10

# Check if services are running
if pm2 list | grep -q "tiktokshopcrm"; then
    print_status "✅ All services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: pm2 logs"
    exit 1
fi

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running successfully!"
else
    print_error "❌ Nginx failed to start"
    exit 1
fi

print_status "🎉 Basic deployment completed successfully!"
echo ""
print_status "Your TikTok Shop CRM is now available at: https://ninetails.site"
echo ""
print_status "Useful commands:"
echo "  - View logs: pm2 logs"
echo "  - Update application: sudo /opt/update-tiktokshopcrm.sh"
echo "  - Backup data: sudo /opt/backup-tiktokshopcrm.sh"
echo "  - Restart services: pm2 restart all"
echo "  - Check status: pm2 status"
echo ""
print_warning "Don't forget to:"
echo "  1. Update your DNS records to point ninetails.site to this server's IP"
echo "  2. Configure your firewall to allow ports 80, 443, and 22"
echo "  3. Update the passwords in backend/.env file"
echo "  4. Secure MySQL installation"
echo "  5. Set up monitoring and alerting for production use"
