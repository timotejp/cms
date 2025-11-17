# Fixing Portainer Deployment Error

## Problem
Error: `unable to prepare context: path "/data/compose/5/backend" not found`

This happens because Portainer stores the docker-compose.yml in its own directory, but the build context uses relative paths (`./backend`, `./frontend`) which don't exist there.

## Solution Options

### Solution 1: Use Absolute Paths (Recommended)

1. **First, upload all files to your server**:
   ```bash
   # On your Portainer server
   mkdir -p /opt/heating-cms
   # Upload all files to /opt/heating-cms
   # Ensure structure is:
   # /opt/heating-cms/
   #   ├── docker-compose.yml
   #   ├── backend/
   #   ├── frontend/
   #   └── ...
   ```

2. **Use the updated docker-compose file**:
   - Use `docker-compose-portainer.yml` which has absolute paths
   - OR manually edit the docker-compose.yml in Portainer to use absolute paths:
     ```yaml
     backend:
       build:
         context: /opt/heating-cms/backend
         dockerfile: Dockerfile
     
     frontend:
       build:
         context: /opt/heating-cms/frontend
         dockerfile: Dockerfile
     ```

3. **In Portainer**:
   - Go to **Stacks** → **Add Stack** (or edit existing)
   - Paste the updated docker-compose.yml with absolute paths
   - Deploy

### Solution 2: Use Git Repository Method (Best for Updates)

If your code is in a Git repository:

1. **In Portainer**:
   - Go to **Stacks** → **Add Stack**
   - **Stack name**: `heating-cms`
   - **Build method**: Select **Repository** (not Web editor)
   - **Repository URL**: Your Git repository URL
   - **Repository reference**: `main` or `master`
   - **Compose path**: `docker-compose.yml`
   - **Auto-update**: Enable if you want automatic updates
   - Click **Deploy the stack**

2. Portainer will clone the repository and build from there

### Solution 3: Use Portainer's File Browser

1. **Upload files via Portainer**:
   - In Portainer, go to the environment
   - Use **Volumes** or **File Browser** (if available)
   - Upload files to `/opt/heating-cms/`

2. **Then use absolute paths** in docker-compose.yml as in Solution 1

### Solution 4: Manual Docker Build (Alternative)

If Portainer continues to have issues, build images manually:

1. **SSH into your server**:
   ```bash
   cd /opt/heating-cms
   
   # Build backend image
   docker build -t heating-cms-backend ./backend
   
   # Build frontend image
   docker build -t heating-cms-frontend ./frontend
   ```

2. **Update docker-compose.yml to use images**:
   ```yaml
   backend:
     image: heating-cms-backend
     # Remove build section
   
   frontend:
     image: heating-cms-frontend
     # Remove build section
   ```

3. **Deploy in Portainer** with the updated compose file

## Quick Fix Steps (Recommended)

1. **On your server, ensure files are in `/opt/heating-cms/`**:
   ```bash
   ls -la /opt/heating-cms/
   # Should show: backend/, frontend/, docker-compose.yml, etc.
   ```

2. **In Portainer, edit your stack**:
   - Go to **Stacks** → `heating-cms` → **Editor**
   - Replace the build context paths:
     ```yaml
     backend:
       build:
         context: /opt/heating-cms/backend
         dockerfile: Dockerfile
     
     frontend:
       build:
         context: /opt/heating-cms/frontend
         dockerfile: Dockerfile
     ```
   - Also update volume paths:
     ```yaml
     backend:
       volumes:
         - /opt/heating-cms/backend:/app
     ```
   - Click **Update the stack**

3. **Wait for rebuild** - Portainer will rebuild the containers

## Verify File Locations

Before deploying, verify files exist:
```bash
# Check backend files
ls -la /opt/heating-cms/backend/
# Should show: Dockerfile, package.json, src/, etc.

# Check frontend files
ls -la /opt/heating-cms/frontend/
# Should show: Dockerfile, package.json, src/, public/, etc.

# Check docker-compose
cat /opt/heating-cms/docker-compose.yml
```

## Troubleshooting

### Still Getting Errors?

1. **Check file permissions**:
   ```bash
   sudo chown -R $USER:$USER /opt/heating-cms
   chmod -R 755 /opt/heating-cms
   ```

2. **Verify Docker can access the path**:
   ```bash
   docker build /opt/heating-cms/backend
   # Should build successfully
   ```

3. **Check Portainer logs**:
   - In Portainer → **Stacks** → `heating-cms` → **Logs**
   - Look for specific error messages

4. **Try building manually first**:
   ```bash
   cd /opt/heating-cms
   docker-compose build
   # If this works, then Portainer should work too
   ```

## Alternative: Use Pre-built Images

If building continues to be problematic, you can:

1. Build images on your local machine or CI/CD
2. Push to Docker Hub or private registry
3. Update docker-compose.yml to pull images instead of building:
   ```yaml
   backend:
     image: your-registry/heating-cms-backend:latest
     # Remove build section
   ```

---

**Most Common Solution**: Use absolute paths (`/opt/heating-cms/backend` instead of `./backend`) in your docker-compose.yml file in Portainer.

