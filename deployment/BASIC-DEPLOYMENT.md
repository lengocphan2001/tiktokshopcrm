# Basic TikTok Shop CRM Deployment Guide (No Docker)

This guide will help you deploy your TikTok Shop CRM application to your VPS using a simple approach without Docker.

## 🚀 Quick Start

### Prerequisites

1. **VPS Requirements:**
   - Ubuntu 20.04+ or Debian 11+
   - Minimum 2GB RAM
   - 20GB+ storage
   - Root or sudo access

2. **Domain Configuration:**
   - Domain: `ninetails.site`
   - DNS A record pointing to your VPS IP address

## 📋 Step-by-Step Deployment

### Step 1: Connect to Your VPS

```bash
ssh user@your-vps-ip
```

### Step 2: Run the Basic Deployment Script

```bash
# Clone your repository
git clone https://github.com/yourusername/tiktokshopcrm.git
cd tiktokshopcrm

# Make the script executable
chmod +x deployment/basic-deploy.sh

# Run the deployment
./deployment/basic-deploy.sh
```

The script will automatically:
- Install Node.js 22.x, MySQL, Nginx, and PM2
- Set up the database and user
- Install dependencies and build the application
- Configure Nginx as a reverse proxy
- Set up SSL certificates with Let's Encrypt
- Create backup and update scripts

### Step 3: Update Passwords (Important!)

After the deployment completes, update the passwords:

```bash
# Edit the backend environment file
nano /opt/tiktokshopcrm/backend/.env
```

Update these values:
```env
DATABASE_URL=mysql://tiktokshopcrm_user:YOUR_SECURE_PASSWORD@localhost:3306/tiktokshopcrm
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_HERE_MAKE_IT_LONG_AND_RANDOM
```

### Step 4: Update MySQL Password

```bash
# Connect to MySQL as root
sudo mysql

# Change the password
ALTER USER 'tiktokshopcrm_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;

# Restart the backend service
pm2 restart tiktokshopcrm-backend
```

## 🔧 Manual Deployment (Alternative)

If you prefer to deploy manually:

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install -y mysql-server mysql-client

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Setup Database

```bash
# Create database and user
sudo mysql -e "CREATE DATABASE tiktokshopcrm;"
sudo mysql -e "CREATE USER 'tiktokshopcrm_user'@'localhost' IDENTIFIED BY 'your_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON tiktokshopcrm.* TO 'tiktokshopcrm_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 3. Deploy Application

```bash
# Create application directory
sudo mkdir -p /opt/tiktokshopcrm
sudo chown $USER:$USER /opt/tiktokshopcrm

# Copy your application
sudo rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' . /opt/tiktokshopcrm/
sudo chown -R $USER:$USER /opt/tiktokshopcrm

cd /opt/tiktokshopcrm

# Install dependencies
cd backend && npm install && npm install --save-dev @types/bcryptjs @types/node && cd ..
npm install
npm install --save-dev @types/node

# Build frontend with increased memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Create environment file
cat > backend/.env << EOF
DATABASE_URL=mysql://tiktokshopcrm_user:your_password@localhost:3306/tiktokshopcrm
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://ninetails.site
EOF

# Run migrations
cd backend
npx prisma migrate deploy
cd ..
```

### 4. Start Services

```bash
# Start backend
cd backend
pm2 start npm --name "tiktokshopcrm-backend" -- start
cd ..

# Start frontend with increased memory limit
pm2 start npm --name "tiktokshopcrm-frontend" -- start -- --max-old-space-size=4096

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/tiktokshopcrm > /dev/null << 'EOF'
server {
    listen 80;
    server_name ninetails.site www.ninetails.site;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    client_max_body_size 10M;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/tiktokshopcrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Setup SSL

```bash
# Get SSL certificate
sudo certbot --nginx -d ninetails.site -d www.ninetails.site --non-interactive --agree-tos --email your-email@example.com

# Setup auto-renewal
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
```

## 🛠️ Management Commands

### View Logs
```bash
# All services
pm2 logs

# Specific service
pm2 logs tiktokshopcrm-backend
pm2 logs tiktokshopcrm-frontend
```

### Update Application
```bash
sudo /opt/update-tiktokshopcrm.sh
```

### Backup Data
```bash
sudo /opt/backup-tiktokshopcrm.sh
```

### Restart Services
```bash
pm2 restart all
# or restart specific service
pm2 restart tiktokshopcrm-backend
pm2 restart tiktokshopcrm-frontend
```

### Check Status
```bash
pm2 status
pm2 list
```

## 🔒 Security Setup

### Configure Firewall
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Update MySQL Configuration
```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/modify these lines:
bind-address = 127.0.0.1
port = 3306

# Restart MySQL
sudo systemctl restart mysql
```

## 📊 Monitoring

### System Resources
```bash
# Check resource usage
htop
df -h
free -h
```

### Application Health
```bash
# Check if services are running
pm2 status

# Test endpoints
curl -I https://ninetails.site
curl -I https://ninetails.site/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Services Not Starting**
   ```bash
   pm2 logs
   pm2 restart all
   ```

2. **Database Connection Issues**
   ```bash
   sudo mysql -e "SHOW DATABASES;"  # List databases
   sudo mysql -e "SELECT User, Host FROM mysql.user;" # List users
   ```

3. **Nginx Issues**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo journalctl -u nginx
   ```

4. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

### Reset Everything
```bash
# Stop all services
pm2 delete all

# Remove application
sudo rm -rf /opt/tiktokshopcrm

# Remove database
sudo mysql -e "DROP DATABASE IF EXISTS tiktokshopcrm;"
sudo mysql -e "DROP USER IF EXISTS 'tiktokshopcrm_user'@'localhost';"

# Remove Nginx site
sudo rm -f /etc/nginx/sites-enabled/tiktokshopcrm
sudo rm -f /etc/nginx/sites-available/tiktokshopcrm
sudo systemctl restart nginx
```

## 🎯 Production Checklist

- [ ] Strong passwords configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] DNS records updated
- [ ] Environment variables set
- [ ] Log rotation configured
- [ ] Auto-restart enabled
- [ ] Security headers configured

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify environment variables in `/opt/tiktokshopcrm/backend/.env`
3. Check DNS configuration
4. Ensure firewall allows required ports
5. Verify MySQL is running: `sudo systemctl status mysql`

Your TikTok Shop CRM should now be accessible at **https://ninetails.site**! 🎉
