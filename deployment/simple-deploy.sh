#!/bin/bash

# Simple TikTok Shop CRM Deployment
# Run this from the project root directory

set -e

echo "🚀 Simple TikTok Shop CRM Deployment"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "deployment" ]; then
    print_error "Please run this script from the project root directory (where backend/ and deployment/ folders are located)"
    exit 1
fi

# Check if .env exists
if [ ! -f "deployment/.env" ]; then
    print_warning "Environment file not found. Creating from template..."
    cp deployment/env.example deployment/.env
    print_warning "Please edit deployment/.env with your actual values before continuing"
    print_warning "Press Enter when you're ready to continue..."
    read
fi

# Install required packages
print_status "Installing required packages..."
sudo apt update
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose rsync

# Start Docker service
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER

# Build and start services
print_status "Building and starting services..."
cd deployment
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
if docker ps | grep -q "tiktokshopcrm"; then
    print_status "✅ All services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

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

# Setup SSL certificate
print_status "Setting up SSL certificate..."
print_warning "Make sure your DNS is pointing to this server before running SSL setup"
print_warning "Press Enter when DNS is configured and ready..."
read

sudo certbot --nginx -d ninetails.site -d www.ninetails.site --non-interactive --agree-tos --email your-email@example.com

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/tiktokshopcrm.service > /dev/null <<EOF
[Unit]
Description=TikTok Shop CRM
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable tiktokshopcrm.service
sudo systemctl start tiktokshopcrm.service

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
echo "  - View logs: cd deployment && docker-compose logs -f"
echo "  - Update application: cd deployment && docker-compose down && docker-compose up -d --build"
echo "  - Restart services: sudo systemctl restart tiktokshopcrm"
echo "  - Check status: sudo systemctl status tiktokshopcrm"
echo ""
print_warning "Don't forget to:"
echo "  1. Update your DNS records to point ninetails.site to this server's IP"
echo "  2. Configure your firewall to allow ports 80, 443, and 22"
echo "  3. Set up monitoring and alerting for production use"
