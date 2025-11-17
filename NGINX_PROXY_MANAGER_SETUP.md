# Nginx Proxy Manager Configuration Guide

This guide provides detailed instructions for configuring Nginx Proxy Manager to work with the Heating CMS application.

## Architecture Overview

```
Internet
   ↓
Nginx Proxy Manager (VM 1)
   ↓
Portainer Server (VM 2)
   ├── Frontend Container (port 3000)
   └── Backend Container (port 3001)
```

## Option 1: Separate Domains (Recommended)

Use two separate domains/subdomains for frontend and API.

### Frontend Proxy Host

1. **Domain**: `heating-cms.yourdomain.com`
2. **Forward to**: `http://portainer-server-ip:3000`
3. **SSL**: Enable with Let's Encrypt

### Backend API Proxy Host

1. **Domain**: `api.heating-cms.yourdomain.com` (or `heating-cms-api.yourdomain.com`)
2. **Forward to**: `http://portainer-server-ip:3001`
3. **SSL**: Enable with Let's Encrypt
4. **Advanced Settings**:
   ```nginx
   # Add custom headers if needed
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

### Update Frontend Environment

In Portainer, update the frontend service to use the API domain:

```yaml
frontend:
  environment:
    REACT_APP_API_URL: https://api.heating-cms.yourdomain.com/api
```

Then update the stack in Portainer.

## Option 2: Single Domain with Path Routing

Use a single domain with `/api` path for the backend.

### Single Proxy Host Configuration

1. **Domain**: `heating-cms.yourdomain.com`
2. **Forward to**: `http://portainer-server-ip:3000`
3. **SSL**: Enable with Let's Encrypt

### Advanced Tab - Custom Locations

Add these custom locations in the Advanced tab:

