# Step-by-Step Portainer Deployment Guide

This guide will walk you through deploying the Heating CMS application on Portainer with Nginx Proxy Manager integration.

## Prerequisites

- Portainer installed and accessible
- Nginx Proxy Manager running on a separate VM (same server)
- Docker and Docker Compose installed on the Portainer server
- Access to the server where Portainer is running

## Step 1: Prepare the Application Files

### Option A: Using Git (Recommended)
```bash
# On your Portainer server, clone or download the repository
git clone <your-repo-url> /opt/heating-cms
cd /opt/heating-cms
```

### Option B: Manual Upload
1. Create directory: `/opt/heating-cms`
2. Upload all project files to this directory
3. Ensure the structure matches:
   ```
   /opt/heating-cms/
   ├── docker-compose.yml
   ├── backend/
   ├── frontend/
   └── README.md
   ```

## Step 2: Access Portainer

1. Open your Portainer web interface (usually `http://your-server-ip:9000` or `https://portainer.yourdomain.com`)
2. Log in with your Portainer credentials
3. Select the **Environment** where you want to deploy (usually "local" or "primary")

## Step 3: Create a New Stack

1. In the left sidebar, click on **Stacks**
2. Click the **Add Stack** button (usually a blue "+ Add stack" button)
3. You'll see a form to create a new stack

## Step 4: Configure the Stack

1. **Stack name**: Enter `heating-cms` (or your preferred name)

2. **Build method**: Choose one of the following:

   **Option A: Repository Method (Recommended if you have Git)**
   - Select **Repository**
   - **Repository URL**: Your Git repository URL
   - **Repository reference**: `main` or `master`
   - **Compose path**: `docker-compose.yml`
   - Click **Deploy the stack** and skip to Step 6

   **Option B: Web Editor with Absolute Paths**
   - Select **Web editor**
   - **IMPORTANT**: You must use absolute paths in the docker-compose.yml
   - Copy the `docker-compose.yml` file content
   - **Before pasting**, change the build contexts:
     ```yaml
     backend:
       build:
         context: /opt/heating-cms/backend  # Changed from ./backend
     
     frontend:
       build:
         context: /opt/heating-cms/frontend  # Changed from ./frontend
     ```
   - Also update volume paths:
     ```yaml
     backend:
       volumes:
         - /opt/heating-cms/backend:/app  # Changed from ./backend
     ```
   - Paste the modified content into Portainer web editor

3. **Copy the Docker Compose file** (if using Web editor):
   - Open the `docker-compose.yml` file from your project directory
   - **Modify paths to absolute paths** as shown above
   - Copy the entire contents (Ctrl+A, Ctrl+C)
   - Paste it into the Portainer web editor

4. **Optional - Environment Variables**:
   If you want to customize settings, you can add environment variables in the Portainer interface or edit the docker-compose.yml directly:
   - Change `JWT_SECRET` to a strong random string
   - Change database password `heating_pass` to something secure
   - Update `POSTGRES_PASSWORD` accordingly

## Step 5: Deploy the Stack

1. Scroll down and click **Deploy the stack** button
2. Portainer will start building and deploying the services
3. This process may take 5-10 minutes on first deployment (downloading images, building containers)

## Step 6: Monitor Deployment

1. After clicking deploy, you'll be redirected to the stack details page
2. Click on the stack name `heating-cms` to view details
3. You should see three services:
   - `heating-cms-db` (PostgreSQL)
   - `heating-cms-backend` (API server)
   - `heating-cms-frontend` (React app)

4. Wait for all services to show as **Running** (green status)
   - You can click on each service to view logs
   - Check logs if any service fails to start

## Step 7: Verify Services are Running

1. In Portainer, go to **Containers**
2. Verify you see:
   - `heating-cms-db` - Status: Running
   - `heating-cms-backend` - Status: Running  
   - `heating-cms-frontend` - Status: Running

3. Check the logs of `heating-cms-backend` to ensure:
   - Database connection is successful
   - Migrations completed
   - Server is listening on port 3001

## Step 8: Configure Nginx Proxy Manager

Now you'll set up Nginx Proxy Manager to proxy requests to your application.

### 8.1: Access Nginx Proxy Manager

1. Open your Nginx Proxy Manager web interface
2. Log in with your credentials

### 8.2: Create Proxy Host for Frontend

1. Click **Proxy Hosts** in the top menu
2. Click **Add Proxy Host**

3. **Details Tab**:
   - **Domain Names**: Enter your domain (e.g., `heating-cms.yourdomain.com`)
   - **Scheme**: Select `http`
   - **Forward Hostname/IP**: Enter the IP address of your Portainer server
   - **Forward Port**: Enter `3000` (frontend container port)
   - **Cache Assets**: Check this box (optional)
   - **Block Common Exploits**: Check this box (recommended)
   - **Websockets Support**: Check this box (for real-time features)

4. **SSL Tab**:
   - Request a new SSL certificate
   - Force SSL: Enable
   - HTTP/2 Support: Enable
   - Click **Save**

### 8.3: Create Proxy Host for Backend API

1. Click **Add Proxy Host** again

2. **Details Tab**:
   - **Domain Names**: Enter your API domain (e.g., `api.heating-cms.yourdomain.com` or `heating-cms-api.yourdomain.com`)
   - **Scheme**: Select `http`
   - **Forward Hostname/IP**: Enter the IP address of your Portainer server
   - **Forward Port**: Enter `3001` (backend container port)
   - **Websockets Support**: Check this box

