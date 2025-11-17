# Changelog - Portainer 2.33.3 LTS Compatibility

## Version 2.0.0 - Portainer 2.33.3 LTS Optimized

### ✅ Optimizacije za Portainer 2.33.3 LTS

**Datum**: 2024

#### Docker Compose v2.40.2 Kompatibilnost

- ✅ Dodan `start_period` v health checks (podprto v Compose v2)
- ✅ Health checks za vse storitve (postgres, backend, frontend)
- ✅ Named networks in volumes za lažje upravljanje
- ✅ Optimizirane service dependencies z health conditions

#### Health Checks

**PostgreSQL**:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U heating_user"]
  start_period: 10s  # Čas za inicializacijo
```

**Backend**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
  start_period: 40s  # Čas za migracije in zagon
```

**Frontend**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
  start_period: 30s  # Čas za build in zagon
```

#### Named Resources

- Networks: `heating-cms-network`
- Volumes: `heating-cms-postgres-data`
- Lažje upravljanje in debugging v Portainer

#### Dokumentacija

- ✅ Nov `PORTAINER_2.33.3_SETUP.md` - specifična navodila
- ✅ Posodobljen `QUICK_START.md`
- ✅ Posodobljen `README.md` z kompatibilnostjo
- ✅ Dodan `.portainerignore`

#### Backend Spremembe

- Dodan `wget` v Dockerfile za health checks
- Health endpoint `/health` že obstaja

#### Frontend Spremembe

- nginx:alpine že vključuje wget
- Health check preko root path

### Prejšnje Verzije

#### Version 1.0.0
- Začetna verzija
- Osnovna funkcionalnost
- Relativne poti (ne kompatibilno z Portainer)

---

**Testirano z**:
- Portainer Community Edition 2.33.3 LTS
- Docker Compose v2.40.2
- Docker v28.3.0

