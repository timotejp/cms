# Quick Start - Portainer 2.33.3 LTS

## ✅ Kompatibilnost

- **Portainer**: 2.33.3 LTS
- **Docker Compose**: v2.40.2
- **Docker**: v28.3.0+

## 🚀 5-Minutna Namestitev

### 1. Priprava (1 minuta)

```bash
sudo mkdir -p /opt/heating-cms
sudo chown -R $USER:$USER /opt/heating-cms
# Naložite vse datoteke v /opt/heating-cms
```

### 2. Portainer (2 minuti)

1. **Portainer** → **Stacks** → **Add Stack**
2. Ime: `heating-cms`
3. Build: **Web editor**
4. Prilepite `docker-compose.yml` (poti so že absolutne!)
5. **Deploy**

### 3. Počakajte (2 minuti)

- Portainer zgradi slike
- Baza se inicializira
- Migracije se izvedejo
- Vse storitve postanejo "healthy"

### 4. Test

- Frontend: `http://your-server:3000`
- Backend: `http://your-server:3001/health`
- Login: `admin@heatingcms.com` / `admin123`

## 📋 Ključne Lastnosti za Portainer 2.33.3

✅ **Health Checks** - Vsi servisi imajo health checks
✅ **Service Dependencies** - Pravilen vrstni red zaganjanja
✅ **Named Resources** - Networks in volumes z imeni
✅ **Absolute Paths** - Vse poti so absolutne

## 🔧 Troubleshooting

**"unable to prepare context"**?
→ Preverite, da so datoteke v `/opt/heating-cms/`

**Health checks ne delujejo**?
→ Počakajte na `start_period` (10-40 sekund)

**Storitve se ne zaganjajo**?
→ Preverite loge v Portainer UI

## 📚 Več Informacij

- **Podrobna navodila**: [PORTAINER_2.33.3_SETUP.md](./PORTAINER_2.33.3_SETUP.md)
- **Nginx Proxy Manager**: [NGINX_PROXY_MANAGER_SETUP.md](./NGINX_PROXY_MANAGER_SETUP.md)

---

**Testirano z**: Portainer 2.33.3 LTS ✅
