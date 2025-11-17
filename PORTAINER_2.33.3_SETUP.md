# Portainer 2.33.3 LTS - Deployment Guide

## Specifikacije Portainerja

- **Server Version**: 2.33.3 LTS
- **Database Version**: 2.33.3
- **Docker Compose**: v2.40.2
- **Docker**: v28.3.0

## Kompatibilnost

Ta konfiguracija je optimizirana za Portainer 2.33.3 LTS in uporablja:
- ✅ Docker Compose v2.40.2 specifikacijo
- ✅ Health checks z `start_period` (podprto v Compose v2)
- ✅ `depends_on` z `condition: service_healthy`
- ✅ Absolutne poti za build context
- ✅ Named networks in volumes

## Hitra Namestitev

### 1. Priprava Datotek

```bash
# Na vašem Portainer strežniku
sudo mkdir -p /opt/heating-cms
sudo chown -R $USER:$USER /opt/heating-cms

# Naložite vse datoteke v /opt/heating-cms
# Struktura mora biti:
# /opt/heating-cms/
#   ├── docker-compose.yml
#   ├── backend/
#   │   ├── Dockerfile
#   │   ├── package.json
#   │   └── src/
#   └── frontend/
#       ├── Dockerfile
#       ├── package.json
#       └── src/
```

### 2. Preverjanje Dovoljenj

```bash
# Preverite, da ima Portainer dostop do map
ls -la /opt/heating-cms
ls -la /opt/heating-cms/backend
ls -la /opt/heating-cms/frontend

# Če je potrebno, nastavite dovoljenja
sudo chmod -R 755 /opt/heating-cms
```

### 3. Namestitev v Portainer 2.33.3

1. **Odprite Portainer** → **Stacks** → **Add Stack**

2. **Osnovne Nastavitve**:
   - **Stack name**: `heating-cms`
   - **Build method**: **Web editor** (ali **Repository** če imate Git)

3. **Če uporabljate Web Editor**:
   - Odprite `docker-compose.yml` iz `/opt/heating-cms/`
   - Kopirajte celotno vsebino
   - Prilepite v Portainer web editor
   - **POMEMBNO**: Poti so že absolutne (`/opt/heating-cms/...`)

4. **Če uporabljate Repository Method**:
   - **Repository URL**: Vaš Git repository URL
   - **Repository reference**: `main` ali `master`
   - **Compose path**: `docker-compose.yml`
   - **Auto-update**: Opcijsko omogočite

5. **Environment Variables** (Opcijsko):
   - V Portainer lahko dodate environment variables preko UI
   - Ali jih uredite direktno v docker-compose.yml

6. **Deploy**:
   - Kliknite **Deploy the stack**
   - Portainer bo uporabil Docker Compose v2.40.2

### 4. Spremljanje Namestitve

1. Po kliku na **Deploy** boste preusmerjeni na stack details
2. Videli boste tri storitve:
   - `heating-cms-db` (PostgreSQL)
   - `heating-cms-backend` (API)
   - `heating-cms-frontend` (React app)

3. **Health Checks**:
   - Portainer 2.33.3 podpira health checks
   - Storitve bodo prikazane kot "healthy" ko so pripravljene
   - Backend čaka na database (health check)
   - Frontend čaka na backend (health check)

4. **Logs**:
   - Kliknite na vsako storitev za pregled logov
   - Preverite, da se migracije izvedejo uspešno

## Funkcionalnosti Portainer 2.33.3

### Podprte Funkcije

✅ **Health Checks**:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U heating_user"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s  # Podprto v Compose v2
```

✅ **Service Dependencies**:
```yaml
depends_on:
  postgres:
    condition: service_healthy
```

✅ **Named Networks & Volumes**:
```yaml
networks:
  heating-cms-network:
    name: heating-cms-network

volumes:
  postgres_data:
    name: heating-cms-postgres-data
```

### Optimizacije za Portainer 2.33.3

1. **Build Context**:
   - Uporabljamo absolutne poti (`/opt/heating-cms/backend`)
   - Portainer 2.33.3 pravilno obravnava absolutne poti

2. **Health Checks**:
   - Vsi servisi imajo health checks
   - `start_period` omogoča čas za inicializacijo

3. **Restart Policies**:
   - `restart: unless-stopped` za vse storitve
   - Portainer 2.33.3 pravilno upravlja restart policies

## Troubleshooting

### Problem: "unable to prepare context"

**Rešitev**:
- Preverite, da so datoteke v `/opt/heating-cms/`
- Preverite dovoljenja: `ls -la /opt/heating-cms`
- Uporabite absolutne poti v docker-compose.yml

### Problem: Health checks ne delujejo

**Rešitev**:
- Preverite, da Docker Compose v2.40.2 podpira `start_period`
- Preverite loge storitev
- Počakajte na `start_period` čas

### Problem: Storitve se ne zaganjajo v pravilnem vrstnem redu

**Rešitev**:
- Preverite `depends_on` z `condition: service_healthy`
- Preverite health check definicije
- Preverite loge za napake

### Problem: Build ne uspe

**Rešitev**:
- Preverite, da so Dockerfile datoteke prisotne
- Preverite, da so package.json datoteke prisotne
- Preverite loge build procesa v Portainer

## Preverjanje Verzije

V Portainer UI:
1. Kliknite na vaš **Environment**
2. Pojdite na **About**
3. Preverite **Server Version**: 2.33.3 LTS

Ali preko API:
```bash
curl -X GET http://portainer-url:9000/api/status
```

## Posodobitve

Ko posodobite aplikacijo:

1. **V Portainer**:
   - Pojdite na **Stacks** → `heating-cms`
   - Kliknite **Editor**
   - Posodobite docker-compose.yml
   - Kliknite **Update the stack**

2. **Ali preko Git** (če uporabljate Repository method):
   - Push spremembe v Git
   - Portainer bo samodejno posodobil (če je omogočeno Auto-update)

## Varnost

Za produkcijo:
1. Spremenite `JWT_SECRET` v docker-compose.yml
2. Spremenite database geslo
3. Uporabite HTTPS preko Nginx Proxy Manager
4. Redno varnostno kopirajte bazo

## Podpora

Za dodatno pomoč:
- Portainer dokumentacija: https://docs.portainer.io/
- Portainer 2.33.3 LTS release notes
- Preverite loge v Portainer UI

---

**Testirano z**: Portainer Community Edition 2.33.3 LTS
**Docker Compose**: v2.40.2
**Datum**: 2024