```nginx
# API requests go to backend
location /api {
    proxy_pass http://portainer-server-ip:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# All other requests go to frontend
location / {
    proxy_pass http://portainer-server-ip:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Note**: With this setup, the frontend is already configured to use `/api` automatically, so no environment variable changes are needed.

## Detailed NPM Configuration Steps

### Step 1: Access Nginx Proxy Manager

1. Open your NPM web interface
2. Log in with your admin credentials

### Step 2: Create Frontend Proxy Host

1. Click **Proxy Hosts** in the top menu
2. Click **Add Proxy Host** (green button)

3. **Details Tab**:
   ```
   Domain Names: heating-cms.yourdomain.com
   Scheme: http
   Forward Hostname/IP: [IP of your Portainer server]
   Forward Port: 3000
   Cache Assets: ✓ (checked)
   Block Common Exploits: ✓ (checked)
   Websockets Support: ✓ (checked)
   ```

4. **SSL Tab**:
   - **SSL Certificate**: Request a new SSL Certificate with Let's Encrypt
   - **Force SSL**: ✓ (checked)
   - **HTTP/2 Support**: ✓ (checked)
   - **HSTS Enabled**: ✓ (recommended)
   - **HSTS Subdomains**: ✓ (optional)

5. Click **Save**

### Step 3: Create Backend API Proxy Host

1. Click **Add Proxy Host** again

2. **Details Tab**:
   ```
   Domain Names: api.heating-cms.yourdomain.com
   Scheme: http
   Forward Hostname/IP: [IP of your Portainer server]
   Forward Port: 3001
   Cache Assets: ✗ (unchecked - API responses shouldn't be cached)
   Block Common Exploits: ✓ (checked)
   Websockets Support: ✓ (checked)
   ```

3. **Advanced Tab** (Optional - for custom headers):
   ```nginx
   # These are usually set automatically, but you can add:
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

4. **SSL Tab**:
   - **SSL Certificate**: Request a new SSL Certificate with Let's Encrypt
   - **Force SSL**: ✓ (checked)
   - **HTTP/2 Support**: ✓ (checked)

5. Click **Save**

### Step 4: DNS Configuration

Ensure your DNS records point to your Nginx Proxy Manager server:

```
Type    Name                        Value
A       heating-cms                 [NPM Server IP]
A       api.heating-cms             [NPM Server IP]
```

Or if using CNAME:
```
Type    Name                        Value
CNAME   heating-cms                 [NPM Server FQDN]
CNAME   api.heating-cms             [NPM Server FQDN]
```

### Step 5: Update Frontend Configuration

If using separate domains (Option 1), update the frontend:

1. In Portainer, go to **Stacks** → `heating-cms`
2. Click on the stack name
3. Click **Editor** tab
4. Find the `frontend` service
5. Add environment variable:
   ```yaml
   frontend:
     build:
       context: ./frontend
       dockerfile: Dockerfile
     container_name: heating-cms-frontend
     ports:
       - "3000:80"
     environment:
       REACT_APP_API_URL: https://api.heating-cms.yourdomain.com/api
     depends_on:
       - backend
     restart: unless-stopped
     networks:
       - heating-cms-network
   ```
6. Click **Update the stack**
7. Wait for the frontend to rebuild (this may take a few minutes)

## Testing the Configuration

### Test Frontend
```bash
curl -I https://heating-cms.yourdomain.com
# Should return 200 OK
```

### Test Backend API
```bash
curl https://api.heating-cms.yourdomain.com/health
# Should return: {"status":"ok","database":"connected"}
```

Or if using path routing:
```bash
curl https://heating-cms.yourdomain.com/api/health
# Should return: {"status":"ok","database":"connected"}
```

### Test from Browser

1. Open `https://heating-cms.yourdomain.com`
2. Open browser Developer Tools (F12)
3. Go to **Network** tab
4. Try to log in
5. Check if API requests are going to the correct endpoint
6. Verify there are no CORS errors

## Troubleshooting

### 502 Bad Gateway

**Cause**: NPM can't reach the backend/frontend containers

**Solutions**:
1. Verify containers are running:
   ```bash
   docker ps | grep heating-cms
   ```
2. Test direct connection from NPM server:
   ```bash
   curl http://portainer-server-ip:3000
   curl http://portainer-server-ip:3001/health
   ```
3. Check firewall rules on Portainer server
4. Verify IP address in NPM proxy host settings

### SSL Certificate Issues

**Cause**: DNS not pointing correctly or domain not accessible

**Solutions**:
1. Verify DNS records:
   ```bash
   nslookup heating-cms.yourdomain.com
   nslookup api.heating-cms.yourdomain.com
   ```
2. Ensure ports 80 and 443 are open on NPM server
3. Check NPM logs for certificate errors
4. Try manual certificate request in NPM

### CORS Errors

**Cause**: Frontend and API on different domains without proper CORS headers

**Solutions**:
1. If using separate domains, ensure backend has CORS configured (already done)
2. Check browser console for specific CORS error
3. Verify API URL in frontend environment variable

### API Requests Failing

**Cause**: Incorrect API URL or proxy configuration

**Solutions**:
1. Check browser Network tab to see actual API requests
2. Verify `REACT_APP_API_URL` environment variable
3. Check NPM proxy host configuration
4. Test API endpoint directly: `curl https://api-domain/api/health`

## Security Recommendations

1. **Enable SSL**: Always use HTTPS in production
2. **Force SSL**: Redirect HTTP to HTTPS
3. **HSTS**: Enable HTTP Strict Transport Security
4. **Block Common Exploits**: Enable in NPM
5. **Rate Limiting**: Consider adding rate limiting for API endpoints
6. **IP Whitelisting**: Optionally restrict admin access by IP

## Performance Optimization

1. **Cache Static Assets**: Enable in frontend proxy host
2. **Gzip Compression**: Usually enabled by default in NPM
3. **HTTP/2**: Enable for better performance
4. **CDN**: Consider using a CDN for static assets (future enhancement)

## Monitoring

Monitor your proxy hosts in NPM:
- Check access logs
- Monitor SSL certificate expiration
- Set up alerts for proxy host failures
- Monitor response times

---

For complete deployment instructions, see [PORTAINER_SETUP.md](./PORTAINER_SETUP.md)

