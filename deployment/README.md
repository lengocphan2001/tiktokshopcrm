# TikTok Shop CRM - Deployment Guide

This guide will help you deploy the TikTok Shop CRM application to your VPS using Docker, Nginx, and Let's Encrypt SSL.

## 🚀 Quick Deployment

### Prerequisites

1. **VPS Requirements:**
   - Ubuntu 20.04+ or Debian 11+
   - Minimum 2GB RAM
   - 20GB+ storage
   - Root or sudo access

2. **Domain Configuration:**
   - Domain: `ninetails.site`
   - DNS A record pointing to your VPS IP address

### Step 1: Prepare Your VPS

```bash
# Connect to your VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose
```

### Step 2: Clone and Deploy

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/tiktokshopcrm.git
cd tiktokshopcrm

# Make deployment script executable
chmod +x deployment/deploy.sh

# Run the deployment script
./deployment/deploy.sh
```

### Step 3: Configure Environment Variables

Before running the deployment script, edit the environment file:

```bash
nano deployment/.env
```

Update these values:

```env
# Database Configuration
POSTGRES_PASSWORD=your_secure_postgres_password_here

# JWT Configuration  
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Application Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGIN=https://ninetails.site

# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=https://ninetails.site/api
```

### Step 4: SSL Certificate

The deployment script will automatically:
- Configure Nginx
- Obtain SSL certificate from Let's Encrypt
- Set up automatic renewal

## 📁 Deployment Structure

```
/opt/tiktokshopcrm/
├── deployment/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env
│   └── deploy.sh
├── backend/
├── frontend/
└── logs/
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

### 1. Build and Start Services

```bash
cd deployment
docker-compose up -d
```

### 2. Configure Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/tiktokshopcrm
sudo ln -s /etc/nginx/sites-available/tiktokshopcrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL

```bash
sudo certbot --nginx -d ninetails.site -d www.ninetails.site
```

## 🛠️ Management Commands

### View Logs
```bash
# All services
cd /opt/tiktokshopcrm/deployment && docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
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
sudo systemctl restart tiktokshopcrm
```

### Check Status
```bash
sudo systemctl status tiktokshopcrm
docker ps
```

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Database Security
- Use strong passwords
- Restrict database access to localhost only
- Regular backups

### Application Security
- Keep dependencies updated
- Monitor logs for suspicious activity
- Use HTTPS only
- Implement rate limiting

## 📊 Monitoring

### System Monitoring
```bash
# Check resource usage
htop
df -h
docker stats
```

### Application Monitoring
```bash
# Check application health
curl -I https://ninetails.site
curl -I https://ninetails.site/api/health
```

## 🔄 Updates and Maintenance

### Automatic Updates
The deployment includes:
- Daily backups at 2 AM
- SSL certificate auto-renewal
- Log rotation

### Manual Updates
```bash
# Pull latest code
cd /opt/tiktokshopcrm
git pull origin main

# Rebuild and restart
cd deployment
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl restart nginx
   ```

2. **Database Connection Issues**
   ```bash
   docker-compose logs postgres
   docker exec -it tiktokshopcrm_postgres psql -U tiktokshopcrm_user -d tiktokshopcrm
   ```

3. **Application Not Starting**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

4. **Nginx Issues**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo journalctl -u nginx
   ```

### Reset Everything
```bash
# Stop all services
cd /opt/tiktokshopcrm/deployment
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Re-run deployment
./deployment/deploy.sh
```

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check DNS configuration
4. Ensure firewall allows required ports

## 🎯 Production Checklist

- [ ] Strong passwords configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] DNS records updated
- [ ] Environment variables set
- [ ] Log rotation configured
- [ ] Auto-restart enabled
- [ ] Security headers configured

Your TikTok Shop CRM should now be accessible at **https://ninetails.site**! 🎉
