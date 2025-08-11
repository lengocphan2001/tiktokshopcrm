#!/bin/bash

# TikTok Shop CRM Deployment Script
# Domain: ninetails.site

set -e

echo "🚀 Starting TikTok Shop CRM deployment..."

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

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose

# Start and enable Docker
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Create application directory
APP_DIR="/opt/tiktokshopcrm"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or copy application files
if [ -d ".git" ]; then
    print_status "Copying application files..."
    cp -r . $APP_DIR/
else
    print_error "Please run this script from the application root directory"
    exit 1
fi

cd $APP_DIR

# Create environment file
print_status "Creating environment file..."
if [ ! -f "deployment/.env" ]; then
    cp deployment/env.example deployment/.env
    print_warning "Please edit deployment/.env with your actual values before continuing"
    print_warning "Press Enter when you're ready to continue..."
    read
fi

# Build and start Docker containers
print_status "Building and starting Docker containers..."
cd deployment
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/tiktokshopcrm
sudo ln -sf /etc/nginx/sites-available/tiktokshopcrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup SSL certificate with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d ninetails.site -d www.ninetails.site --non-interactive --agree-tos --email your-email@example.com

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Create systemd service for auto-restart
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/tiktokshopcrm.service > /dev/null <<EOF
[Unit]
Description=TikTok Shop CRM
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR/deployment
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable tiktokshopcrm.service
sudo systemctl start tiktokshopcrm.service

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/tiktokshopcrm > /dev/null <<EOF
$APP_DIR/deployment/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Create backup script
print_status "Creating backup script..."
sudo tee /opt/backup-tiktokshopcrm.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/tiktokshopcrm"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup database
docker exec tiktokshopcrm_postgres pg_dump -U tiktokshopcrm_user tiktokshopcrm > \$BACKUP_DIR/db_\$DATE.sql

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
sudo tee /opt/update-tiktokshopcrm.sh > /dev/null <<EOF
#!/bin/bash
cd $APP_DIR
git pull origin main
cd deployment
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sudo systemctl restart nginx
EOF

sudo chmod +x /opt/update-tiktokshopcrm.sh

# Final status check
print_status "Performing final status check..."
sleep 10

# Check if services are running
if docker ps | grep -q "tiktokshopcrm"; then
    print_status "✅ All services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running successfully!"
else
    print_error "❌ Nginx failed to start"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
echo ""
print_status "Your TikTok Shop CRM is now available at: https://ninetails.site"
echo ""
print_status "Useful commands:"
echo "  - View logs: cd $APP_DIR/deployment && docker-compose logs -f"
echo "  - Update application: sudo /opt/update-tiktokshopcrm.sh"
echo "  - Backup data: sudo /opt/backup-tiktokshopcrm.sh"
echo "  - Restart services: sudo systemctl restart tiktokshopcrm"
echo "  - Check status: sudo systemctl status tiktokshopcrm"
echo ""
print_warning "Don't forget to:"
echo "  1. Update your DNS records to point ninetails.site to this server's IP"
echo "  2. Configure your firewall to allow ports 80, 443, and 22"
echo "  3. Set up monitoring and alerting for production use"
