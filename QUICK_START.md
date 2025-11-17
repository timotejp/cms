# Quick Start Guide - Portainer + Nginx Proxy Manager

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Upload Files to Server
```bash
# On your Portainer server
mkdir -p /opt/heating-cms
# Upload all files to /opt/heating-cms
```

### Step 2: Deploy in Portainer

**IMPORTANT**: You must use absolute paths in docker-compose.yml!

**Option A: Repository Method (if you have Git)**
1. Open Portainer → **Stacks** → **Add Stack**
2. Name: `heating-cms`
3. Build method: **Repository**
4. Repository URL: Your Git repo URL
5. Compose path: `docker-compose.yml`
6. Click **Deploy the stack**

**Option B: Web Editor (with absolute paths)**
1. Open Portainer → **Stacks** → **Add Stack**
2. Name: `heating-cms`
3. Build method: **Web editor**
4. **Edit docker-compose.yml** to use absolute paths:
   - Change `context: ./backend` to `context: /opt/heating-cms/backend`
   - Change `context: ./frontend` to `context: /opt/heating-cms/frontend`
   - Change `- ./backend:/app` to `- /opt/heating-cms/backend:/app`
5. Paste modified content
6. Click **Deploy the stack**
7. Wait 5-10 minutes for build

### Step 3: Configure Nginx Proxy Manager

#### Option A: Separate Domains (Recommended)
- **Frontend**: `heating-cms.yourdomain.com` → `http://portainer-ip:3000`
- **Backend**: `api.heating-cms.yourdomain.com` → `http://portainer-ip:3001`
- Enable SSL for both

#### Option B: Single Domain
- **Domain**: `heating-cms.yourdomain.com` → `http://portainer-ip:3000`
- Add custom location in Advanced tab:
  ```nginx
  location /api {
      proxy_pass http://portainer-ip:3001;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```

### Step 4: Update Frontend (If using Option A)
In Portainer → Stacks → heating-cms → Editor:
```yaml
frontend:
  environment:
    REACT_APP_API_URL: https://api.heating-cms.yourdomain.com/api
```
Click **Update the stack**

### Step 5: Test
- Visit: `https://heating-cms.yourdomain.com`
- Login: `admin@heatingcms.com` / `admin123`
- **⚠️ Change password immediately!**

## 📋 Default Credentials
- **Email**: `admin@heatingcms.com`
- **Password**: `admin123`

## 🔧 Ports Used
- **3000**: Frontend (exposed for NPM)
- **3001**: Backend API (exposed for NPM)
- **5432**: Database (internal only)

## 📚 Full Documentation
- **Complete Setup**: See [PORTAINER_SETUP.md](./PORTAINER_SETUP.md)
- **NPM Configuration**: See [NGINX_PROXY_MANAGER_SETUP.md](./NGINX_PROXY_MANAGER_SETUP.md)

## 🆘 Quick Troubleshooting

**Services not starting?**
- Check logs in Portainer → Containers → [container] → Logs

**502 Bad Gateway?**
- Verify containers are running: `docker ps | grep heating-cms`
- Test direct connection: `curl http://portainer-ip:3001/health`

**Can't connect to API?**
- Check API URL in frontend environment
- Verify NPM proxy configuration
- Check browser console for errors

