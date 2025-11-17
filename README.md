# Heating CMS - Modern Client Management System

Sistem za upravljanje strank za serviserje ogrevalnih sistemov. Moderna aplikacija z enostavnim uporabniškim vmesnikom.

## Funkcionalnosti

- ✅ **Upravljanje strank** - Dodajanje, urejanje in upravljanje strank
- ✅ **Upravljanje naprav** - AC, toplotne črpalke, plinski kotli, gorilniki, po meri
- ✅ **Upravljanje nalog** - Hitra in napredna kreacija nalog
- ✅ **Statistika** - Pregled vseh ključnih metrik
- ✅ **Nastavitve obvestil** - Email, SMS in aplikacijska obvestila
- ✅ **Slovenski vmesnik** - Popolna podpora za slovenščino
- ✅ **Modern UI** - Čist in enostaven uporabniški vmesnik

## Tehnologije

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

## Hitra namestitev

### 1. Priprava datotek

```bash
# Na vašem Portainer strežniku
mkdir -p /opt/heating-cms
# Naložite vse datoteke v /opt/heating-cms
```

### 2. Namestitev v Portainer

1. Odprite Portainer → **Stacks** → **Add Stack**
2. Ime: `heating-cms`
3. Build method: **Web editor**
4. **POMEMBNO**: Uporabite absolutne poti v docker-compose.yml:
   - `context: /opt/heating-cms/backend`
   - `context: /opt/heating-cms/frontend`
5. Kliknite **Deploy the stack**

### 3. Konfiguracija Nginx Proxy Manager

- Frontend: `heating-cms.yourdomain.com` → `http://portainer-ip:3000`
- Backend: `api.heating-cms.yourdomain.com` → `http://portainer-ip:3001`

### 4. Privzeti dostop

- Email: `admin@heatingcms.com`
- Geslo: `admin123`
- **⚠️ Spremenite geslo takoj po prvi prijavi!**

## Struktura projekta

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Konfiguracija baze
│   │   ├── migrations/       # Migracije baze
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   └── server.ts         # Express server
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React komponente
│   │   ├── pages/           # Strani
│   │   ├── context/         # React context
│   │   └── locales/         # Prevodi
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

- `POST /api/auth/login` - Prijava
- `POST /api/auth/register` - Registracija
- `GET /api/clients` - Seznam strank
- `GET /api/devices` - Seznam naprav
- `GET /api/tasks` - Seznam nalog
- `GET /api/statistics/dashboard` - Statistika
- `GET /api/settings/notifications` - Nastavitve obvestil

## Podprte znamke in modeli

- **Klimatizacija**: Daikin, Mitsubishi Electric, Panasonic, LG, Samsung
- **Toplotne črpalke**: Vaillant, Viessmann
- **Plinski kotli**: Vaillant, Viessmann, Bosch, Buderus, Junkers
- **Gorilniki**: Weishaupt, Riello
- **Po meri**: Možnost dodajanja lastnih znamk in modelov

## Varnost

- Spremenite privzeto geslo
- Posodobite JWT_SECRET v produkciji
- Uporabite HTTPS preko Nginx Proxy Manager
- Redno varnostno kopiranje baze

## Podpora

Za podrobnejša navodila glejte:
- `PORTAINER_SETUP.md` - Podrobna navodila za Portainer
- `NGINX_PROXY_MANAGER_SETUP.md` - Konfiguracija NPM