3. **Advanced Tab**:
   - Add custom location if needed:
   ```
   location / {
       proxy_pass http://your-server-ip:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

4. **SSL Tab**:
   - Request a new SSL certificate
   - Force SSL: Enable
   - HTTP/2 Support: Enable
   - Click **Save**

### 8.4: Alternative - Single Domain with Path Routing

If you prefer a single domain, you can configure NPM to route:
- `yourdomain.com/` → Frontend (port 3000)
- `yourdomain.com/api` → Backend (port 3001)

For this setup:
1. Create one proxy host pointing to port 3000
2. In **Advanced** tab, add custom locations:
   ```
   location /api {
       proxy_pass http://your-server-ip:3001/api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   
   location / {
       proxy_pass http://your-server-ip:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
   }
   ```

## Step 9: Update Frontend API Configuration

If you're using separate domains (frontend and API), you need to update the frontend to use the API domain:

1. In Portainer, go to **Stacks** → `heating-cms`
2. Click on the stack name
3. Click **Editor** tab
4. Find the `frontend` service section
5. Add environment variable:
   ```yaml
   frontend:
     # ... existing config ...
     environment:
       REACT_APP_API_URL: https://api.heating-cms.yourdomain.com/api
   ```
6. Click **Update the stack**
7. The frontend container will rebuild automatically

**OR** if using path routing (single domain), the frontend is already configured to use `/api` which will work automatically.

## Step 10: Test the Application

1. **Test Frontend**:
   - Open your browser and navigate to your domain (e.g., `https://heating-cms.yourdomain.com`)
   - You should see the login page

2. **Test Backend**:
   - Visit `https://api.heating-cms.yourdomain.com/health` (or `https://yourdomain.com/api/health` if using path routing)
   - You should see: `{"status":"ok","database":"connected"}`

3. **Login**:
   - Email: `admin@heatingcms.com`
   - Password: `admin123`
   - You should be redirected to the dashboard

## Step 11: Post-Deployment Configuration

### 11.1: Change Default Password

1. Log in to the application
2. Go to Settings (or create a new admin user)
3. Change the default password immediately

### 11.2: Update JWT Secret (Recommended)

1. Generate a strong random string:
   ```bash
   openssl rand -base64 32
   ```

2. In Portainer:
   - Go to **Stacks** → `heating-cms` → **Editor**
   - Find `JWT_SECRET` in the backend environment
   - Replace with your generated secret
   - Click **Update the stack**

3. All users will need to log in again after this change

### 11.3: Configure Database Backup (Optional)

Create a backup script:
```bash
#!/bin/bash
docker exec heating-cms-db pg_dump -U heating_user heating_cms > /backups/heating-cms-$(date +%Y%m%d-%H%M%S).sql
```

## Troubleshooting

### Services Won't Start

1. **Check Logs**:
   - In Portainer, go to **Containers**
   - Click on the failing container
   - Click **Logs** tab
   - Look for error messages

2. **Common Issues**:
   - **Port conflicts**: Ensure ports 3000, 3001 are not in use
   - **Database connection**: Check if postgres container is healthy
   - **Build errors**: Check if all files are present in the directories

### Frontend Shows "Cannot connect to API"

1. Check if backend is running: `docker ps | grep heating-cms-backend`
2. Test backend directly: `curl http://localhost:3001/health`
3. Verify API URL in frontend environment variables
4. Check Nginx Proxy Manager proxy configuration
5. Check browser console for CORS errors

### Database Migration Errors

1. Check backend logs for migration errors
2. You can manually run migrations:
   ```bash
   docker exec heating-cms-backend npm run migrate
   ```

### Nginx Proxy Manager Issues

1. **502 Bad Gateway**:
   - Verify the forward IP and port are correct
   - Check if containers are running
   - Verify network connectivity

2. **SSL Certificate Issues**:
   - Ensure DNS is pointing to your NPM server
   - Check certificate status in NPM
   - Verify domain ownership

## Maintenance

### View Logs
```bash
# In Portainer: Containers → Select container → Logs tab
# Or via command line:
docker logs heating-cms-backend -f
docker logs heating-cms-frontend -f
docker logs heating-cms-db -f
```

### Restart Services
- In Portainer: **Stacks** → `heating-cms` → Click service → **Restart**

### Update Application
1. Pull latest changes (if using git)
2. In Portainer: **Stacks** → `heating-cms` → **Editor** → **Update the stack**

### Backup Database
```bash
docker exec heating-cms-db pg_dump -U heating_user heating_cms > backup.sql
```

### Restore Database
```bash
docker exec -i heating-cms-db psql -U heating_user heating_cms < backup.sql
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET to a strong random value
- [ ] Changed database password
- [ ] SSL certificates configured in NPM
- [ ] Firewall rules configured (only necessary ports exposed)
- [ ] Regular backups scheduled
- [ ] Monitoring set up (optional)

## Support

If you encounter issues:
1. Check the logs in Portainer
2. Verify all services are running
3. Test connectivity between containers
4. Check Nginx Proxy Manager logs
5. Review this guide for common solutions

---

**Congratulations!** Your Heating CMS application should now be running and accessible through Nginx Proxy Manager.

