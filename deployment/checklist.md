# Deployment Checklist for ninetails.site

## ✅ Pre-Deployment Checklist

### DNS Configuration
- [ ] A record for `ninetails.site` points to your VPS IP
- [ ] A record for `www.ninetails.site` points to your VPS IP
- [ ] DNS propagation completed (can take up to 48 hours)

### VPS Requirements
- [ ] Ubuntu 20.04+ or Debian 11+
- [ ] Minimum 2GB RAM
- [ ] 20GB+ storage space
- [ ] Root or sudo access
- [ ] Ports 22, 80, 443 open

### Environment Variables
- [ ] `POSTGRES_PASSWORD` - Strong database password
- [ ] `JWT_SECRET` - Long, random JWT secret
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN=https://ninetails.site`
- [ ] `NEXT_PUBLIC_BACKEND_URL=https://ninetails.site/api`

## 🚀 Deployment Steps

### 1. Initial Setup
```bash
# Connect to VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose
```

### 2. Clone Repository
```bash
git clone https://github.com/yourusername/tiktokshopcrm.git
cd tiktokshopcrm
```

### 3. Configure Environment
```bash
# Copy environment template
cp deployment/env.example deployment/.env

# Edit with your values
nano deployment/.env
```

### 4. Run Deployment
```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

## ✅ Post-Deployment Verification

### Service Status
- [ ] Docker containers running: `docker ps`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] SSL certificate valid: `sudo certbot certificates`
- [ ] Application accessible: `curl -I https://ninetails.site`

### Database
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Database accessible from application

### Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Strong passwords set
- [ ] SSL certificate installed

### Monitoring
- [ ] Log rotation configured
- [ ] Backup script working
- [ ] Health check endpoint responding

## 🔧 Testing Checklist

### Frontend
- [ ] Homepage loads: https://ninetails.site
- [ ] Authentication works
- [ ] Dashboard accessible
- [ ] All features functional

### Backend API
- [ ] Health check: https://ninetails.site/api/health
- [ ] Authentication endpoints
- [ ] All API routes working
- [ ] WebSocket connections

### Database
- [ ] Connection established
- [ ] Tables created
- [ ] Data persistence working

## 🛠️ Maintenance Commands

### Daily Operations
```bash
# Check service status
sudo systemctl status tiktokshopcrm

# View logs
cd /opt/tiktokshopcrm/deployment && docker-compose logs -f

# Check disk space
df -h

# Check memory usage
free -h
```

### Weekly Operations
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check SSL certificate
sudo certbot renew --dry-run

# Verify backups
ls -la /opt/backups/tiktokshopcrm/
```

### Monthly Operations
```bash
# Review logs
sudo journalctl -u nginx --since "1 month ago"

# Check security updates
sudo unattended-upgrades --dry-run

# Review disk usage
sudo du -sh /opt/tiktokshopcrm/*
```

## 🚨 Emergency Procedures

### Application Down
```bash
# Restart services
sudo systemctl restart tiktokshopcrm

# Check logs
docker-compose logs -f

# Check resources
htop
df -h
```

### Database Issues
```bash
# Check database status
docker exec -it tiktokshopcrm_postgres psql -U tiktokshopcrm_user -d tiktokshopcrm

# Restore from backup
docker exec -i tiktokshopcrm_postgres psql -U tiktokshopcrm_user -d tiktokshopcrm < backup_file.sql
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Restart Nginx
sudo systemctl restart nginx
```

## 📞 Support Information

### Log Locations
- Application logs: `/opt/tiktokshopcrm/deployment/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

### Configuration Files
- Nginx: `/etc/nginx/sites-available/tiktokshopcrm`
- Environment: `/opt/tiktokshopcrm/deployment/.env`
- Docker Compose: `/opt/tiktokshopcrm/deployment/docker-compose.yml`

### Useful Commands
```bash
# Quick status check
curl -I https://ninetails.site && echo "Frontend OK" || echo "Frontend DOWN"
curl -I https://ninetails.site/api/health && echo "Backend OK" || echo "Backend DOWN"

# Check all services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Monitor resources
watch -n 5 'docker stats --no-stream'
```

## 🎯 Success Criteria

Your deployment is successful when:
- [ ] https://ninetails.site loads without errors
- [ ] All application features work correctly
- [ ] SSL certificate is valid and auto-renewing
- [ ] Backups are running daily
- [ ] Monitoring shows healthy status
- [ ] Security measures are in place
- [ ] Performance is acceptable

**🎉 Congratulations! Your TikTok Shop CRM is now live at https://ninetails.site**
