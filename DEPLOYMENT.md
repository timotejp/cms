# Deployment Guide for Portainer

## Quick Deployment Steps

### Option 1: Using Portainer Web UI

1. **Access Portainer**
   - Open your Portainer web interface
   - Navigate to **Stacks** in the left sidebar

2. **Create New Stack**
   - Click **Add Stack**
   - Name: `heating-cms` (or your preferred name)
   - Build Method: Select **Web editor**

3. **Copy Docker Compose Configuration**
   - Open the `docker-compose.yml` file from this repository
   - Copy its entire contents
   - Paste into the Portainer web editor

4. **Deploy**
   - Click **Deploy the stack**
   - Wait for all services to start (this may take a few minutes on first deployment)

5. **Access the Application**
   - Frontend: `http://your-server-ip:3000`
   - Backend API: `http://your-server-ip:3001`
   - Default login:
     - Email: `admin@heatingcms.com`
     - Password: `admin123`

### Option 2: Using Docker Compose CLI

```bash
# Navigate to the project directory
cd /path/to/heating-cms

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Service Details

### Services Running:
- **postgres**: PostgreSQL 15 database
- **backend**: Node.js/Express API server (port 3001)
- **frontend**: React application served via Nginx (port 3000)

### Database:
- Database: `heating_cms`
- User: `heating_user`
- Password: `heating_pass`
- Port: `5432`

**⚠️ Important**: Change the database password in production!

## Post-Deployment

1. **Change Default Password**
   - Log in with default credentials
   - Create a new admin user or change the password

2. **Configure Notifications** (Optional)
   - Go to Settings
   - Configure SMTP for email notifications
   - Configure Twilio for SMS notifications

3. **Update JWT Secret** (Recommended)
   - Edit `docker-compose.yml`
   - Change `JWT_SECRET` environment variable
   - Restart the backend service

## Troubleshooting

### Services Not Starting
- Check logs: `docker-compose logs [service-name]`
- Verify ports 3000, 3001, and 5432 are not in use
- Check Docker resources (memory, disk space)

### Database Connection Issues
- Ensure PostgreSQL container is healthy
- Check database credentials in `docker-compose.yml`
- Verify network connectivity between containers

### Frontend Not Loading
- Check if backend is running: `curl http://localhost:3001/health`
- Verify nginx proxy configuration
- Check browser console for errors

### API Authentication Errors
- Verify JWT_SECRET is set correctly
- Clear browser localStorage and re-login
- Check backend logs for token validation errors

## Updating the Application

1. **Pull Latest Changes** (if using git)
   ```bash
   git pull
   ```

2. **Rebuild and Restart**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Backup Database

```bash
# Create backup
docker exec heating-cms-db pg_dump -U heating_user heating_cms > backup.sql

# Restore backup
docker exec -i heating-cms-db psql -U heating_user heating_cms < backup.sql
```

## Monitoring

- View all container logs: `docker-compose logs -f`
- View specific service: `docker-compose logs -f backend`
- Check container status: `docker-compose ps`

## Production Recommendations

1. **Use Environment Variables File**
   - Create `.env` file with sensitive data
   - Update `docker-compose.yml` to use `env_file`

2. **Enable HTTPS**
   - Use reverse proxy (Traefik, Nginx Proxy Manager)
   - Configure SSL certificates

3. **Database Backups**
   - Set up automated daily backups
   - Store backups in secure location

4. **Resource Limits**
   - Add resource limits to docker-compose.yml
   - Monitor container resource usage

5. **Security**
   - Change all default passwords
   - Use strong JWT secret
   - Restrict database access
   - Enable firewall rules


